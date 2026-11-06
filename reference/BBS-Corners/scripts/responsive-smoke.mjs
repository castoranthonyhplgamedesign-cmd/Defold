import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import { createServer } from 'vite';

const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].find((candidate) => fs.existsSync(candidate));
const artifactDir = path.resolve('qa-artifacts/responsive');
fs.mkdirSync(artifactDir, { recursive: true });

// Expose the live game only in this test server, leaving production globals untouched.
const server = await createServer({
  server: { host: '127.0.0.1', port: 0, hmr: false, watch: { ignored: ['**/.build-tmp/**'] } },
  plugins: [{
    name: 'responsive-qa',
    transform(code, id) {
      if (!id.replaceAll('\\', '/').endsWith('/src/main.ts')) return;
      return code.replace('const game = new GameApp(runtime);',
        'const game = new GameApp(runtime); window.__responsiveQa = { runtime, game };');
    },
  }],
});
let browser;
try {
  await server.listen();
  browser = await chromium.launch({ headless: true, executablePath });
  const url = server.resolvedUrls.local[0];
  for (const [portrait, landscape] of [
    [{ width: 390, height: 844 }, { width: 844, height: 390 }],
    [{ width: 768, height: 1024 }, { width: 1024, height: 768 }],
    [{ width: 360, height: 640 }, { width: 640, height: 360 }],
  ]) {
    const context = await browser.newContext({ viewport: landscape, deviceScaleFactor: 2 });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(url);
    await page.waitForFunction(() => window.__responsiveQa?.runtime.scene.getFrameId() > 2);
    await page.waitForTimeout(800);
    const coldLandscape = await readLayout(page);
    assertBoardFits(coldLandscape);
    await assertRemovalVfx(page, portrait, landscape);
    await prepareHandHint(page);
    const landscapeHand = await assertHandHint(page);
    for (let rotation = 0; rotation < 3; rotation += 1) {
      await page.setViewportSize(portrait);
      await page.waitForTimeout(800);
      assertBoardFits(await readLayout(page));
      const portraitHand = await assertHandHint(page);
      assert.ok(portraitHand.width > landscapeHand.width, 'hand shrinks with the landscape board');
      assertNear(portraitHand.width / portraitHand.cellSize, landscapeHand.width / landscapeHand.cellSize, 'hand size relative to cells');
      await page.setViewportSize(landscape);
      await page.waitForTimeout(800);
      const rotated = await readLayout(page);
      assertBoardFits(rotated);
      assertNear(rotated.board.top, coldLandscape.board.top, 'rotated board top');
      assertNear(rotated.board.bottom, coldLandscape.board.bottom, 'rotated board bottom');
      assertNear(rotated.cameraZ, coldLandscape.cameraZ, 'rotated camera Z');
      await assertHandHint(page);
      const otherTab = await context.newPage();
      await otherTab.bringToFront();
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, value: true });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await page.bringToFront();
      await page.evaluate(() => {
        Object.defineProperty(document, 'hidden', { configurable: true, value: false });
        document.dispatchEvent(new Event('visibilitychange'));
        window.dispatchEvent(new Event('pageshow'));
      });
      await page.waitForTimeout(800);
      const resumed = await readLayout(page);
      assertBoardFits(resumed);
      assertNear(resumed.board.top, coldLandscape.board.top, 'resumed board top');
      assertNear(resumed.cameraZ, coldLandscape.cameraZ, 'resumed camera Z');
      await assertHandHint(page);
      await otherTab.close();
    }
    await page.screenshot({ path: path.join(artifactDir, `hand-${landscape.width}x${landscape.height}.png`) });
    await page.setViewportSize(portrait);
    await page.waitForTimeout(800);
    await assertHandHint(page);
    await page.screenshot({ path: path.join(artifactDir, `hand-${portrait.width}x${portrait.height}.png`) });
    await page.evaluate(() => {
      const { game } = window.__responsiveQa;
      game.handPointer.hide();
      game.hintVisible = false;
      game.showNextHint();
    });
    await page.waitForTimeout(1500);
    assert.equal(await page.locator('.hand-pointer').evaluate((element) => element.classList.contains('is-visible')), false,
      'a new hint still finishes and hides on its original timer');
    await page.setViewportSize(landscape);
    await page.waitForTimeout(800);
    // Exercise the controller so footer hiding is verified with the actual end card.
    await page.evaluate(() => window.__responsiveQa.game.showEndcard(true));
    await page.waitForTimeout(1700);
    await assertEndcard(page, landscape);
    await page.screenshot({ path: path.join(artifactDir, `endcard-${landscape.width}x${landscape.height}.png`) });
    await page.setViewportSize(portrait);
    await page.waitForTimeout(800);
    await assertEndcard(page, portrait);
    await page.screenshot({ path: path.join(artifactDir, `endcard-${portrait.width}x${portrait.height}.png`) });
    assert.deepEqual(errors, [], 'browser errors');
    console.log(`Responsive QA passed: ${portrait.width}x${portrait.height} / ${landscape.width}x${landscape.height}, rotations, removal VFX, tab resume, hand alignment/scaling/animation, end card.`);
    await context.close();
  }
} finally {
  await browser?.close();
  await server.close();
}

