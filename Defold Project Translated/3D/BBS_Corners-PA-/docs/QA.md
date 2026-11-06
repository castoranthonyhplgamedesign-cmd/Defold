# QA record — 2026-11-06

## Current renamed single-file export

Final title: **Brickshatter Corners**, checked for exact-name collisions as recorded in [NAME_CHECK.md](NAME_CHECK.md). The shared output directory has no duplicate HTML filenames or document titles; other games' files are preserved.

Deliverable: `D:\allproject\defold\output\Brickshatter-Corners.html` (7,259,839 bytes). SHA-256: `90d0621c1afe0575235bac51634065d9c3e958eea002855d9a56ac093d3a965f`.

The actual file passes offline browser QA: direct `file://` startup, 56-brick scene, real-pointer gate submission, fourth-click end card, rotation, zero companion-file/network requests and zero runtime errors. It embeds the Defold loader, JavaScript runtime, Wasm, all archive pieces, logo and favicon. The local-file CTA guard prevents navigation during preview.

The Windows ICO now uses eight DIB frames matching the engine's 16/24/32/48/64/96/128/256 px resources. The executable rebuild replaces all eight successfully, and native startup passes. The initial port's gameplay regression results below remain applicable; the current revision changes product branding and packaging.

## Result

Local implementation, release builds and QA pass. Original repository `cfd9f7b37c71ecbaf6aa70b68cebb11288633a8a` remains unchanged. Release gameplay source is commit `4a3636d`; subsequent evidence/documentation commits do not change the game.

| Check | Result | Evidence |
|---|---|---|
| Deterministic Lua board regression | Pass: 63 valid cells, 56 blocks, 9 exits, 508 legal moves to clear every block; occupancy checked after each move | `qa/board_test.lua` |
| Browser end-to-end | 11 checks pass, no runtime errors and no external requests | [Report](../qa/evidence/e2e-report.json) |
| Full win through pointer input | All 56 blocks removed in 88 real drags; solved event once; no automatic Full CTA; click after fade redirects | Same report and [win screenshot](../qa/evidence/full-win-endcard.png) |
| Limited modes | Fourth block press ends FourClicks; 30-second timer starts on first valid press; pauses/resumes; both request CTA once | Same report |
| Input and collision | Background/header presses ignored; matching exit submits during drag; blocked drag cannot tunnel | Same report |
| Responsive layout | State survives 390×844, 844×390, 768×1024 and 1024×768 changes; active blocks stay on screen | Viewport screenshots in `qa/evidence/` |
| High-DPI touch | DPR 2 touch presses count once; fourth tap ends; rotation preserves end state; no runtime errors | [Touch report](../qa/evidence/device-smoke.json) |
| Platform wrappers | 14 tests pass: CTA priorities, guarded optional methods, loading-MRAID fallback, gameClose ordering, nullable volume, exposure and mute | `node tools/platform-test.mjs` |
| Windows release startup | Pass: scene initializes, DISPLAYED emitted, process stays running, no script errors in native log | [Native report](../qa/evidence/native-smoke.json) |
| Final visual smoke | Original mesh/UI/font assets; board framing, header, footer, hand scale and travel compared with executable reference | [Reference](../qa/evidence/reference-portrait.png), [Defold](../qa/evidence/final-portrait.png) |

The clean full-game browser run used `793534e`. The later `df55383` change fixes only native configuration lookup; `4a3636d` adjusts tutorial-hand appearance. Final Wasm smoke, high-DPI touch and Windows startup were repeated after those changes. Visual comparison checks composition and behavior; it is not a claim of pixel-identical lighting across engines.

## Local artifacts

- HTML5: `publish/BBS Corners - Wide U/`, built in release mode with the single-thread Wasm architecture.
- Windows: `publish/windows/BBS Corners - Wide U/`, release executable and game archive.
- HTML5 ZIP: 3,225,427 bytes; unpacked distribution: 5,472,968 bytes.
- Windows ZIP: 5,425,733 bytes; unpacked distribution: 10,190,713 bytes.
- SHA-256 checksums: [release manifest](../qa/evidence/release-manifest.json).
- Preview: <http://127.0.0.1:8188/>. The server binds only to loopback. Its process ID is in `qa/artifacts/preview-server.pid`; stop that specific process when finished, or run `node tools/serve.mjs` to restart it later.

Build metadata in `publish/build-info.json` and `publish/windows/build-info.json` records engine version and source commit. Temporary browser screenshots/logs remain in `qa/artifacts/`; selected reports and screenshots are committed in `qa/evidence/`.

## Scope limits

This is a loopback-only publish. Desktop Chrome and mobile emulation do not certify physical iOS/Android performance, audible device output, MRAID containers or ad-network acceptance. SDK routing is tested with mocks. The standard Defold Wasm distribution uses several local files and is not a network-ready single-file creative; its unpacked size exceeds 5 MB. No network submission or external hosting was performed.
