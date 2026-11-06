import { createServer } from 'vite';

for (const iteration of ['full', '4clicks', '30seconds']) {
  await withIteration(iteration, async ({ IterationController, getActiveIteration }) => {
    const mode = getActiveIteration();
    if ('scoreTarget' in mode) {
      throw new Error(`${iteration}: scoreTarget should not exist in iteration mode config.`);
    }

    if (iteration === 'full') {
      assertFullIteration(IterationController);
      return;
    }

    if (iteration === '4clicks') {
      assertFourClickIteration(IterationController);
      return;
    }

    assertThirtySecondIteration(IterationController);
  });
}

console.log('Iteration smoke passed: Full, 4-click, and 30-second modes match the playable rules.');

async function withIteration(iteration, run) {
  const vite = await createServer({
    appType: 'custom',
    configFile: false,
    define: {
      __ITERATION__: JSON.stringify(iteration),
      __NETWORK__: JSON.stringify('dev'),
    },
    logLevel: 'error',
    optimizeDeps: {
      entries: [],
      noDiscovery: true,
    },
    root: process.cwd(),
    server: { hmr: false, middlewareMode: true },
  });

  try {
    const { IterationController } = await vite.ssrLoadModule('/src/game/iterationController.ts');
    const { getActiveIteration } = await vite.ssrLoadModule('/src/iteration.ts');
    await run({ IterationController, getActiveIteration });
  } finally {
    await vite.close();
  }
}

function assertFullIteration(IterationController) {
  const events = createEventLog();
  const controller = new IterationController(events.callbacks);

  assertEqual(controller.mode.key, 'full', 'full mode key');
  assertEqual(controller.mode.redirectsBeforeEndCard, false, 'full mode redirect flag');
  controller.start();
  controller.registerClick();
  controller.update(999);
  assertEvents(events.log, [], 'full mode should ignore click and timer limits');

  controller.win();
  assertEvents(events.log, ['endcard:true'], 'full win should show win end card without redirect');

  controller.registerClick();
  controller.update(999);
  controller.win();
  assertEvents(events.log, ['endcard:true'], 'full mode should end once');
}

function assertFourClickIteration(IterationController) {
  const events = createEventLog();
  const controller = new IterationController(events.callbacks);

  assertEqual(controller.mode.key, '4clicks', '4-click mode key');
  assertEqual(controller.mode.clickLimit, 4, '4-click limit');
  assertEqual(controller.mode.redirectsBeforeEndCard, true, '4-click redirect flag');
  controller.registerClick();
  assertEvents(events.log, [], '4-click mode should not count before first input start');

  controller.start();
  controller.registerClick();
  controller.registerClick();
  controller.registerClick();
  assertEvents(events.log, [], '4-click mode should wait for the fourth valid block click');

  controller.registerClick();
  assertEvents(events.log, ['redirect', 'endcard:false'], '4-click mode should redirect then show fail end card');

  controller.registerClick();
  controller.win();
  assertEvents(events.log, ['redirect', 'endcard:false'], '4-click mode should end once');
}

function assertThirtySecondIteration(IterationController) {
  const events = createEventLog();
  const controller = new IterationController(events.callbacks);

  assertEqual(controller.mode.key, '30seconds', '30-second mode key');
  assertEqual(controller.mode.timeLimitSeconds, 30, '30-second limit');
  assertEqual(controller.mode.redirectsBeforeEndCard, true, '30-second redirect flag');
  controller.update(31);
  assertEvents(events.log, [], '30-second mode timer should not run before first input start');

  controller.start();
  controller.update(29.9);
  assertEvents(events.log, [], '30-second mode should wait for the full timer');

  controller.update(0.2);
  assertEvents(events.log, ['redirect', 'endcard:false'], '30-second mode should redirect then show fail end card');

  controller.update(31);
  controller.win();
  assertEvents(events.log, ['redirect', 'endcard:false'], '30-second mode should end once');
}

function createEventLog() {
  const log = [];
  return {
    log,
    callbacks: {
      onRedirectRequested: () => log.push('redirect'),
      onEndCardRequested: (isWin) => log.push(`endcard:${isWin}`),
    },
  };
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${expected}, got ${actual}`);
  }
}

function assertEvents(actual, expected, label) {
  if (actual.length !== expected.length || actual.some((event, index) => event !== expected[index])) {
    throw new Error(`${label}: expected [${expected.join(', ')}], got [${actual.join(', ')}]`);
  }
}