async function assertRemovalVfx(page, portrait, landscape) {
  await page.evaluate(async () => {
    const { game, runtime } = window.__responsiveQa;
    const { wideUScene } = await import('/src/data/wideUScene.ts');
    const originalNow = performance.now.bind(performance);
    window.__vfxQa = { originalNow, now: originalNow() };
    // Hold particle age steady so movement caused by rotation can be isolated.
    performance.now = () => window.__vfxQa.now;
    for (const id of ['gate_red', 'gate_white_left', 'gate_black_right']) {
      const gate = wideUScene.gates.find((candidate) => candidate.id === id);
      game.createSubmissionVfx(gate, gate.color);
    }
    window.__vfxQa.particles = runtime.scene.meshes.filter((mesh) => mesh.name.startsWith('submission-smoke-vfx-'));
    window.__vfxQa.now += 200;
  });
  await page.waitForTimeout(60);
  const before = await readVfx(page);
  assert.equal(before.particles.length, 45, 'three gate effects spawn all particles');
  assert.ok(before.visible > 0 && before.visible < 45, 'check both active and delayed particles');
  for (const viewport of [portrait, landscape]) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(800);
    assertVfxFollowsBoard(before, await readVfx(page));
  }
  await page.evaluate(() => { window.__vfxQa.now += 400; });
  await page.waitForTimeout(60);
  const emitted = await readVfx(page);
  assert.equal(emitted.visible, 45, 'delayed emissions become visible after rotation');
  for (const viewport of [portrait, landscape]) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(800);
    assertVfxFollowsBoard(emitted, await readVfx(page));
  }
  await page.evaluate(() => { window.__vfxQa.now += 2500; });
  await page.waitForTimeout(60);
  assert.equal(await page.evaluate(() => window.__vfxQa.particles.every((particle) => particle.isDisposed())), true,
    'all particles finish and dispose after rotation');
  await page.evaluate(() => {
    performance.now = window.__vfxQa.originalNow;
    window.__responsiveQa.game.lastTime = performance.now();
  });
}

async function readVfx(page) {
  return page.evaluate(() => {
    const { game } = window.__responsiveQa;
    const root = game.boardRoot;
    root.computeWorldMatrix(true);
    const rootPosition = root.getAbsolutePosition();
    const screenRoot = game.projectWorldToCanvasPoint(rootPosition);
    const screenRight = game.projectWorldToCanvasPoint(rootPosition.add(new rootPosition.constructor(1, 0, 0)));
    const cellSize = Math.hypot(screenRight.x - screenRoot.x, screenRight.y - screenRoot.y);
    return {
      root: rootPosition.asArray(),
      visible: window.__vfxQa.particles.filter((mesh) => mesh.visibility > 0).length,
      particles: window.__vfxQa.particles.map((mesh) => {
        mesh.computeWorldMatrix(true);
        const projected = mesh.getBoundingInfo().boundingBox.vectorsWorld.map((point) => game.projectWorldToCanvasPoint(point));
        const width = Math.max(...projected.map((point) => point.x)) - Math.min(...projected.map((point) => point.x));
        return { world: mesh.getAbsolutePosition().asArray(), relativeSize: width / cellSize };
      }),
    };
  });
}

function assertVfxFollowsBoard(before, after) {
  for (let i = 0; i < before.particles.length; i += 1) {
    for (let axis = 0; axis < 3; axis += 1) {
      const offsetBefore = before.particles[i].world[axis] - before.root[axis];
      const offsetAfter = after.particles[i].world[axis] - after.root[axis];
      assert.ok(Math.abs(offsetBefore - offsetAfter) < 0.001,
        `particle ${i} drifted from its gate on axis ${axis}: ${offsetBefore} -> ${offsetAfter}`);
    }
    assert.ok(Math.abs(before.particles[i].relativeSize - after.particles[i].relativeSize) < 0.01,
      `particle ${i} no longer scales with the board`);
  }
}

async function prepareHandHint(page) {
  await page.evaluate(() => {
    const { game } = window.__responsiveQa;
    game.clearHintReplayTimeout();
    game.handPointer.hide();
    game.hintVisible = false;
    game.hintDelaySeconds = Infinity;
    const candidate = game.hintPlanner.findHint();
    game.showNextHint();
    // Hold a real hint mid-animation while checking its geometry over multiple rotations.
    game.clearHintReplayTimeout();
    const animation = document.querySelector('.hand-pointer').getAnimations()[0];
    animation.pause();
    animation.currentTime = 625;
    window.__handQa = { brickId: candidate.hintBrickId, animation };
  });
}

