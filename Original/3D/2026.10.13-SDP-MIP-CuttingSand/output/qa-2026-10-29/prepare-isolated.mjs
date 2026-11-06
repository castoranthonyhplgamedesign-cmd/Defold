// Builds diagnostic artifacts only; does not launch a browser or edit production files.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const out = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(out, '../..');
const keep = (source, destination) => {
  if (fs.existsSync(source) && !fs.existsSync(destination)) fs.copyFileSync(source, destination);
};
keep(path.join(out, 'chaos-instrumented.mjs'), path.join(out, 'chaos-instrumented-before-isolation.mjs'));
keep(path.join(out, 'instrumented.log'), path.join(out, 'instrumented-port-collision.log'));
const priorEvidence = path.join(out, 'instrumented', 'cuttingsand_default');
if (fs.existsSync(priorEvidence)) {
  const destination = path.join(out, 'instrumented-pre-isolation');
  fs.mkdirSync(destination, { recursive: true });
  for (const name of fs.readdirSync(priorEvidence)) {
    if (fs.statSync(path.join(priorEvidence, name)).isFile()) keep(path.join(priorEvidence, name), path.join(destination, name));
  }
}

const original = fs.readFileSync(path.join(root, 'scripts/qa/chaos.mjs'), 'utf8').replaceAll('\r\n', '\n');
const common = source => source.replace("from './cdp.mjs'", "from './cdp-isolated.mjs'");
const journal = `
    let currentUrl;
    try {
      const value = await cdp.send('Runtime.evaluate', { expression: 'location.href', returnByValue: true }, 3000);
      currentUrl = value.result?.value;
    } catch (error) { currentUrl = 'Unavailable: ' + error.message; }
    fs.writeFileSync(path.join(out, \`run\${runIndex + 1}-navigation.json\`), JSON.stringify({ currentUrl, journal: cdp.navigationJournal }, null, 2));
    console.log('NAVIGATION_DIAGNOSTIC ' + JSON.stringify({ run: runIndex + 1, currentUrl, journal: cdp.navigationJournal }));
`;
const addJournal = source => source.replace('    cdp.close();', journal + '    cdp.close();');
const isolated = addJournal(common(original).replace("'qa-screenshots/chaos'", "'output/qa-2026-10-29/isolated'"));
fs.writeFileSync(path.join(out, 'chaos-isolated.mjs'), isolated);

// Expose the actual counter only in a copied test HTML, after verifying its unique increment/context.
const buildDir = path.join(root, 'dist/cuttingsand_default/90seconds');
const buildName = fs.readdirSync(buildDir).find(name => name.endsWith('_mo.html'));
if (!buildName) throw new Error('Missing tap 90seconds Moloco build.');
const builtFile = path.join(buildDir, buildName);
const html = fs.readFileSync(builtFile, 'utf8');
const incrementPattern = /this\.lastTime=[A-Za-z_$][\w$]*,this\.lastX=[A-Za-z_$][\w$]*,this\.lastY=[A-Za-z_$][\w$]*,this\.total\+\+/g;
const incrementMatches = [...html.matchAll(incrementPattern)];
const matches = incrementMatches.length;
if (matches !== 1) throw new Error(`Expected exactly one ClickCounter increment with duplicate-detection assignments, found ${matches}`);
const token = incrementMatches[0][0];
const index = incrementMatches[0].index;
const context = html.slice(Math.max(0, index - 1300), index + 130);
if (!context.includes('register(') || !context.includes('lastTime') || !context.includes('lastX') || !context.includes('lastY')) {
  throw new Error('Unique increment did not have the expected ClickCounter register/duplicate-detection context.');
}
const testBuildDir = path.join(out, 'test-only-build');
fs.mkdirSync(testBuildDir, { recursive: true });
const testFile = path.join(testBuildDir, buildName);
const replacement = token.replace('this.total++', '(window.__QA_COUNTER__=this,this.total++)');
fs.writeFileSync(testFile, html.replace(token, replacement));
fs.writeFileSync(path.join(testBuildDir, 'instrumentation.json'), JSON.stringify({
  source: path.relative(root, builtFile), destination: path.relative(root, testFile), uniqueMatches: matches,
  originalIncrement: token, replacement, context
}, null, 2));

