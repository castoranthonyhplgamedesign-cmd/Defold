const fs=require('fs'),assert=require('assert/strict'),crypto=require('crypto');
function section(text,start,end,replacement){const a=text.indexOf(start),b=text.indexOf(end,a);assert(a>=0&&b>a,start);return text.slice(0,a)+replacement+'\n\n'+text.slice(b);}
let a=fs.readFileSync('AGENTS.md','utf8');
a=section(a,'## Configuration clarifications for Three','### GoogleAds Exit API Requirements',`## Project tuning

Use ordinary source-controlled TypeScript/JSON settings for gameplay tuning, camera/layout values, store links and audio levels. Import assets through the normal Vite manifest. This project has no external configuration-editor integration, browser-global override API, editable payload slots or generated configuration guide. Do not implement GAME_CONFIG; that contract belongs to another project.`);
a=section(a,'## Inline Game Configuration','## UI layer map',`## Source-controlled defaults and assets

- Keep actual project values in src/projectDefaults.json, shared by runtime and build tooling where needed; use typed imports and normal source edits.
- Keep one countdown duration value, initially 60 seconds. No compatibility alias, inactive-limit sentinel or unused configuration switches are required.
- Import selected assets directly through assets.ts and Vite. Embed models, buffers, images, fonts and audio in the final package; preserve their source provenance.
- Audio volume/loop and UI dimensions/anchors are normal authored settings consumed by their services. Do not add an asset override/hydration system.
- Network names, filenames and byte ceilings belong to the build script's eight-target table. No additional network scaffolding.`);
a=a.replace('  config.ts                # Typed defaults, overrides and asset hydration\n','').replace('  projectDefaults.json     # Shared runtime/build source of defaults','  projectDefaults.json     # Ordinary source-controlled runtime/build defaults').replaceAll('Core/config/audio/lifecycle','Core/audio/lifecycle');
a=a.replace('- Enable the eight requested targets: al, gg, is, mtg, fb, un, vu, mo. TikTok and a separate Liftoff variant remain optional/disabled. Network tags identify internal build variants, not universal compatibility with every placement product.','- Implement exactly eight networks: Applovin (al), Facebook (fb), Google (gg), Ironsource (is), Mintegral (mtg), Moloco (mo), Unity (un), Vungle (vu). Do not add optional or disabled extra-network adapters or outputs. Network tags identify internal build variants, not universal compatibility with every placement product.');
a=a.replaceAll(' / Liftoff','').replace('**, and **Liftoff (`lf`)**','**');
a=a.replace('Each enabled MRAID target requests `<script src="mraid.js"></script>` early in the generated HTML; optional disabled targets produce no artifact. Liftoff uses the standard MRAID implementation with no network-specific bridge ahead of MRAID.','Each selected MRAID target requests `<script src="mraid.js"></script>` early in the generated HTML.');
a=a.split('\n').filter(l=>!/^\| (TikTok|Liftoff) \|/.test(l)&&!(/^- \[ \]/.test(l)&&/Config-related|Marked config|CHANGABLE_|__CHANGEABLE_ASSETS__|Hydration fills|GAME_CONFIG\.md/.test(l))).join('\n');
a=a.replaceAll('`al`, `is`, `un`, `lf`','`al`, `is`, `un`').replaceAll('al, is, un, lf','al, is, un').replaceAll('`lf`','').replaceAll(', tt, lf','').replaceAll(' / config',' / settings').replaceAll('host/config','host/settings');
a=a.replace('`al`, `gg`, `is`, `mtg`, `fb`, `un`, `vu`, `mo`, `tt`, ','`al`, `gg`, `is`, `mtg`, `fb`, `un`, `vu`, `mo`');
fs.writeFileSync('AGENTS.md',a);
let p=fs.readFileSync('analysis/implementation-plan.md','utf8');
p=p.replace('Eight target outputs: AppLovin, Google, ironSource, Mintegral, Meta, Unity, Vungle and Moloco.','Exactly eight target outputs: Applovin, Facebook, Google, Ironsource, Mintegral, Moloco, Unity and Vungle. No other network adapters or outputs.');
p=p.replace('|`config.ts`, `projectDefaults.json`, `assets.ts`|Resolved editable configuration, provenance and embedded resources.|','|`projectDefaults.json`, `assets.ts`|Ordinary source-controlled tuning, provenance and embedded resource imports; no external editor or global overrides.|').replaceAll('config hydration','source-controlled settings').replaceAll('core/config/audio/lifecycle','core/audio/lifecycle');
p=section(p,'### Stage 7 — editable config and eight network outputs','### Stage 8',`### Stage 7 — eight network outputs and packaging

**Work:** keep gameplay/camera/queue values, store URLs and audio settings in ordinary source-controlled projectDefaults.json or typed modules. Import assets directly with Vite. Use one countdown duration (60 seconds initially), a 5-second idle hint and the reference endcard. Preserve extracted store URLs until delivery metadata changes them. Sound remains silent before its legitimate gesture/cue and respects user/host mute.

**Explicit exclusion:** no GAME_CONFIG integration, browser-global overrides, editor markers, payload-slot registry, keyed/dotted configuration merging, compatibility aliases or generated configuration guide. Those belong to another playable project.

Implement exactly eight build profiles: Applovin (al), Facebook (fb), Google (gg), Ironsource (is), Mintegral (mtg), Moloco (mo), Unity (un), Vungle (vu). No optional extra networks.

Use selected-placement MRAID readiness/viewability/open for Applovin/Ironsource/Unity; Google literal ExitApi.exit and official hosted exitapi.js; Facebook/Moloco no-argument FbPlayableAd.onCTAClick; selected Mintegral install/lifecycle and Vungle bridge contracts. No arbitrary postMessage protocol, location redirect or Moloco XHR/mraid.js. Only deliberate clicks open destinations.

Maintain lowercase filenames and network meta tags. Baseline ZIP choices gg/mtg/vu remain provisional until placement validation; ZIPs contain root index.html. Embed all selected model resources, textures, fonts and sounds. Byte guards include wrapper/base64 overhead. Test both store platform branches with destination stubs.

**Exit checks:** exactly eight target profiles/artifacts per creative variant; source settings consumed correctly; no external configuration-editor feature; classic JS syntax; no module chunks or external game resources; one intended bridge per target; lifecycle/completion/CTA idempotent; raw HTML and package bytes within selected caps. Mark unavailable official-host checks unverified.`);
p=p.replace('Core clock/rules, config merges and lifecycle transitions','Core clock/rules, source settings and lifecycle transitions').replace('eight target artifacts; generated GAME_CONFIG.md; build/size report','eight target artifacts; build/size report').replace('while retaining general network/build/config contracts','while retaining applicable network/build rules and excluding the external configuration-editor contract');
p=p.replace('**Completed:** read the entire supplied','**Scope correction:** exactly eight networks; no external GAME_CONFIG feature. Tuning stays in ordinary project files.\n\n**Completed:** read the entire supplied');
fs.writeFileSync('analysis/implementation-plan.md',p);
for(const file of ['analysis/three-migration-plan.md','analysis/rebuild-spec.md']){let s=fs.readFileSync(file,'utf8');const n=s.indexOf('\n');s=s.slice(0,n+1)+'\n**Project scope correction:** exactly Applovin, Facebook, Google, Ironsource, Mintegral, Moloco, Unity and Vungle. No external GAME_CONFIG/editor contract; use ordinary source-controlled tuning and asset imports.\n'+s.slice(n+1);fs.writeFileSync(file,s);}
const generator='analysis/tools/adapt-rules.cjs';let s=fs.readFileSync(generator,'utf8');s="throw new Error('Retired historical rule generator: its editor/network scope was superseded. Edit current AGENTS.md directly.');\n"+s;fs.writeFileSync(generator,s);
assert(!/Liftoff|TikTok|GAME_CONFIG_DEFAULTS|CHANGABLE_|__CHANGEABLE_ASSETS__/.test(a));
assert(!/generated GAME_CONFIG\.md|config merges|config hydration/.test(p));
const hash=f=>crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');assert.equal(hash('IOS_SFX_GUIDELINES.md'),hash('analysis/rules-source/IOS_SFX_GUIDELINES.snapshot.md'));
const networks=['Applovin','Facebook','Google','Ironsource','Mintegral','Moloco','Unity','Vungle'];
fs.writeFileSync('analysis/evidence/planning-validation.json',JSON.stringify({status:'Corrected documentation scope validated; no game implementation',networks,networkCount:8,externalConfigEditor:false,tuning:'Source-controlled TypeScript/JSON',rulesSha256:hash('AGENTS.md'),audioGuideUnchanged:true,historicalGeneratorRetired:true},null,2));
console.log('Corrected rules and plans: exactly eight networks, source-controlled tuning, no editor contract. Audio guide unchanged.');
