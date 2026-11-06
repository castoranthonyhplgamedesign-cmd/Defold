# Game configuration

The built creative assigns `GAME_CONFIG_DEFAULTS`, then exposes it as `window.GAME_CONFIG`. An integration may supply nested overrides, or quoted dotted-path keys such as `"DROP_POSITIONS.Aisha.x"`. Objects are deep-merged, so unspecified siblings retain defaults. General arrays replace the default array; `CHANGABLE_TEXTURES` entries are merged individually by stable `uuid` or `spriteName`, and `CHANGABLE_SOUNDTRACKS` entries by stable `uuid` or `id`.

The build produces `2clicks`, `4clicks`, `full` iterations. Their only config difference is `GAME_LENGTH.clickLimit`: 2clicks: 2; 4clicks: 4; full: 9999. Click-limited variants count only pointer presses on unsolved characters.

A blank asset `path` hydrates from `window.__CHANGEABLE_ASSETS__`. A supplied relative or data-URI path is preserved. Texture slots list their stable key, WebP format, target dimensions in `originalSize`, and editable `anchorPoint`, `scale`, and `resizeBlocked` fields. Soundtrack slots expose their stable key, MP3 format, `volume`, and `loop`.

| Variable name | What it controls | Accepted value types and range | Default value used |
|---|---|---|---|
| `APP_LINKS` | Store redirect URL used by the CTA. | Object | `{"app_store":"https://apps.apple.com/ph/app/clue-master-logic-puzzles/id6608973267","google_play":"https://play.google.com/store/apps/details?id=com.luwukmeliana.lexicard&hl=en"}` |
| `APP_LINKS.app_store` | Store redirect URL used by the CTA. | String | `"https://apps.apple.com/ph/app/clue-master-logic-puzzles/id6608973267"` |
| `APP_LINKS.google_play` | Store redirect URL used by the CTA. | String | `"https://play.google.com/store/apps/details?id=com.luwukmeliana.lexicard&hl=en"` |
| `MUTE` | Whether audio remains muted after the first interaction. | Boolean | `false` |
| `GAME_LENGTH` | Time and unsolved-character press limits for the active iteration. | Object | `{"timeLimit":9999,"clickLimit":9999}` |
| `GAME_LENGTH.timeLimit` | Runtime configuration value. | Number | `9999` |
| `GAME_LENGTH.clickLimit` | Runtime configuration value. | Number | `2clicks: 2; 4clicks: 4; full: 9999` |
| `GAME_BACKGROUND_TYPE` | Blank-space background rendering mode. | String | `"Color"` |
| `GAME_BACKGROUND_COLOR` | Blank-space RGB fill color. | Array | `[207,152,98]` |
| `SHOW_PACKSHOT` | Whether the solved-state overlay and logo are shown. | Boolean | `true` |
| `HAND_TUTOR_MODE` | Enables the opening and inactivity hand tutorials. | Boolean | `true` |
| `TUTORIAL_DELAY` | Opening and inactivity tutorial behavior, timing, or presentation. | Number | `5` |
| `TUTORIAL` | Opening and inactivity tutorial behavior, timing, or presentation. | Object | `{"openingCharacter":"Khasekhemwy","overlayAlpha":0.68,"ghostAlpha":0.5,"handWidth":200,"pressScale":0.9,"stepDelayMs":320,"moveMs":900,"fadeMs":260,"highlightPaddingX":34,"highlightPaddingY":20}` |
| `TUTORIAL.openingCharacter` | Opening and inactivity tutorial behavior, timing, or presentation. | String | `"Khasekhemwy"` |
| `TUTORIAL.overlayAlpha` | Opening and inactivity tutorial behavior, timing, or presentation. | Number | `0.68` |
| `TUTORIAL.ghostAlpha` | Opening and inactivity tutorial behavior, timing, or presentation. | Number | `0.5` |
| `TUTORIAL.handWidth` | Opening and inactivity tutorial behavior, timing, or presentation. | Number | `200` |
| `TUTORIAL.pressScale` | Opening and inactivity tutorial behavior, timing, or presentation. | Number | `0.9` |
| `TUTORIAL.stepDelayMs` | Opening and inactivity tutorial behavior, timing, or presentation. | Number | `320` |
| `TUTORIAL.moveMs` | Opening and inactivity tutorial behavior, timing, or presentation. | Number | `900` |
| `TUTORIAL.fadeMs` | Opening and inactivity tutorial behavior, timing, or presentation. | Number | `260` |
| `TUTORIAL.highlightPaddingX` | Opening and inactivity tutorial behavior, timing, or presentation. | Number | `34` |
| `TUTORIAL.highlightPaddingY` | Opening and inactivity tutorial behavior, timing, or presentation. | Number | `20` |
| `LOGO_WIDTH` | Authored end-card logo width; height follows the source aspect ratio. | Number | `900` |
| `LAYOUT` | Panel rectangle in 1080×1920 authored coordinates. | Object | `{"map":{"x":0,"y":0,"width":1080,"height":1080},"characters":{"x":0,"y":1080,"width":1080,"height":285},"clues":{"x":0,"y":1365,"width":1080,"height":555}}` |
| `LAYOUT.map` | Panel rectangle in 1080×1920 authored coordinates. | Object | `{"x":0,"y":0,"width":1080,"height":1080}` |
| `LAYOUT.map.x` | Panel rectangle in 1080×1920 authored coordinates. | Number | `0` |
| `LAYOUT.map.y` | Panel rectangle in 1080×1920 authored coordinates. | Number | `0` |
| `LAYOUT.map.width` | Panel rectangle in 1080×1920 authored coordinates. | Number | `1080` |
| `LAYOUT.map.height` | Panel rectangle in 1080×1920 authored coordinates. | Number | `1080` |
| `LAYOUT.characters` | Panel rectangle in 1080×1920 authored coordinates. | Object | `{"x":0,"y":1080,"width":1080,"height":285}` |
| `LAYOUT.characters.x` | Panel rectangle in 1080×1920 authored coordinates. | Number | `0` |
| `LAYOUT.characters.y` | Panel rectangle in 1080×1920 authored coordinates. | Number | `1080` |
| `LAYOUT.characters.width` | Panel rectangle in 1080×1920 authored coordinates. | Number | `1080` |
| `LAYOUT.characters.height` | Panel rectangle in 1080×1920 authored coordinates. | Number | `285` |
| `LAYOUT.clues` | Panel rectangle in 1080×1920 authored coordinates. | Object | `{"x":0,"y":1365,"width":1080,"height":555}` |
| `LAYOUT.clues.x` | Panel rectangle in 1080×1920 authored coordinates. | Number | `0` |
| `LAYOUT.clues.y` | Panel rectangle in 1080×1920 authored coordinates. | Number | `1365` |
| `LAYOUT.clues.width` | Panel rectangle in 1080×1920 authored coordinates. | Number | `1080` |
| `LAYOUT.clues.height` | Panel rectangle in 1080×1920 authored coordinates. | Number | `555` |
| `CHARACTER_HOME_Y` | Vertical center of the draggable character row. | Number | `1222.5` |
| `CHARACTER_LIST_MARGIN_X` | Equal authored-coordinate margin at the left and right of the character list. | Number | `32` |
| `CHARACTER_HEIGHT` | Authored character height in the tray. | Number | `205` |
| `PLACED_CHARACTER_HEIGHT` | Authored character height after a correct drop. | Number | `190` |
| `DROP_CIRCLE_SIZE` | Visible dashed-circle diameter in authored coordinates. | Number | `75` |
| `DROP_RADIUS` | Maximum authored-coordinate distance accepted for a correct drop. | Number | `75` |
| `DROP_POSITIONS` | Drop-circle center in 1080×1920 authored coordinates. | Object | `{"Aisha":{"x":260,"y":350},"Maya":{"x":305,"y":940},"Ahmose":{"x":775,"y":970},"Nefertiti":{"x":735,"y":190},"Merneptah":{"x":845,"y":380},"Khasekhemwy":{"x":850,"y":780}}` |
| `DROP_POSITIONS.Aisha` | Drop-circle center in 1080×1920 authored coordinates. | Object | `{"x":260,"y":350}` |
| `DROP_POSITIONS.Aisha.x` | Drop-circle center in 1080×1920 authored coordinates. | Number | `260` |
| `DROP_POSITIONS.Aisha.y` | Drop-circle center in 1080×1920 authored coordinates. | Number | `350` |
| `DROP_POSITIONS.Maya` | Drop-circle center in 1080×1920 authored coordinates. | Object | `{"x":305,"y":940}` |
| `DROP_POSITIONS.Maya.x` | Drop-circle center in 1080×1920 authored coordinates. | Number | `305` |
| `DROP_POSITIONS.Maya.y` | Drop-circle center in 1080×1920 authored coordinates. | Number | `940` |
| `DROP_POSITIONS.Ahmose` | Drop-circle center in 1080×1920 authored coordinates. | Object | `{"x":775,"y":970}` |
| `DROP_POSITIONS.Ahmose.x` | Drop-circle center in 1080×1920 authored coordinates. | Number | `775` |
| `DROP_POSITIONS.Ahmose.y` | Drop-circle center in 1080×1920 authored coordinates. | Number | `970` |
| `DROP_POSITIONS.Nefertiti` | Drop-circle center in 1080×1920 authored coordinates. | Object | `{"x":735,"y":190}` |
| `DROP_POSITIONS.Nefertiti.x` | Drop-circle center in 1080×1920 authored coordinates. | Number | `735` |
| `DROP_POSITIONS.Nefertiti.y` | Drop-circle center in 1080×1920 authored coordinates. | Number | `190` |
| `DROP_POSITIONS.Merneptah` | Drop-circle center in 1080×1920 authored coordinates. | Object | `{"x":845,"y":380}` |
| `DROP_POSITIONS.Merneptah.x` | Drop-circle center in 1080×1920 authored coordinates. | Number | `845` |
| `DROP_POSITIONS.Merneptah.y` | Drop-circle center in 1080×1920 authored coordinates. | Number | `380` |
| `DROP_POSITIONS.Khasekhemwy` | Drop-circle center in 1080×1920 authored coordinates. | Object | `{"x":850,"y":780}` |
| `DROP_POSITIONS.Khasekhemwy.x` | Drop-circle center in 1080×1920 authored coordinates. | Number | `850` |
| `DROP_POSITIONS.Khasekhemwy.y` | Drop-circle center in 1080×1920 authored coordinates. | Number | `780` |
| `CLUE_TITLE` | Heading shown above the clue rows. | String | `"SOLVE THE CASE:"` |
| `CLUE_LAYOUT` | Centered clue typography size or authored Y coordinate. | Object | `{"titleFontSize":69,"clueFontSize":40,"titleY":1475,"clueYPositions":[1550,1610,1670,1730,1790,1850]}` |
| `CLUE_LAYOUT.titleFontSize` | Centered clue typography size or authored Y coordinate. | Number | `69` |
| `CLUE_LAYOUT.clueFontSize` | Centered clue typography size or authored Y coordinate. | Number | `40` |
| `CLUE_LAYOUT.titleY` | Centered clue typography size or authored Y coordinate. | Number | `1475` |
| `CLUE_LAYOUT.clueYPositions` | Centered clue typography size or authored Y coordinate. | Array | `[1550,1610,1670,1730,1790,1850]` |
| `CLUES` | Ordered clue-row content and its matching character. | Array | `[{"character":"Khasekhemwy","text":"Khasekhemwy is deceased."},{"character":"Ahmose","text":"Ahmose is near the body."},{"character":"Nefertiti","text":"Nefertiti is crying on the couch."},{"character":"Maya","text":"Maya had too much date wine last night."},{"character":"Aisha","text":"The traitor is escaping through the window."},{"character":"Merneptah","text":"Merneptah is with his scrolls and toys."}]` |
| `CLUES[]` | Ordered clue-row content and its matching character. | Object | `{"character":"Khasekhemwy","text":"Khasekhemwy is deceased."}` |
| `CLUES[].character` | Ordered clue-row content and its matching character. | String | `"Khasekhemwy"` |
| `CLUES[].text` | Ordered clue-row content and its matching character. | String | `"Khasekhemwy is deceased."` |
| `COLORS` | Runtime UI color in CSS hex notation. | Object | `{"title":"#9a2424","clue":"#512e10","strike":"#c22525","overlay":"#000000"}` |
| `COLORS.title` | Runtime UI color in CSS hex notation. | String | `"#9a2424"` |
| `COLORS.clue` | Runtime UI color in CSS hex notation. | String | `"#512e10"` |
| `COLORS.strike` | Runtime UI color in CSS hex notation. | String | `"#c22525"` |
| `COLORS.overlay` | Runtime UI color in CSS hex notation. | String | `"#000000"` |
| `TIMING` | Animation timing in milliseconds. | Object | `{"snapMs":260,"returnMs":340,"errorBlinkMs":260,"dropCircleSpinMs":900,"completionDelayMs":1000,"overlayFadeMs":260,"logoFadeMs":260,"logoScaleMs":650,"logoPulseMs":850}` |
| `TIMING.snapMs` | Animation timing in milliseconds. | Number | `260` |
| `TIMING.returnMs` | Animation timing in milliseconds. | Number | `340` |
| `TIMING.errorBlinkMs` | Animation timing in milliseconds. | Number | `260` |
| `TIMING.dropCircleSpinMs` | Animation timing in milliseconds. | Number | `900` |
| `TIMING.completionDelayMs` | Animation timing in milliseconds. | Number | `1000` |
| `TIMING.overlayFadeMs` | Animation timing in milliseconds. | Number | `260` |
| `TIMING.logoFadeMs` | Animation timing in milliseconds. | Number | `260` |
| `TIMING.logoScaleMs` | Animation timing in milliseconds. | Number | `650` |
| `TIMING.logoPulseMs` | Animation timing in milliseconds. | Number | `850` |
| `CHANGABLE_TEXTURES` | Replaceable texture slot metadata and display tuning. | Array | `[{"spriteName":"map-bg","path":"","originalSize":{"width":1254,"height":1254},"format":"webp","uuid":"map-bg","resizeBlocked":true,"anchorPoint":{"x":0.5,"y":0.5},"scale":1},{"spriteName":"character-bg","path":"","originalSize":{"width":1080,"height":285},"format":"webp","uuid":"character-bg","resizeBlocked":true,"anchorPoint":{"x":0.5,"y":0.5},"scale":1},{"spriteName":"clue-bg","path":"","originalSize":{"width":1080,"height":555},"format":"webp","uuid":"clue-bg","resizeBlocked":true,"anchorPoint":{"x":0.5,"y":0.5},"scale":1},{"spriteName":"drop-circle","path":"","originalSize":{"width":101,"height":101},"format":"webp","uuid":"drop-circle","resizeBlocked":true,"anchorPoint":{"x":0.5,"y":0.5},"scale":1},{"spriteName":"error","path":"","originalSize":{"width":2000,"height":2000},"format":"webp","uuid":"error","resizeBlocked":true,"anchorPoint":{"x":0.5,"y":0.5},"scale":1},{"spriteName":"logo","path":"","originalSize":{"width":1347,"height":1167},"format":"webp","uuid":"logo","resizeBlocked":true,"anchorPoint":{"x":0.5,"y":0.5},"scale":1},{"spriteName":"tutorial-hand","path":"","originalSize":{"width":1534,"height":1534},"format":"webp","uuid":"tutorial-hand","resizeBlocked":true,"anchorPoint":{"x":0.23,"y":0.15},"scale":1},{"spriteName":"Aisha","path":"","originalSize":{"width":200,"height":286},"format":"webp","uuid":"Aisha","resizeBlocked":true,"anchorPoint":{"x":0.5,"y":0.5},"scale":1},{"spriteName":"Maya","path":"","originalSize":{"width":200,"height":286},"format":"webp","uuid":"Maya","resizeBlocked":true,"anchorPoint":{"x":0.5,"y":0.5},"scale":1},{"spriteName":"Ahmose","path":"","originalSize":{"width":200,"height":286},"format":"webp","uuid":"Ahmose","resizeBlocked":true,"anchorPoint":{"x":0.5,"y":0.5},"scale":1},{"spriteName":"Nefertiti","path":"","originalSize":{"width":200,"height":286},"format":"webp","uuid":"Nefertiti","resizeBlocked":true,"anchorPoint":{"x":0.5,"y":0.5},"scale":1},{"spriteName":"Merneptah","path":"","originalSize":{"width":200,"height":286},"format":"webp","uuid":"Merneptah","resizeBlocked":true,"anchorPoint":{"x":0.5,"y":0.5},"scale":1},{"spriteName":"Khasekhemwy","path":"","originalSize":{"width":200,"height":286},"format":"webp","uuid":"Khasekhemwy","resizeBlocked":true,"anchorPoint":{"x":0.5,"y":0.5},"scale":1}]` |
| `CHANGABLE_TEXTURES[]` | Replaceable texture slot metadata and display tuning. | Object | `{"spriteName":"map-bg","path":"","originalSize":{"width":1254,"height":1254},"format":"webp","uuid":"map-bg","resizeBlocked":true,"anchorPoint":{"x":0.5,"y":0.5},"scale":1}` |
| `CHANGABLE_TEXTURES[].spriteName` | Replaceable texture slot metadata and display tuning. | String | `"map-bg"` |
| `CHANGABLE_TEXTURES[].path` | Replaceable texture slot metadata and display tuning. | String | `""` |
| `CHANGABLE_TEXTURES[].originalSize` | Replaceable texture slot metadata and display tuning. | Object | `{"width":1254,"height":1254}` |
| `CHANGABLE_TEXTURES[].originalSize.width` | Replaceable texture slot metadata and display tuning. | Number | `1254` |
| `CHANGABLE_TEXTURES[].originalSize.height` | Replaceable texture slot metadata and display tuning. | Number | `1254` |
| `CHANGABLE_TEXTURES[].format` | Replaceable texture slot metadata and display tuning. | String | `"webp"` |
| `CHANGABLE_TEXTURES[].uuid` | Replaceable texture slot metadata and display tuning. | String | `"map-bg"` |
| `CHANGABLE_TEXTURES[].resizeBlocked` | Replaceable texture slot metadata and display tuning. | Boolean | `true` |
| `CHANGABLE_TEXTURES[].anchorPoint` | Replaceable texture slot metadata and display tuning. | Object | `{"x":0.5,"y":0.5}` |
| `CHANGABLE_TEXTURES[].anchorPoint.x` | Replaceable texture slot metadata and display tuning. | Number | `0.5` |
| `CHANGABLE_TEXTURES[].anchorPoint.y` | Replaceable texture slot metadata and display tuning. | Number | `0.5` |
| `CHANGABLE_TEXTURES[].scale` | Replaceable texture slot metadata and display tuning. | Number | `1` |
| `CHANGABLE_SOUNDTRACKS` | Replaceable audio slot metadata and playback tuning. | Array | `[{"id":"bgm","path":"","volume":0.35,"loop":true,"format":"mp3","uuid":"bgm"},{"id":"pick-drop-character","path":"","volume":0.8,"loop":false,"format":"mp3","uuid":"pick-drop-character"},{"id":"return","path":"","volume":0.8,"loop":false,"format":"mp3","uuid":"return"},{"id":"correct","path":"","volume":0.9,"loop":false,"format":"mp3","uuid":"correct"},{"id":"wrong","path":"","volume":0.85,"loop":false,"format":"mp3","uuid":"wrong"},{"id":"red-strike","path":"","volume":0.25,"loop":false,"format":"mp3","uuid":"red-strike"},{"id":"endcard","path":"","volume":1,"loop":false,"format":"mp3","uuid":"endcard"},{"id":"ahmose-sfx","path":"","volume":1,"loop":false,"format":"mp3","uuid":"ahmose-sfx"},{"id":"maya-sfx","path":"","volume":1,"loop":false,"format":"mp3","uuid":"maya-sfx"},{"id":"merneptah-sfx","path":"","volume":1,"loop":false,"format":"mp3","uuid":"merneptah-sfx"},{"id":"nefertiti-sfx","path":"","volume":1,"loop":false,"format":"mp3","uuid":"nefertiti-sfx"}]` |
| `CHANGABLE_SOUNDTRACKS[]` | Replaceable audio slot metadata and playback tuning. | Object | `{"id":"bgm","path":"","volume":0.35,"loop":true,"format":"mp3","uuid":"bgm"}` |
| `CHANGABLE_SOUNDTRACKS[].id` | Replaceable audio slot metadata and playback tuning. | String | `"bgm"` |
| `CHANGABLE_SOUNDTRACKS[].path` | Replaceable audio slot metadata and playback tuning. | String | `""` |
| `CHANGABLE_SOUNDTRACKS[].volume` | Replaceable audio slot metadata and playback tuning. | Number | `0.35` |
| `CHANGABLE_SOUNDTRACKS[].loop` | Replaceable audio slot metadata and playback tuning. | Boolean | `true` |
| `CHANGABLE_SOUNDTRACKS[].format` | Replaceable audio slot metadata and playback tuning. | String | `"mp3"` |
| `CHANGABLE_SOUNDTRACKS[].uuid` | Replaceable audio slot metadata and playback tuning. | String | `"bgm"` |