let instrumented = common(original)
  .replace("'qa-screenshots/chaos'", "'output/qa-2026-10-29/instrumented-isolated'")
  .replace('const log = [];', 'const log = []; const offSandRecords = [];')
  .replace("const only = process.argv[4] ? process.argv[4].split(',').map(n => Number(n) - 1) : null;", 'const only = [4]; // Diagnostic copy is restricted to original run 5.');
const urlOriginal = "url: pathToFileURL(path.join(dist, length, name)).href";
if (!instrumented.includes(urlOriginal)) throw new Error('Page URL source did not match.');
instrumented = instrumented.replace(urlOriginal, "url: pathToFileURL(path.join(root, 'output/qa-2026-10-29/test-only-build', name)).href");
const offOriginal = `        const before = await page.state();
        // Below the picture (funnel, belt, buckets) is never a gameplay tap.
        await tapDesign(140 + rand() * 800, 1120 + rand() * 780);
        const after = await page.state();
        if (after.counted !== before.counted && !after.ended) fail('a tap below the picture was counted');
        log.push('tap off the sand');`;
const offReplacement = `        // Actual and published values are captured atomically in the same evaluation.
        const before = await page.evaluate('({ published: JSON.parse(JSON.stringify(window.__SDP_STATE__)), actualCount: window.__QA_COUNTER__?.count ?? 0, url: location.href })');
        const design = { x: 140 + rand() * 800, y: 1120 + rand() * 780 };
        const css = toCss(design.x, design.y);
        const record = { actionIndex: log.length + 1, design, css, viewport: { vw, vh, dpr },
          ageSinceViewportChangeBeforeMs: Date.now() - lastViewportChange,
          before, priorActions: log.slice(-8) };
        await tapDesign(design.x, design.y);
        const after = await page.evaluate('({ published: JSON.parse(JSON.stringify(window.__SDP_STATE__)), actualCount: window.__QA_COUNTER__?.count ?? 0, url: location.href })');
        record.after = after;
        record.ageSinceViewportChangeAfterMs = Date.now() - lastViewportChange;
        record.publishedFailure = after.published.counted !== before.published.counted && !after.published.ended;
        record.actualFailure = after.actualCount !== before.actualCount && !after.published.ended;
        if (record.publishedFailure || record.actualFailure) {
          record.canvasAfterFailure = await page.evaluate(\`(() => {
            const c = document.querySelector('canvas'); const r = c.getBoundingClientRect();
            return { rect: { x:r.x, y:r.y, width:r.width, height:r.height }, bitmap: { width:c.width, height:c.height },
              viewport: { innerWidth, innerHeight, dpr:devicePixelRatio, visual: visualViewport ? { width:visualViewport.width, height:visualViewport.height, scale:visualViewport.scale } : null },
              currentUrl: location.href };
          })()\`);
          if (record.publishedFailure) fail('a tap below the picture was counted (published): ' + JSON.stringify(record));
          if (record.actualFailure) fail('a tap below the picture was counted (actual): ' + JSON.stringify(record));
          console.log('OFF_SAND_FAILURE ' + JSON.stringify(record));
        }
        offSandRecords.push(record);
        log.push('tap off the sand');`;
if (!instrumented.includes(offOriginal)) throw new Error('Off-sand source did not match.');
instrumented = instrumented.replace(offOriginal, offReplacement);
instrumented = addJournal(instrumented).replace('    cdp.close();',
  '    fs.writeFileSync(path.join(out, `run${runIndex + 1}-off-sand.json`), JSON.stringify(offSandRecords, null, 2));\n    cdp.close();');
fs.writeFileSync(path.join(out, 'chaos-instrumented.mjs'), instrumented);

const performanceFile = path.join(out, 'performance.mjs');
const performance = fs.readFileSync(performanceFile, 'utf8');
fs.writeFileSync(performanceFile, performance.replace("from '../../scripts/qa/cdp.mjs'", "from './cdp-isolated.mjs'"));
console.log(JSON.stringify({ isolatedDriver: 'cdp-isolated.mjs', chaosCopy: 'chaos-isolated.mjs',
  instrumentedCopy: 'chaos-instrumented.mjs', counterIncrementMatches: matches,
  testOnlyHTML: path.relative(root, testFile), sourceHTMLChanged: false }));
