# Token Roll branding and single-file delivery

The user requested a new, similar game name and icon, explicitly excluding the literal name Sinonimus, and one uniquely named HTML in D:\allproject\defold\output.

Selected name: **Token Roll**. Token is close to coin; Roll retains the original rotating-cylinder theme. The existing output names Brickshatter-Corners, MysteryMaster and Ring Sort are distinct. The repository folder retains its original-source mapping for traceability.

Changed the Defold project/window title, HTML document title, browser favicon and endcard icon/title. Kept the authored gameplay, coins, controls, puzzles, audio and progression unchanged. Original remains untouched. branding.json is the packaging/name source of truth; main/branding.lua supplies the new icon's square aspect ratio.

New icon: assets/branding/token_roll.png, 1254x1254. Its endcard copy is assets/images/app_icon.png. It was generated with the built-in image_gen tool and visually inspected for the exact TOKEN ROLL text. No screenshot or headless browser test is involved in that asset inspection.

## Image prompt

```text
Use case: stylized-concept. Asset type: square mobile puzzle game app icon and endcard branding. Create a polished 1024x1024 icon for a casual 3D coin sorting and rotating-cylinder puzzle called TOKEN ROLL. Show a clear central stack of shiny thick golden tokens rolling along a curved blue ring, with a few colorful coral, lime and violet tokens echoing a sorting puzzle. Bold clean readable friendly dimensional typography at the bottom with exact text: TOKEN on one line and ROLL beneath. Rounded square deep navy-to-teal backdrop, vibrant gold highlights, strong silhouette, professional casual mobile game finish. All content safely inset from the icon edges. No additional text, no existing Coin Sort branding, no watermark. This is a new replacement app icon, not a gameplay screenshot.
```

## Standalone packaging

Run python scripts/build.py, commit the reviewed changes, then python scripts/package_single_html.py. The output is D:\allproject\defold\output\Token Roll.html. It embeds the branded icon, loader, engine JavaScript, Wasm and all archive pieces. Binary resources use gzip/base64 and are read from memory, preserving Defold's archive assembly and validation. No sibling asset files are required. Local file opening also suppresses store navigation.

The packager uses one stable output filename. It rejects a conflicting normalized name, refuses to overwrite an unrelated artifact, and never creates numbered/timestamped copies or touches other games' output files.

The offline test runs the delivered HTML from an isolated directory containing exactly one file, with network offline, in a headed browser. It exercises both viewports, the complete natural playthrough, endcard/CTA and rotation, and asserts no network or sibling-file requests. Evidence: qa/single-html-package.json and qa/single-html-results.json.

## Completed validation

- Branded HTML5 release build passed, followed by all 12 current code-check commands.
- Offline headed tests passed at 390x844 and 844x390, with seven real-pointer rotations per case, natural level completion, endcard, exactly one locally suppressed CTA and viewport rotation.
- No browser/runtime errors or network/sibling-file requests were observed. The test directory contained only Token Roll.html.
- Final HTML: 23,239,432 bytes. SHA-256: 1886344309976b2865408e89da7c7030b91a89c9b5978cc27f11e343d70e67eb.
- Only one Token Roll output filename exists. Other games' exported HTML files were left intact. No companion files were copied into the output folder.
- Runtime branding/package commit: 9fbb71b49b6420aff83aed78e9b49ab594f979d7. The subsequent QA/documentation commit does not change the runtime or the delivered HTML.

## Startup repair

The earlier validation above established simulation behavior but missed a black renderer. Its historical file hash and size refer to the superseded export. See BLACK_SCREEN_FIX.md for the reproduced cause, fixes and visual regression checks. Current release size/hash and offline visual QA are recorded in qa/single-html-package.json and qa/single-html-results.json.