async function assertHandHint(page) {
  const hand = await page.evaluate(() => {
    const { game } = window.__responsiveQa;
    const { brickId, animation } = window.__handQa;
    const brick = game.board.getBrick(brickId);
    const node = game.brickNodes.get(brickId);
    node.computeWorldMatrix(true);
    const center = brick.cells.reduce((sum, cell) => ({ x: sum.x + cell.x, z: sum.z + cell.z }), { x: 0, z: 0 });
    const point = node.getAbsolutePosition().clone();
    point.x += center.x / brick.cells.length - brick.origin.x;
    point.y += 0.95;
    point.z += center.z / brick.cells.length - brick.origin.z;
    const screen = game.projectWorldToCanvasPoint(point);
    const cellRight = game.projectWorldToCanvasPoint(point.add(new point.constructor(1, 0, 0)));
    const element = document.querySelector('.hand-pointer');
    const style = getComputedStyle(element);
    const width = parseFloat(style.width);
    const scale = width / 76;
    return {
      expectedX: screen.x, expectedY: screen.y,
      actualX: parseFloat(style.getPropertyValue('--hand-start-x')) - 4 * scale,
      actualY: parseFloat(style.getPropertyValue('--hand-start-y')) - 25 * scale,
      width, cellSize: Math.hypot(cellRight.x - screen.x, cellRight.y - screen.y),
      sameAnimation: element.getAnimations()[0] === animation,
      animationTime: animation.currentTime,
      visible: parseFloat(style.opacity) > 0.99,
    };
  });
  assertNear(hand.actualX, hand.expectedX, 'hand X follows the target brick');
  assertNear(hand.actualY, hand.expectedY, 'hand Y follows the target brick');
  assert.ok(hand.sameAnimation && hand.visible, 'relayout preserves the active animation without flicker');
  assertNear(hand.animationTime, 625, 'relayout preserves animation progress');
  return hand;
}

async function readLayout(page) {
  return page.evaluate(() => {
    const { game, runtime } = window.__responsiveQa;
    const board = game.getProjectedBoardClearanceBounds(game.getBoardRootSizing());
    const header = document.querySelector('.ad-header').getBoundingClientRect();
    const footer = document.querySelector('.ad-footer').getBoundingClientRect();
    const camera = runtime.camera;
    return {
      board, headerBottom: header.bottom, footerTop: footer.top,
      cameraZ: camera.position.z, cameraYaw: camera.rotation.y,
      renderWidth: runtime.engine.getRenderWidth(),
      canvasWidth: runtime.canvas.getBoundingClientRect().width,
      scaling: runtime.engine.getHardwareScalingLevel(),
    };
  });
}

function assertBoardFits(layout) {
  assert.ok(layout.board.top >= layout.headerBottom + 2, `board overlaps header: ${JSON.stringify(layout)}`);
  assert.ok(layout.board.bottom <= layout.footerTop - 2, `board overlaps footer: ${JSON.stringify(layout)}`);
  assertNear(layout.cameraYaw, 0, 'camera must face the authored direction');
  assertNear(layout.renderWidth * layout.scaling, layout.canvasWidth, 'canvas/render width');
}

async function assertEndcard(page, viewport) {
  const layout = await page.evaluate(() => {
    const rect = (selector) => {
      const bounds = document.querySelector(selector).getBoundingClientRect();
      return { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height };
    };
    return {
      panel: rect('.endcard__panel'), logo: rect('.endcard__app-icon'), cta: rect('.endcard__cta'),
      footerHidden: [...document.querySelectorAll('.footer-app-icon, .footer-cta')].every((element) =>
        getComputedStyle(element).visibility === 'hidden' && getComputedStyle(element).opacity === '0' && element.inert),
    };
  });
  for (const name of ['panel', 'logo', 'cta']) {
    assertNear(layout[name].x + layout[name].width / 2, viewport.width / 2, `${name} horizontal center`);
  }
  assertNear(layout.panel.y + layout.panel.height / 2, viewport.height / 2, 'panel vertical center');
  assert.ok(layout.logo.y >= 16 && layout.cta.y + layout.cta.height <= viewport.height - 16, 'end card stays in viewport');
  assert.ok(layout.logo.y + layout.logo.height < layout.cta.y, 'logo and CTA do not overlap');
  if (viewport.width < viewport.height) assert.ok(layout.logo.width >= viewport.width * 0.5, 'portrait logo is prominent');
  assert.ok(layout.footerHidden, 'footer logo and CTA disappear and stop accepting input');
}

function assertNear(actual, expected, label) {
  assert.ok(Math.abs(actual - expected) < 1, `${label}: expected ${expected}, got ${actual}`);
}
