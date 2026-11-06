# Mystery Master branding and single-file delivery

The user requested a synonym or near-equivalent of the original game name, Clue Master. The correct chosen brand is **Mystery Master**. The earlier literal Sinonimus name was a misunderstanding and is superseded.

The Defold project/engine name is MysteryMaster. Browser title, in-game heading, favicon, touch icon and end-card artwork all use Mystery Master. Gameplay and original source files are unchanged.

Deliverable: D:/allproject/defold/output/MysteryMaster.html. This is one self-contained HTML with embedded engine, archive, images, font, audio and icons. No companion files are required. Publishing uses a fixed canonical filename and refuses to overwrite a differently branded existing file. The mistaken Sinonimus output is removed after successful QA, without touching other games.

Build with the documented Bob command, then run:

    python scripts/publish.py --single-output D:/allproject/defold/output/MysteryMaster.html

## Icon assets and generation

Built-in image generation/editing tool, following the imagegen skill. Master: assets/branding/mystery-master-master.png. Runtime WebP: assets/branding/mystery-master-logo.webp. Browser icon: assets/branding/mystery-master-icon.png. ICO: assets/branding/mystery-master.ico.

Final edit prompt: Replace the word SINONIMUS with the exact new name MYSTERY MASTER, spelled M Y S T E R Y M A S T E R. Use two centered stacked lines, MYSTERY above MASTER, in the same highly legible chunky gold lettering with dark plum outlines. Preserve the illustrated Egyptian mystery emblem, magnifying glass, turquoise eye, gold and turquoise palette, crisp cartoon style and transparent background. Rebalance into a compact square app icon/end-card logo with generous transparent padding and no clipping. No other words and no SINONIMUS text. The intended name is a synonym of Clue Master.

Current branding QA is recorded in qa/evidence/mystery-master-branding-report.json, with gameplay, end-card and landscape captures. Previous QA.md documents the original translation baseline.

## Verified delivery

Six branding/delivery checks passed, zero failed. Full puzzle completion, both click-limited variants, new title/icon/heading/logo, landscape end card, and direct file opening were exercised against the copied HTML. There were no browser errors or external asset requests.

Final file: MysteryMaster.html; 4558562 bytes. SHA-256: 7b21dd37be0c711d47e8cf4a6adf97ebbf596e4e595120bc5d96e352c69bfe94. The output folder contains exactly one MysteryMaster entry and no Sinonimus export. Other games were left unchanged.
