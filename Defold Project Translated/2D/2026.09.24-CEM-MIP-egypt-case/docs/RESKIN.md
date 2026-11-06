# Active reskin baseline

The user selected the existing `reskin` branch after verifying its date. Source commit: `4ed0abc9fe3a3568e9d6557491a6029b47747ae5`, authored and committed 2026-11-06 21:59:22 +08:00. Source repository: https://github.com/HPL-PlayableAds/2026.09.24-CEM-MIP-egypt-case/tree/reskin

The translated repository now works on its own `reskin` branch. `source/reskin` records the fetched source branch. A detached reference worktree at `qa/reskin-src` contains that exact source commit; `Original/2D/2026.09.24-CEM-MIP-egypt-case` remains unchanged on main.

Imported the reskin map, character panel, clue panel, tutorial hand, original reference logo, six character portraits, new character names/clues and renamed character audio. The active order is Tia, Nebet, Nakht, Merit, Huy, Senen. Correct-drop positions and game rules are unchanged by the source branch. The approved Mystery Master branding remains the intentional logo/title exception.

All original source bytes are preserved locally. The larger reskin art initially produced a 5,180,040-byte HTML. Only the tutorial-hand runtime copy is downsampled from 1534×1534 to 512×512 (WebP quality 95) for its authored 200-unit display width. The source hand remains untouched in assets/source; the conversion, runtime checksum and source commit are recorded in asset-inventory.json. Other gameplay art remains at source resolution and source encoding.

Output stays `D:\allproject\defold\output\MysteryMaster.html`: one embedded HTML file, fixed filename, no numbered or duplicate export. Other games in the output directory are not changed.

Reference source typecheck and delivery build passed. Browser reference runs locally on port 8176. Current reskin QA and delivery hash are recorded separately from the historical main-branch QA evidence.

## Verified reskin delivery

14 targeted checks passed, zero failed: source branch/commit marker, exact source artwork/portrait bytes, full puzzle completion, both click variants, direct file opening, title/icon/branding, four viewports, tutorials and lifecycle, orientation state, and touch/high-DPI input. Source typecheck/build passed. Reference artwork hashes match reskin commit 4ed0abc.

Final single file: MysteryMaster.html, 4812499 bytes. SHA-256: d7964648136798a59322098839911805358040aa15c2beb7d6a335521d18e873. Exactly one MysteryMaster output exists. No extra file is needed to run it; no browser errors or external asset requests occurred in standalone QA.

Current comparison PNGs, visual-comparison.json and both silent gameplay WEBM recordings are in qa/evidence. The source logo and heading are the intentional Mystery Master branding exceptions. Physical devices and live ad SDK validators are not claimed.
