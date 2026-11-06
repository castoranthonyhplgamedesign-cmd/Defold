# Token Roll startup repair

The reported failure was reproduced by opening the exported HTML directly: the
screen was black even though gameplay state advanced. Earlier release QA checked
state and browser errors but did not establish that frames were rendered. Its
rendering-related conclusions are superseded by this investigation.

A debug engine exposed two runtime failures: invalid cull-face enum names and a
removed GUI text-measurement function. The renderer now uses
`graphics.FACE_TYPE_FRONT/BACK`; tutorial layout uses `resource.get_text_metrics`
with the GUI font resource. Multi-layer font rendering prevents neighboring glyph
outlines from covering the tutorial text. Asset regeneration preserves that mode.

References: [render API](https://defold.com/manuals/render/),
[GUI API](https://defold.com/ref/gui-lua/),
[font rendering](https://defold.com/manuals/font/).

The render script reports completed frames, and standalone QA waits for that
heartbeat before interacting. Headed, offline tests capture startup, gameplay
and endcard in portrait and landscape. Pixel checks reject black captures and
missing colored foreground. Captures are also inspected visually. Debug-engine
tests expose Lua failures that the release engine can suppress.

`qa/single-html-package.json` records the current output hash and size;
`qa/single-html-results.json` records the final release playthrough and pixel
checks. `qa/visible-probe.json` records the debug startup inspection. The stable
output is `D:\allproject\defold\output\Token Roll.html`; no additional exported
copies or companion assets are needed. Publication remains local only.
