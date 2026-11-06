# Game configuration

Defaults match the original source. Configure before startup through an accessor injected immediately after `<head>`. Nested objects merge; quoted dotted paths expand; ordinary arrays replace; texture and audio slots merge by uuid or runtime key. Empty paths use embedded original assets; relative URLs and data URIs override them. The `9999` limit is unlimited. The original runtime does not enforce `timeLimit`; it is retained as metadata for compatibility.

| Variable name | What it controls | Accepted value types and range | Default value used |
|---|---|---|---|
| `APP_LINKS.app_store` | Platform store redirect destination | URL string | `"https://apps.apple.com/ph/app/clue-master-logic-puzzles/id6608973267"` |
| `APP_LINKS.google_play` | Platform store redirect destination | URL string | `"https://play.google.com/store/apps/details?id=com.luwukmeliana.lexicard&hl=en"` |
| `MUTE` | Mute music and sound effects | boolean | `false` |
| `GAME_LENGTH.timeLimit` | Compatibility metadata, not enforced by the original or this translation | number; retain 9999 | `9999` |
| `GAME_LENGTH.clickLimit` | Unsolved portrait presses before end card | positive integer; 9999 means unlimited | `9999` |
| `GAME_BACKGROUND_TYPE` | GAME_BACKGROUND_TYPE | string | `"Color"` |
| `GAME_BACKGROUND_COLOR` | GAME_BACKGROUND_COLOR | array | `[207, 152, 98]` |
| `SHOW_PACKSHOT` | Show the completion overlay, logo and CTA | boolean | `true` |
| `HAND_TUTOR_MODE` | Enable opening and inactivity hand tutorials | boolean | `true` |
| `TUTORIAL_DELAY` | Idle seconds before a hand hint | number >= 0 | `5` |
| `TUTORIAL.openingCharacter` | openingCharacter | string | `"Senen"` |
| `TUTORIAL.overlayAlpha` | overlayAlpha | number; retain authored range | `0.68` |
| `TUTORIAL.ghostAlpha` | ghostAlpha | number; retain authored range | `0.5` |
| `TUTORIAL.handWidth` | handWidth | number; retain authored range | `200` |
| `TUTORIAL.pressScale` | pressScale | number; retain authored range | `0.9` |
| `TUTORIAL.stepDelayMs` | stepDelayMs | number; retain authored range | `320` |
| `TUTORIAL.moveMs` | moveMs | number; retain authored range | `900` |
| `TUTORIAL.fadeMs` | fadeMs | number; retain authored range | `260` |
| `TUTORIAL.highlightPaddingX` | highlightPaddingX | number; retain authored range | `34` |
| `TUTORIAL.highlightPaddingY` | highlightPaddingY | number; retain authored range | `20` |
| `LOGO_WIDTH` | LOGO_WIDTH | number; retain authored range | `900` |
| `LAYOUT.map.x` | x | number; retain authored range | `0` |
| `LAYOUT.map.y` | y | number; retain authored range | `0` |
| `LAYOUT.map.width` | width | number; retain authored range | `1080` |
| `LAYOUT.map.height` | height | number; retain authored range | `1080` |
| `LAYOUT.characters.x` | x | number; retain authored range | `0` |
| `LAYOUT.characters.y` | y | number; retain authored range | `1080` |
| `LAYOUT.characters.width` | width | number; retain authored range | `1080` |
| `LAYOUT.characters.height` | height | number; retain authored range | `285` |
| `LAYOUT.clues.x` | x | number; retain authored range | `0` |
| `LAYOUT.clues.y` | y | number; retain authored range | `1365` |
| `LAYOUT.clues.width` | width | number; retain authored range | `1080` |
| `LAYOUT.clues.height` | height | number; retain authored range | `555` |
| `CHARACTER_HOME_Y` | CHARACTER_HOME_Y | number; retain authored range | `1222.5` |
| `CHARACTER_LIST_MARGIN_X` | CHARACTER_LIST_MARGIN_X | number; retain authored range | `32` |
| `CHARACTER_HEIGHT` | CHARACTER_HEIGHT | number; retain authored range | `205` |
| `PLACED_CHARACTER_HEIGHT` | PLACED_CHARACTER_HEIGHT | number; retain authored range | `190` |
| `DROP_CIRCLE_SIZE` | DROP_CIRCLE_SIZE | number; retain authored range | `75` |
| `DROP_RADIUS` | DROP_RADIUS | number; retain authored range | `75` |
| `DROP_POSITIONS.Tia.x` | x | number; retain authored range | `260` |
| `DROP_POSITIONS.Tia.y` | y | number; retain authored range | `350` |
| `DROP_POSITIONS.Nebet.x` | x | number; retain authored range | `305` |
| `DROP_POSITIONS.Nebet.y` | y | number; retain authored range | `940` |
| `DROP_POSITIONS.Nakht.x` | x | number; retain authored range | `775` |
| `DROP_POSITIONS.Nakht.y` | y | number; retain authored range | `970` |
| `DROP_POSITIONS.Merit.x` | x | number; retain authored range | `735` |
| `DROP_POSITIONS.Merit.y` | y | number; retain authored range | `190` |
| `DROP_POSITIONS.Huy.x` | x | number; retain authored range | `845` |
| `DROP_POSITIONS.Huy.y` | y | number; retain authored range | `380` |
| `DROP_POSITIONS.Senen.x` | x | number; retain authored range | `850` |
| `DROP_POSITIONS.Senen.y` | y | number; retain authored range | `780` |
| `CLUE_TITLE` | CLUE_TITLE | string | `"MYSTERY MASTER"` |
| `CLUE_LAYOUT.titleFontSize` | titleFontSize | number; retain authored range | `69` |
| `CLUE_LAYOUT.clueFontSize` | clueFontSize | number; retain authored range | `40` |
| `CLUE_LAYOUT.titleY` | titleY | number; retain authored range | `1475` |
| `CLUE_LAYOUT.clueYPositions` | clueYPositions | array | `[1550, 1610, 1670, 1730, 1790, 1850]` |
| `CLUES[0].character` | character | string | `"Senen"` |
| `CLUES[0].text` | text | string | `"Senen is deceased."` |
| `CLUES[1].character` | character | string | `"Nakht"` |
| `CLUES[1].text` | text | string | `"Nakht is near the body."` |
| `CLUES[2].character` | character | string | `"Merit"` |
| `CLUES[2].text` | text | string | `"Merit is crying on the couch."` |
| `CLUES[3].character` | character | string | `"Nebet"` |
| `CLUES[3].text` | text | string | `"Nebet had too much date wine last night."` |
| `CLUES[4].character` | character | string | `"Tia"` |
| `CLUES[4].text` | text | string | `"The traitor is escaping through the window."` |
| `CLUES[5].character` | character | string | `"Huy"` |
| `CLUES[5].text` | text | string | `"Huy is with his scrolls and toys."` |
| `COLORS.title` | title | string | `"#9a2424"` |
| `COLORS.clue` | clue | string | `"#512e10"` |
| `COLORS.strike` | strike | string | `"#c22525"` |
| `COLORS.overlay` | overlay | string | `"#000000"` |
| `TIMING.snapMs` | Animation or transition duration in milliseconds | number >= 0 | `260` |
| `TIMING.returnMs` | Animation or transition duration in milliseconds | number >= 0 | `340` |
| `TIMING.errorBlinkMs` | Animation or transition duration in milliseconds | number >= 0 | `260` |
| `TIMING.dropCircleSpinMs` | Animation or transition duration in milliseconds | number >= 0 | `900` |
| `TIMING.completionDelayMs` | Animation or transition duration in milliseconds | number >= 0 | `1000` |
| `TIMING.overlayFadeMs` | Animation or transition duration in milliseconds | number >= 0 | `260` |
| `TIMING.logoFadeMs` | Animation or transition duration in milliseconds | number >= 0 | `260` |
| `TIMING.logoScaleMs` | Animation or transition duration in milliseconds | number >= 0 | `650` |
| `TIMING.logoPulseMs` | Animation or transition duration in milliseconds | number >= 0 | `850` |
| `CHANGABLE_TEXTURES[0].spriteName` | Stable key used to resolve an editable asset slot | existing runtime key string | `"map-bg"` |
| `CHANGABLE_TEXTURES[0].path` | Replacement asset URL/data URI; empty uses bundled original | string | `""` |
| `CHANGABLE_TEXTURES[0].originalSize.width` | Texture source dimension used for aspect ratio and unblocked resizing | positive integer pixels | `1254` |
| `CHANGABLE_TEXTURES[0].originalSize.height` | Texture source dimension used for aspect ratio and unblocked resizing | positive integer pixels | `1254` |
| `CHANGABLE_TEXTURES[0].format` | Media format metadata | webp for images; mp3 for sounds | `"webp"` |
| `CHANGABLE_TEXTURES[0].uuid` | Stable key used to resolve an editable asset slot | existing runtime key string | `"map-bg"` |
| `CHANGABLE_TEXTURES[0].resizeBlocked` | Keep authored layout size instead of replacement originalSize | boolean | `true` |
| `CHANGABLE_TEXTURES[0].anchorPoint.x` | Texture origin fraction | number 0 to 1 | `0.5` |
| `CHANGABLE_TEXTURES[0].anchorPoint.y` | Texture origin fraction | number 0 to 1 | `0.5` |
| `CHANGABLE_TEXTURES[0].scale` | Multiplier on the authored responsive texture size | number > 0 | `1` |
| `CHANGABLE_TEXTURES[1].spriteName` | Stable key used to resolve an editable asset slot | existing runtime key string | `"character-bg"` |
| `CHANGABLE_TEXTURES[1].path` | Replacement asset URL/data URI; empty uses bundled original | string | `""` |
| `CHANGABLE_TEXTURES[1].originalSize.width` | Texture source dimension used for aspect ratio and unblocked resizing | positive integer pixels | `1080` |
| `CHANGABLE_TEXTURES[1].originalSize.height` | Texture source dimension used for aspect ratio and unblocked resizing | positive integer pixels | `285` |
| `CHANGABLE_TEXTURES[1].format` | Media format metadata | webp for images; mp3 for sounds | `"webp"` |
| `CHANGABLE_TEXTURES[1].uuid` | Stable key used to resolve an editable asset slot | existing runtime key string | `"character-bg"` |
| `CHANGABLE_TEXTURES[1].resizeBlocked` | Keep authored layout size instead of replacement originalSize | boolean | `true` |
| `CHANGABLE_TEXTURES[1].anchorPoint.x` | Texture origin fraction | number 0 to 1 | `0.5` |
| `CHANGABLE_TEXTURES[1].anchorPoint.y` | Texture origin fraction | number 0 to 1 | `0.5` |
| `CHANGABLE_TEXTURES[1].scale` | Multiplier on the authored responsive texture size | number > 0 | `1` |
| `CHANGABLE_TEXTURES[2].spriteName` | Stable key used to resolve an editable asset slot | existing runtime key string | `"clue-bg"` |
| `CHANGABLE_TEXTURES[2].path` | Replacement asset URL/data URI; empty uses bundled original | string | `""` |
| `CHANGABLE_TEXTURES[2].originalSize.width` | Texture source dimension used for aspect ratio and unblocked resizing | positive integer pixels | `1080` |
| `CHANGABLE_TEXTURES[2].originalSize.height` | Texture source dimension used for aspect ratio and unblocked resizing | positive integer pixels | `555` |
| `CHANGABLE_TEXTURES[2].format` | Media format metadata | webp for images; mp3 for sounds | `"webp"` |
| `CHANGABLE_TEXTURES[2].uuid` | Stable key used to resolve an editable asset slot | existing runtime key string | `"clue-bg"` |
| `CHANGABLE_TEXTURES[2].resizeBlocked` | Keep authored layout size instead of replacement originalSize | boolean | `true` |
| `CHANGABLE_TEXTURES[2].anchorPoint.x` | Texture origin fraction | number 0 to 1 | `0.5` |
| `CHANGABLE_TEXTURES[2].anchorPoint.y` | Texture origin fraction | number 0 to 1 | `0.5` |
| `CHANGABLE_TEXTURES[2].scale` | Multiplier on the authored responsive texture size | number > 0 | `1` |
| `CHANGABLE_TEXTURES[3].spriteName` | Stable key used to resolve an editable asset slot | existing runtime key string | `"drop-circle"` |
| `CHANGABLE_TEXTURES[3].path` | Replacement asset URL/data URI; empty uses bundled original | string | `""` |
| `CHANGABLE_TEXTURES[3].originalSize.width` | Texture source dimension used for aspect ratio and unblocked resizing | positive integer pixels | `101` |
| `CHANGABLE_TEXTURES[3].originalSize.height` | Texture source dimension used for aspect ratio and unblocked resizing | positive integer pixels | `101` |
| `CHANGABLE_TEXTURES[3].format` | Media format metadata | webp for images; mp3 for sounds | `"webp"` |
| `CHANGABLE_TEXTURES[3].uuid` | Stable key used to resolve an editable asset slot | existing runtime key string | `"drop-circle"` |
| `CHANGABLE_TEXTURES[3].resizeBlocked` | Keep authored layout size instead of replacement originalSize | boolean | `true` |
| `CHANGABLE_TEXTURES[3].anchorPoint.x` | Texture origin fraction | number 0 to 1 | `0.5` |
| `CHANGABLE_TEXTURES[3].anchorPoint.y` | Texture origin fraction | number 0 to 1 | `0.5` |
| `CHANGABLE_TEXTURES[3].scale` | Multiplier on the authored responsive texture size | number > 0 | `1` |
| `CHANGABLE_TEXTURES[4].spriteName` | Stable key used to resolve an editable asset slot | existing runtime key string | `"error"` |
| `CHANGABLE_TEXTURES[4].path` | Replacement asset URL/data URI; empty uses bundled original | string | `""` |
| `CHANGABLE_TEXTURES[4].originalSize.width` | Texture source dimension used for aspect ratio and unblocked resizing | positive integer pixels | `2000` |
| `CHANGABLE_TEXTURES[4].originalSize.height` | Texture source dimension used for aspect ratio and unblocked resizing | positive integer pixels | `2000` |
| `CHANGABLE_TEXTURES[4].format` | Media format metadata | webp for images; mp3 for sounds | `"webp"` |
| `CHANGABLE_TEXTURES[4].uuid` | Stable key used to resolve an editable asset slot | existing runtime key string | `"error"` |
| `CHANGABLE_TEXTURES[4].resizeBlocked` | Keep authored layout size instead of replacement originalSize | boolean | `true` |
| `CHANGABLE_TEXTURES[4].anchorPoint.x` | Texture origin fraction | number 0 to 1 | `0.5` |
| `CHANGABLE_TEXTURES[4].anchorPoint.y` | Texture origin fraction | number 0 to 1 | `0.5` |
| `CHANGABLE_TEXTURES[4].scale` | Multiplier on the authored responsive texture size | number > 0 | `1` |
| `CHANGABLE_TEXTURES[5].spriteName` | Stable key used to resolve an editable asset slot | existing runtime key string | `"logo"` |
| `CHANGABLE_TEXTURES[5].path` | Replacement asset URL/data URI; empty uses bundled original | string | `""` |
| `CHANGABLE_TEXTURES[5].originalSize.width` | Texture source dimension used for aspect ratio and unblocked resizing | positive integer pixels | `1254` |
| `CHANGABLE_TEXTURES[5].originalSize.height` | Texture source dimension used for aspect ratio and unblocked resizing | positive integer pixels | `1254` |
| `CHANGABLE_TEXTURES[5].format` | Media format metadata | webp for images; mp3 for sounds | `"webp"` |
| `CHANGABLE_TEXTURES[5].uuid` | Stable key used to resolve an editable asset slot | existing runtime key string | `"logo"` |
| `CHANGABLE_TEXTURES[5].resizeBlocked` | Keep authored layout size instead of replacement originalSize | boolean | `true` |
| `CHANGABLE_TEXTURES[5].anchorPoint.x` | Texture origin fraction | number 0 to 1 | `0.5` |
| `CHANGABLE_TEXTURES[5].anchorPoint.y` | Texture origin fraction | number 0 to 1 | `0.5` |
| `CHANGABLE_TEXTURES[5].scale` | Multiplier on the authored responsive texture size | number > 0 | `1` |
| `CHANGABLE_TEXTURES[6].spriteName` | Stable key used to resolve an editable asset slot | existing runtime key string | `"tutorial-hand"` |
| `CHANGABLE_TEXTURES[6].path` | Replacement asset URL/data URI; empty uses bundled original | string | `""` |
| `CHANGABLE_TEXTURES[6].originalSize.width` | Texture source dimension used for aspect ratio and unblocked resizing | positive integer pixels | `512` |
| `CHANGABLE_TEXTURES[6].originalSize.height` | Texture source dimension used for aspect ratio and unblocked resizing | positive integer pixels | `512` |
| `CHANGABLE_TEXTURES[6].format` | Media format metadata | webp for images; mp3 for sounds | `"webp"` |
| `CHANGABLE_TEXTURES[6].uuid` | Stable key used to resolve an editable asset slot | existing runtime key string | `"tutorial-hand"` |
| `CHANGABLE_TEXTURES[6].resizeBlocked` | Keep authored layout size instead of replacement originalSize | boolean | `true` |
| `CHANGABLE_TEXTURES[6].anchorPoint.x` | Texture origin fraction | number 0 to 1 | `0.23` |
| `CHANGABLE_TEXTURES[6].anchorPoint.y` | Texture origin fraction | number 0 to 1 | `0.15` |
| `CHANGABLE_TEXTURES[6].scale` | Multiplier on the authored responsive texture size | number > 0 | `1` |
| `CHANGABLE_TEXTURES[7].spriteName` | Stable key used to resolve an editable asset slot | existing runtime key string | `"Tia"` |
| `CHANGABLE_TEXTURES[7].path` | Replacement asset URL/data URI; empty uses bundled original | string | `""` |
| `CHANGABLE_TEXTURES[7].originalSize.width` | Texture source dimension used for aspect ratio and unblocked resizing | positive integer pixels | `200` |
| `CHANGABLE_TEXTURES[7].originalSize.height` | Texture source dimension used for aspect ratio and unblocked resizing | positive integer pixels | `286` |
| `CHANGABLE_TEXTURES[7].format` | Media format metadata | webp for images; mp3 for sounds | `"webp"` |
| `CHANGABLE_TEXTURES[7].uuid` | Stable key used to resolve an editable asset slot | existing runtime key string | `"Tia"` |
| `CHANGABLE_TEXTURES[7].resizeBlocked` | Keep authored layout size instead of replacement originalSize | boolean | `true` |
| `CHANGABLE_TEXTURES[7].anchorPoint.x` | Texture origin fraction | number 0 to 1 | `0.5` |
| `CHANGABLE_TEXTURES[7].anchorPoint.y` | Texture origin fraction | number 0 to 1 | `0.5` |
| `CHANGABLE_TEXTURES[7].scale` | Multiplier on the authored responsive texture size | number > 0 | `1` |
| `CHANGABLE_TEXTURES[8].spriteName` | Stable key used to resolve an editable asset slot | existing runtime key string | `"Nebet"` |
| `CHANGABLE_TEXTURES[8].path` | Replacement asset URL/data URI; empty uses bundled original | string | `""` |
| `CHANGABLE_TEXTURES[8].originalSize.width` | Texture source dimension used for aspect ratio and unblocked resizing | positive integer pixels | `200` |
| `CHANGABLE_TEXTURES[8].originalSize.height` | Texture source dimension used for aspect ratio and unblocked resizing | positive integer pixels | `286` |
| `CHANGABLE_TEXTURES[8].format` | Media format metadata | webp for images; mp3 for sounds | `"webp"` |
| `CHANGABLE_TEXTURES[8].uuid` | Stable key used to resolve an editable asset slot | existing runtime key string | `"Nebet"` |
| `CHANGABLE_TEXTURES[8].resizeBlocked` | Keep authored layout size instead of replacement originalSize | boolean | `true` |
| `CHANGABLE_TEXTURES[8].anchorPoint.x` | Texture origin fraction | number 0 to 1 | `0.5` |
| `CHANGABLE_TEXTURES[8].anchorPoint.y` | Texture origin fraction | number 0 to 1 | `0.5` |
| `CHANGABLE_TEXTURES[8].scale` | Multiplier on the authored responsive texture size | number > 0 | `1` |
| `CHANGABLE_TEXTURES[9].spriteName` | Stable key used to resolve an editable asset slot | existing runtime key string | `"Nakht"` |
| `CHANGABLE_TEXTURES[9].path` | Replacement asset URL/data URI; empty uses bundled original | string | `""` |
| `CHANGABLE_TEXTURES[9].originalSize.width` | Texture source dimension used for aspect ratio and unblocked resizing | positive integer pixels | `200` |
| `CHANGABLE_TEXTURES[9].originalSize.height` | Texture source dimension used for aspect ratio and unblocked resizing | positive integer pixels | `286` |
| `CHANGABLE_TEXTURES[9].format` | Media format metadata | webp for images; mp3 for sounds | `"webp"` |
| `CHANGABLE_TEXTURES[9].uuid` | Stable key used to resolve an editable asset slot | existing runtime key string | `"Nakht"` |
| `CHANGABLE_TEXTURES[9].resizeBlocked` | Keep authored layout size instead of replacement originalSize | boolean | `true` |
| `CHANGABLE_TEXTURES[9].anchorPoint.x` | Texture origin fraction | number 0 to 1 | `0.5` |
| `CHANGABLE_TEXTURES[9].anchorPoint.y` | Texture origin fraction | number 0 to 1 | `0.5` |
| `CHANGABLE_TEXTURES[9].scale` | Multiplier on the authored responsive texture size | number > 0 | `1` |
| `CHANGABLE_TEXTURES[10].spriteName` | Stable key used to resolve an editable asset slot | existing runtime key string | `"Merit"` |
| `CHANGABLE_TEXTURES[10].path` | Replacement asset URL/data URI; empty uses bundled original | string | `""` |
| `CHANGABLE_TEXTURES[10].originalSize.width` | Texture source dimension used for aspect ratio and unblocked resizing | positive integer pixels | `200` |
| `CHANGABLE_TEXTURES[10].originalSize.height` | Texture source dimension used for aspect ratio and unblocked resizing | positive integer pixels | `286` |
| `CHANGABLE_TEXTURES[10].format` | Media format metadata | webp for images; mp3 for sounds | `"webp"` |
| `CHANGABLE_TEXTURES[10].uuid` | Stable key used to resolve an editable asset slot | existing runtime key string | `"Merit"` |
| `CHANGABLE_TEXTURES[10].resizeBlocked` | Keep authored layout size instead of replacement originalSize | boolean | `true` |
| `CHANGABLE_TEXTURES[10].anchorPoint.x` | Texture origin fraction | number 0 to 1 | `0.5` |
| `CHANGABLE_TEXTURES[10].anchorPoint.y` | Texture origin fraction | number 0 to 1 | `0.5` |
| `CHANGABLE_TEXTURES[10].scale` | Multiplier on the authored responsive texture size | number > 0 | `1` |
| `CHANGABLE_TEXTURES[11].spriteName` | Stable key used to resolve an editable asset slot | existing runtime key string | `"Huy"` |
| `CHANGABLE_TEXTURES[11].path` | Replacement asset URL/data URI; empty uses bundled original | string | `""` |
| `CHANGABLE_TEXTURES[11].originalSize.width` | Texture source dimension used for aspect ratio and unblocked resizing | positive integer pixels | `200` |
| `CHANGABLE_TEXTURES[11].originalSize.height` | Texture source dimension used for aspect ratio and unblocked resizing | positive integer pixels | `286` |
| `CHANGABLE_TEXTURES[11].format` | Media format metadata | webp for images; mp3 for sounds | `"webp"` |
| `CHANGABLE_TEXTURES[11].uuid` | Stable key used to resolve an editable asset slot | existing runtime key string | `"Huy"` |
| `CHANGABLE_TEXTURES[11].resizeBlocked` | Keep authored layout size instead of replacement originalSize | boolean | `true` |
| `CHANGABLE_TEXTURES[11].anchorPoint.x` | Texture origin fraction | number 0 to 1 | `0.5` |
| `CHANGABLE_TEXTURES[11].anchorPoint.y` | Texture origin fraction | number 0 to 1 | `0.5` |
| `CHANGABLE_TEXTURES[11].scale` | Multiplier on the authored responsive texture size | number > 0 | `1` |
| `CHANGABLE_TEXTURES[12].spriteName` | Stable key used to resolve an editable asset slot | existing runtime key string | `"Senen"` |
| `CHANGABLE_TEXTURES[12].path` | Replacement asset URL/data URI; empty uses bundled original | string | `""` |
| `CHANGABLE_TEXTURES[12].originalSize.width` | Texture source dimension used for aspect ratio and unblocked resizing | positive integer pixels | `200` |
| `CHANGABLE_TEXTURES[12].originalSize.height` | Texture source dimension used for aspect ratio and unblocked resizing | positive integer pixels | `286` |
| `CHANGABLE_TEXTURES[12].format` | Media format metadata | webp for images; mp3 for sounds | `"webp"` |
| `CHANGABLE_TEXTURES[12].uuid` | Stable key used to resolve an editable asset slot | existing runtime key string | `"Senen"` |
| `CHANGABLE_TEXTURES[12].resizeBlocked` | Keep authored layout size instead of replacement originalSize | boolean | `true` |
| `CHANGABLE_TEXTURES[12].anchorPoint.x` | Texture origin fraction | number 0 to 1 | `0.5` |
| `CHANGABLE_TEXTURES[12].anchorPoint.y` | Texture origin fraction | number 0 to 1 | `0.5` |
| `CHANGABLE_TEXTURES[12].scale` | Multiplier on the authored responsive texture size | number > 0 | `1` |
| `CHANGABLE_SOUNDTRACKS[0].id` | Stable key used to resolve an editable asset slot | existing runtime key string | `"bgm"` |
| `CHANGABLE_SOUNDTRACKS[0].path` | Replacement asset URL/data URI; empty uses bundled original | string | `""` |
| `CHANGABLE_SOUNDTRACKS[0].volume` | Sound base gain before host volume and mute | number 0 to 1 | `0.35` |
| `CHANGABLE_SOUNDTRACKS[0].loop` | Loop music; gameplay effects remain one-shots as in the original | boolean | `true` |
| `CHANGABLE_SOUNDTRACKS[0].format` | Media format metadata | webp for images; mp3 for sounds | `"mp3"` |
| `CHANGABLE_SOUNDTRACKS[0].uuid` | Stable key used to resolve an editable asset slot | existing runtime key string | `"bgm"` |
| `CHANGABLE_SOUNDTRACKS[1].id` | Stable key used to resolve an editable asset slot | existing runtime key string | `"pick-drop-character"` |
| `CHANGABLE_SOUNDTRACKS[1].path` | Replacement asset URL/data URI; empty uses bundled original | string | `""` |
| `CHANGABLE_SOUNDTRACKS[1].volume` | Sound base gain before host volume and mute | number 0 to 1 | `0.8` |
| `CHANGABLE_SOUNDTRACKS[1].loop` | Loop music; gameplay effects remain one-shots as in the original | boolean | `false` |
| `CHANGABLE_SOUNDTRACKS[1].format` | Media format metadata | webp for images; mp3 for sounds | `"mp3"` |
| `CHANGABLE_SOUNDTRACKS[1].uuid` | Stable key used to resolve an editable asset slot | existing runtime key string | `"pick-drop-character"` |
| `CHANGABLE_SOUNDTRACKS[2].id` | Stable key used to resolve an editable asset slot | existing runtime key string | `"return"` |
| `CHANGABLE_SOUNDTRACKS[2].path` | Replacement asset URL/data URI; empty uses bundled original | string | `""` |
| `CHANGABLE_SOUNDTRACKS[2].volume` | Sound base gain before host volume and mute | number 0 to 1 | `0.8` |
| `CHANGABLE_SOUNDTRACKS[2].loop` | Loop music; gameplay effects remain one-shots as in the original | boolean | `false` |
| `CHANGABLE_SOUNDTRACKS[2].format` | Media format metadata | webp for images; mp3 for sounds | `"mp3"` |
| `CHANGABLE_SOUNDTRACKS[2].uuid` | Stable key used to resolve an editable asset slot | existing runtime key string | `"return"` |
| `CHANGABLE_SOUNDTRACKS[3].id` | Stable key used to resolve an editable asset slot | existing runtime key string | `"correct"` |
| `CHANGABLE_SOUNDTRACKS[3].path` | Replacement asset URL/data URI; empty uses bundled original | string | `""` |
| `CHANGABLE_SOUNDTRACKS[3].volume` | Sound base gain before host volume and mute | number 0 to 1 | `0.9` |
| `CHANGABLE_SOUNDTRACKS[3].loop` | Loop music; gameplay effects remain one-shots as in the original | boolean | `false` |
| `CHANGABLE_SOUNDTRACKS[3].format` | Media format metadata | webp for images; mp3 for sounds | `"mp3"` |
| `CHANGABLE_SOUNDTRACKS[3].uuid` | Stable key used to resolve an editable asset slot | existing runtime key string | `"correct"` |
| `CHANGABLE_SOUNDTRACKS[4].id` | Stable key used to resolve an editable asset slot | existing runtime key string | `"wrong"` |
| `CHANGABLE_SOUNDTRACKS[4].path` | Replacement asset URL/data URI; empty uses bundled original | string | `""` |
| `CHANGABLE_SOUNDTRACKS[4].volume` | Sound base gain before host volume and mute | number 0 to 1 | `0.85` |
| `CHANGABLE_SOUNDTRACKS[4].loop` | Loop music; gameplay effects remain one-shots as in the original | boolean | `false` |
| `CHANGABLE_SOUNDTRACKS[4].format` | Media format metadata | webp for images; mp3 for sounds | `"mp3"` |
| `CHANGABLE_SOUNDTRACKS[4].uuid` | Stable key used to resolve an editable asset slot | existing runtime key string | `"wrong"` |
| `CHANGABLE_SOUNDTRACKS[5].id` | Stable key used to resolve an editable asset slot | existing runtime key string | `"red-strike"` |
| `CHANGABLE_SOUNDTRACKS[5].path` | Replacement asset URL/data URI; empty uses bundled original | string | `""` |
| `CHANGABLE_SOUNDTRACKS[5].volume` | Sound base gain before host volume and mute | number 0 to 1 | `0.25` |
| `CHANGABLE_SOUNDTRACKS[5].loop` | Loop music; gameplay effects remain one-shots as in the original | boolean | `false` |
| `CHANGABLE_SOUNDTRACKS[5].format` | Media format metadata | webp for images; mp3 for sounds | `"mp3"` |
| `CHANGABLE_SOUNDTRACKS[5].uuid` | Stable key used to resolve an editable asset slot | existing runtime key string | `"red-strike"` |
| `CHANGABLE_SOUNDTRACKS[6].id` | Stable key used to resolve an editable asset slot | existing runtime key string | `"endcard"` |
| `CHANGABLE_SOUNDTRACKS[6].path` | Replacement asset URL/data URI; empty uses bundled original | string | `""` |
| `CHANGABLE_SOUNDTRACKS[6].volume` | Sound base gain before host volume and mute | number 0 to 1 | `1` |
| `CHANGABLE_SOUNDTRACKS[6].loop` | Loop music; gameplay effects remain one-shots as in the original | boolean | `false` |
| `CHANGABLE_SOUNDTRACKS[6].format` | Media format metadata | webp for images; mp3 for sounds | `"mp3"` |
| `CHANGABLE_SOUNDTRACKS[6].uuid` | Stable key used to resolve an editable asset slot | existing runtime key string | `"endcard"` |
| `CHANGABLE_SOUNDTRACKS[7].id` | Stable key used to resolve an editable asset slot | existing runtime key string | `"nakht-sfx"` |
| `CHANGABLE_SOUNDTRACKS[7].path` | Replacement asset URL/data URI; empty uses bundled original | string | `""` |
| `CHANGABLE_SOUNDTRACKS[7].volume` | Sound base gain before host volume and mute | number 0 to 1 | `1` |
| `CHANGABLE_SOUNDTRACKS[7].loop` | Loop music; gameplay effects remain one-shots as in the original | boolean | `false` |
| `CHANGABLE_SOUNDTRACKS[7].format` | Media format metadata | webp for images; mp3 for sounds | `"mp3"` |
| `CHANGABLE_SOUNDTRACKS[7].uuid` | Stable key used to resolve an editable asset slot | existing runtime key string | `"nakht-sfx"` |
| `CHANGABLE_SOUNDTRACKS[8].id` | Stable key used to resolve an editable asset slot | existing runtime key string | `"nebet-sfx"` |
| `CHANGABLE_SOUNDTRACKS[8].path` | Replacement asset URL/data URI; empty uses bundled original | string | `""` |
| `CHANGABLE_SOUNDTRACKS[8].volume` | Sound base gain before host volume and mute | number 0 to 1 | `1` |
| `CHANGABLE_SOUNDTRACKS[8].loop` | Loop music; gameplay effects remain one-shots as in the original | boolean | `false` |
| `CHANGABLE_SOUNDTRACKS[8].format` | Media format metadata | webp for images; mp3 for sounds | `"mp3"` |
| `CHANGABLE_SOUNDTRACKS[8].uuid` | Stable key used to resolve an editable asset slot | existing runtime key string | `"nebet-sfx"` |
| `CHANGABLE_SOUNDTRACKS[9].id` | Stable key used to resolve an editable asset slot | existing runtime key string | `"huy-sfx"` |
| `CHANGABLE_SOUNDTRACKS[9].path` | Replacement asset URL/data URI; empty uses bundled original | string | `""` |
| `CHANGABLE_SOUNDTRACKS[9].volume` | Sound base gain before host volume and mute | number 0 to 1 | `1` |
| `CHANGABLE_SOUNDTRACKS[9].loop` | Loop music; gameplay effects remain one-shots as in the original | boolean | `false` |
| `CHANGABLE_SOUNDTRACKS[9].format` | Media format metadata | webp for images; mp3 for sounds | `"mp3"` |
| `CHANGABLE_SOUNDTRACKS[9].uuid` | Stable key used to resolve an editable asset slot | existing runtime key string | `"huy-sfx"` |
| `CHANGABLE_SOUNDTRACKS[10].id` | Stable key used to resolve an editable asset slot | existing runtime key string | `"merit-sfx"` |
| `CHANGABLE_SOUNDTRACKS[10].path` | Replacement asset URL/data URI; empty uses bundled original | string | `""` |
| `CHANGABLE_SOUNDTRACKS[10].volume` | Sound base gain before host volume and mute | number 0 to 1 | `1` |
| `CHANGABLE_SOUNDTRACKS[10].loop` | Loop music; gameplay effects remain one-shots as in the original | boolean | `false` |
| `CHANGABLE_SOUNDTRACKS[10].format` | Media format metadata | webp for images; mp3 for sounds | `"mp3"` |
| `CHANGABLE_SOUNDTRACKS[10].uuid` | Stable key used to resolve an editable asset slot | existing runtime key string | `"merit-sfx"` |