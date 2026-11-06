# Eight-network integration — 2026-10-22

**Confirmed implementation:** `src/networks.ts`, `src/networkProfiles.json`, `vite.config.ts`, `scripts/build-all.mjs`. The build selects one target; no runtime priority chain chooses an unrelated SDK. Exactly eight profiles exist. No external configuration-editor integration.

| Target | Deliberate CTA | Bridge / package |
|---|---|---|
| Applovin | Ready/viewability-gated `mraid.open(storeUrl)` | One `mraid.js`; HTML |
| Facebook | No-argument `FbPlayableAd.onCTAClick()` | No bridge request; HTML |
| Google App campaigns | Guarded `ExitApi.exit()`; literal survives final HTML | Official exitapi.js only; ZIP |
| Ironsource | Ready/viewability-gated `mraid.open(storeUrl)` | One `mraid.js`; HTML |
| Mintegral | `window.install()` | Supplied host callbacks; ZIP |
| Moloco | No-argument `FbPlayableAd.onCTAClick()` | No mraid.js or XMLHttpRequest; HTML |
| Unity | Selected MRAID route | One `mraid.js`; HTML |
| Vungle | Documented `parent.postMessage('download','*')` | Adaptive Creative parent contract; ZIP |

All raw HTML and ZIP outputs have a conservative 4,000,000-byte guard. This is a project budget, not a claim that every placement accepts the same format. ZIP entry round-trips are asserted and contain root `index.html`. Naming is lowercase. Models/images/font/audio are embedded; no external assets, decoders or tracking pixels.

## Readiness, lifecycle and outcome handling

MRAID detection waits up to 500 ms for injection; an existing loading SDK bounds boot waiting at 2,000 ms but continues to block gameplay and CTA until ready. Listeners remain available for later readiness. The instance-local `initMraid` begins at module initialization, before DOM boot. Optional missing `getState` is tolerated. Viewability, exposure, state and document gates combine; one open gate never overrides another closed gate. Non-finite/null volume is ignored, valid percentage clamped. Hidden/context-lost playback freezes clocks and all media. Late host discovery at CTA does not fall through a loading SDK into a window redirect.

Mintegral receives `gameReady()` after scene and bounded asset readiness, and `gameEnd()` once at completion. An absent `gameStart` is supplied for the host to release the initial presentation gate; existing host functions are preserved. Existing host-owned start functions retain their own start coordination, with parent-originated pause/resume messages still honored. No early body-onload gameReady call is injected, which would falsely announce assets or duplicate readiness. No retry callback because this creative has no retry flow.

Vungle receives the documented completion message at session end and download only on CTA; pause/resume events freeze and resume the app. Unity also honors pause/resume/mute/unmute events without requiring Luna for the Three runtime. SDK callbacks are guarded; a failure never becomes an automatic second redirect. A standalone preview can open the supplied store URL only from a deliberate button click when no real MRAID host is present.

Ready/start/end/close reporting is deduplicated. First successful launch announces challenge start; timeout announces endcard but never challenge solved. Only actual clear announces solved. Hidden readiness defers DISPLAYED until presentation permission. Analytics go to selected AppLovin analytics or an available playableSDK reporter; no tracking network or debug log is added when neither exists.

## Official evidence used

- [Google App-campaign HTML5/playable specification](https://support.google.com/google-ads/answer/9981650?hl=en-AUI): official Exit API URL/call and portrait+landscape metadata. This profile targets App campaigns, not generic uploaded display ads. The supplied Lilita One font is embedded; exact placement font acceptance remains a validator check.
- [Moloco playable/IEC creative guide](https://help.moloco.com/hc/en-us/articles/24124525963799-Playable-and-Interactive-End-Card-IEC-creative-guide): no-argument CTA, single embedded HTML, no XMLHttpRequest/mraid.js/external assets. Exclusions are audited in the actual artifact.
- [Mintegral Playturbo required test items](https://www.playturbo.com/_nuxt/doc/en-doc.86decc5.pdf): install, gameReady, gameEnd and host-called gameStart. Root ZIP packaging follows this project's baseline; uploader naming/metadata acceptance remains unverified.
- [Vungle Adaptive Creative events](https://support.vungle.com/hc/en-us/articles/360057120251-Customize-the-Adaptive-Creative-Experience): exact download/complete messages and pause/resume. [Creative Verifier guidance](https://support.vungle.com/hc/en-us/articles/4908908675355-Test-Your-Playable-Asset-With-Our-Creative-Verifier) explains device validation. A selected Vungle placement must supply the documented parent wrapper; this build does not invent a replacement SDK.
- AppLovin/Ironsource/Unity MRAID behavior follows the supplied project contract; specific official submission validators have not been exercised here. Full HTML upload and ironSource Exchange raw-tag delivery are not interchangeable.

## Validation status

**Confirmed local:** six network tests cover known/loading/missing/late SDK, optional state, visibility gates, null volume, selected routing, once-only outcomes, iOS/Android destinations, hidden presentation, host pause and preservation of existing functions. Packaged files pass Chromium startup, media, portrait/landscape, CTA count/order and pause tests with controlled hosts. Bridge requests are intercepted; no real store or tracking request is sent. Google literal-call, Moloco exclusions, classic-script parsing, exact network count and raw/package size guards pass.

**Unknown official acceptance:** no authenticated upload, real SDK runtime validation, physical Creative Verifier, store resolution, or final placement metadata approval was available. Local fixtures are not network certification. Outputs are ready for developer review and host validation, not a claim of approved campaigns.
