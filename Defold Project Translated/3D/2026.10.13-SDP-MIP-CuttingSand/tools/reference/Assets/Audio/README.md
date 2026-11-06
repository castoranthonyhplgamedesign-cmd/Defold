# Audio Library

144 unique sounds (BGM, SFX, VO) collected from every playable under `G:\downloads\Work\Phaser` on 2026-09-30, deduplicated by file hash and by audio fingerprint, renamed by what they do, and grouped by purpose. Total 39.5 MB.

## Conventions

- **Names** are kebab-case with a type prefix: `bgm-`, `sfx-`, `vo-`. Numbered files (`-01`, `-02`, …) are variations of one sound — rotate or randomize them so repeats don't sound robotic.
- **Format** is MP3 throughout. Vendor MP3s were copied byte-for-byte, so bitrates vary (32–320 kbps). The 37 sounds that only existed as WAV were encoded at 128 kbps / 44.1 kHz — treat them as masters and let the project's convert script bring them down to the AGENTS.md budget (96 kbps SFX, short mono BGM).
- **Used in** gives the project code and the key that project loaded the sound under. "unused" means it shipped in a pack or source folder but no build played it. Codes are in the [project legend](#project-legend).
- **BGM** here is full-length unless the name says `-30s` / `-loop`. Trim to ~30 s before shipping.
- **Mood / genre labels** come from track titles, pack tags and how each project used the sound — nobody auditioned the whole set, so listen before committing.

## Folders

| Folder | What's inside | Files |
|---|---|---|
| [`BGM/Calm-Piano-Classical/`](#bgmcalm-piano-classical) | Gentle classical prelude in 3 arrangements + ad-ready 30 s cuts. Word, puzzle, mystery. | 5 |
| [`BGM/Relaxing-Garden/`](#bgmrelaxing-garden) | Light, pleasant garden theme. Cozy / casual word games. | 2 |
| [`BGM/Chill-Jazz/`](#bgmchill-jazz) | Laid-back chill and jazz beds. Detective / lifestyle. | 2 |
| [`BGM/Upbeat-Casual-Fun/`](#bgmupbeat-casual-fun) | "Bouncing with Bessie" pack: full track, 30 s cut, 6 loops, 3 short edits, 3 stems. Card / casual / kids. | 14 |
| [`BGM/Word-Puzzle/`](#bgmword-puzzle) | Tracks used by word games (Wordle, Bubble Word Jam, Zen Revealed). | 6 |
| [`BGM/Ambient-Synth/`](#bgmambient-synth) | Soft ambient synth bed. Sorting / card games. | 1 |
| [`BGM/Casino-Lounge/`](#bgmcasino-lounge) | Casino / lounge track. Solitaire, slots, cash themes. | 1 |
| [`BGM/Action-Spy-Urban/`](#bgmaction-spy-urban) | Spy, stealth and urban action tracks. Shooters / action. | 3 |
| [`BGM/Retro-8bit/`](#bgmretro-8bit) | Chiptune loop. Arcade / retro. | 1 |
| [`SFX/UI-Click-Tap/`](#sfxui-click-tap) | Buttons, clicks, snaps, soft open. | 6 |
| [`SFX/Cards/`](#sfxcards) | Flip, place, move, return, 8 tap variations. Solitaire / card sort. | 17 |
| [`SFX/Pieces-Tiles/`](#sfxpieces-tiles) | Board pieces, tiles and bubbles being picked up or set down. | 5 |
| [`SFX/Letters-Words/`](#sfxletters-words) | Typing, letter reveal and letter drag for word games. | 5 |
| [`SFX/Correct-Match/`](#sfxcorrect-match) | Correct answer, match, pop, category or row complete. | 20 |
| [`SFX/Wrong-Fail/`](#sfxwrong-fail) | Wrong answer, error, invalid move, fail. | 10 |
| [`SFX/Win-Celebration/`](#sfxwin-celebration) | Win jingles, fanfare, confetti, fireworks, end-card hit. | 8 |
| [`SFX/Whoosh-Swipe/`](#sfxwhoosh-swipe) | Swooshes for things flying in, swipes, throws. | 2 |
| [`SFX/Reveal-Magic/`](#sfxreveal-magic) | Something new appearing; energy / power-up hum. | 2 |
| [`SFX/Impacts-Breaks/`](#sfximpacts-breaks) | Stone / tile breaking, heavy body thud. | 4 |
| [`SFX/Combat-Weapons/`](#sfxcombat-weapons) | Guns, bullets, ricochets, knife stabs, gore splats. | 13 |
| [`SFX/Foley-Environment/`](#sfxfoley-environment) | Footsteps, water splashes, car horn. | 6 |
| [`SFX/Arcade-Flappy/`](#sfxarcade-flappy) | Flappy Bird style set: flap, hit, die, point, swoosh. | 5 |
| [`VO/`](#vo) | Voice-over lines (hooks + "download now" CTA) from Zen Revealed; played from a shuffled pool in the var3 build. | 6 |

## Catalog

### BGM/Calm-Piano-Classical

Gentle classical prelude in 3 arrangements + ad-ready 30 s cuts. Word, puzzle, mystery.

| File | Length | What it is | Used in | Original |
|---|---|---|---|---|
| `bgm-prelude-full-ensemble.mp3` | 2:16 | Classical prelude, full ensemble arrangement (2:16). | PPT / WSS-MJ source folder (unused) | PPT · Prelude (Full Ensemble).wav *(WAV → MP3)* |
| `bgm-prelude-piano-contrabass.mp3` | 2:16 | Same prelude, piano + contrabass arrangement (2:16). | Source for WSS-MJ `bgm` | PPT · Prelude (Piano and Contrabass).wav *(WAV → MP3)* |
| `bgm-prelude-piano-solo.mp3` | 2:16 | Same prelude, solo piano arrangement (2:16). | Source for PPT `bgm` | PPT · Prelude (Piano Solo).wav *(WAV → MP3)* |
| `bgm-prelude-piano-contrabass-30s.mp3` | 30 s | Ad-ready 30 s cut of the piano + contrabass prelude (mono 64 kbps). | WSS-MJ `bgm` | WSS-MJ · bgm.mp3 |
| `bgm-prelude-piano-solo-30s.mp3` | 30 s | Ad-ready 30 s cut of the solo piano prelude with 2 s fade-out (mono 80 kbps). | PPT `bgm` | PPT · bgm.mp3 |

### BGM/Relaxing-Garden

Light, pleasant garden theme. Cozy / casual word games.

| File | Length | What it is | Used in | Original |
|---|---|---|---|---|
| `bgm-flowering-garden-loop-32s.mp3` | 32 s | "The Flowering Garden" — light, pleasant 32 s loop. | WSS-FF `music_garden`, WSS-BF `bgm` | WSS-FF · The Flowering Garden loop.mp3 |
| `bgm-flowering-garden-full.mp3` | 2:01 | Full-length "The Flowering Garden" (2:01). | Source for WSS-FF / WSS-BF | WSS-FF · The Flowering Garden.wav *(WAV → MP3)* |

### BGM/Chill-Jazz

Laid-back chill and jazz beds. Detective / lifestyle.

| File | Length | What it is | Used in | Original |
|---|---|---|---|---|
| `bgm-chill.mp3` | 32 s | Chill background track, 32 s (320 kbps master). | PP `bgm` | PP · BGM Chill.mp3 |
| `bgm-jazz-short-loop.mp3` | 9.6 s | Short jazzy loop, ~10 s. | PP test-preview `bgm` | PP · BGM Jazz.mp3 |

### BGM/Upbeat-Casual-Fun

"Bouncing with Bessie" pack: full track, 30 s cut, 6 loops, 3 short edits, 3 stems. Card / casual / kids.

| File | Length | What it is | Used in | Original |
|---|---|---|---|---|
| `bgm-bouncing-with-bessie-full.mp3` | 2:54 | "Bouncing with Bessie" — bouncy, playful full track (2:54). | Source for SLT `bgm` | SLT · bouncing-with-bessie_main-full.wav *(WAV → MP3)* |
| `bgm-bouncing-with-bessie-30s.mp3` | 30 s | Ad-ready 30 s cut of Bouncing with Bessie. | SLT `bgm` | SLT · bgm.mp3 |
| `bgm-bouncing-with-bessie-loop-01.mp3` | 33 s | Bouncing with Bessie — seamless 33 s loop variation 1. | SLT (pack, unused) | SLT · bouncing-with-bessie_loop-01.wav *(WAV → MP3)* |
| `bgm-bouncing-with-bessie-loop-02.mp3` | 33 s | Bouncing with Bessie — seamless 33 s loop variation 2. | SLT (pack, unused) | SLT · bouncing-with-bessie_loop-02.wav *(WAV → MP3)* |
| `bgm-bouncing-with-bessie-loop-03.mp3` | 33 s | Bouncing with Bessie — seamless 33 s loop variation 3. | SLT (pack, unused) | SLT · bouncing-with-bessie_loop-03.wav *(WAV → MP3)* |
| `bgm-bouncing-with-bessie-loop-04.mp3` | 33 s | Bouncing with Bessie — seamless 33 s loop variation 4. | SLT (pack, unused) | SLT · bouncing-with-bessie_loop-04.wav *(WAV → MP3)* |
| `bgm-bouncing-with-bessie-loop-05.mp3` | 33 s | Bouncing with Bessie — seamless 33 s loop variation 5. | SLT (pack, unused) | SLT · bouncing-with-bessie_loop-05.wav *(WAV → MP3)* |
| `bgm-bouncing-with-bessie-loop-06.mp3` | 33 s | Bouncing with Bessie — seamless 33 s loop variation 6. | SLT (pack, unused) | SLT · bouncing-with-bessie_loop-06.wav *(WAV → MP3)* |
| `bgm-bouncing-with-bessie-short-21s.mp3` | 21 s | Bouncing with Bessie — 21 s short edit with ending. | SLT (pack, unused) | SLT · bouncing-with-bessie_short-01.wav *(WAV → MP3)* |
| `bgm-bouncing-with-bessie-short-44s.mp3` | 44 s | Bouncing with Bessie — 44 s short edit with ending. | SLT (pack, unused) | SLT · bouncing-with-bessie_short-02.wav *(WAV → MP3)* |
| `bgm-bouncing-with-bessie-short-62s.mp3` | 1:02 | Bouncing with Bessie — 62 s short edit with ending. | SLT (pack, unused) | SLT · bouncing-with-bessie_short-03.wav *(WAV → MP3)* |
| `Stems/bgm-bouncing-with-bessie-stem-01.mp3` | 2:54 | Bouncing with Bessie — isolated instrument stem 1 (for custom mixes). | SLT (pack, unused) | SLT · bouncing-with-bessie_stem-01.wav *(WAV → MP3)* |
| `Stems/bgm-bouncing-with-bessie-stem-02.mp3` | 2:55 | Bouncing with Bessie — isolated instrument stem 2 (for custom mixes). | SLT (pack, unused) | SLT · bouncing-with-bessie_stem-02.wav *(WAV → MP3)* |
| `Stems/bgm-bouncing-with-bessie-stem-03.mp3` | 2:55 | Bouncing with Bessie — isolated instrument stem 3 (for custom mixes). | SLT (pack, unused) | SLT · bouncing-with-bessie_stem-03.wav *(WAV → MP3)* |

### BGM/Word-Puzzle

Tracks used by word games (Wordle, Bubble Word Jam, Zen Revealed).

| File | Length | What it is | Used in | Original |
|---|---|---|---|---|
| `bgm-wordle.mp3` | 2:07 | Background loop from the Wordle playable (2:07, 32 kbps). | Wordle `bgm` | Wordle · BGM.mp3 |
| `bgm-bubble-word-jam.mp3` | 1:29 | Bubble Word Jam background track (1:29). | BWJ `bgm` (Organs + Underwater) | BWJ · bgm.mp3 |
| `bgm-zen-var1.mp3` | 41 s | Zen Revealed BGM variant 1 (41 s). | WS-Zen `bgm` (var1 build) | WS-Zen · bgm-var1.mp3 |
| `bgm-zen-var2.mp3` | 21 s | Zen Revealed BGM variant 2 (21 s). | WS-Zen `bgm` (var2 build) | WS-Zen · bgm-var2.mp3 |
| `bgm-zen-var3.mp3` | 31 s | Zen Revealed BGM variant 3 (31 s). | WS-Zen `bgm` (var3 build) | WS-Zen · bgm-var3.mp3 |
| `bgm-zen-var4.mp3` | 24 s | Zen Revealed BGM variant 4 (24 s). | WS-Zen `bgm` (var4 build) | WS-Zen · bgm-var4.mp3 |

### BGM/Ambient-Synth

Soft ambient synth bed. Sorting / card games.

| File | Length | What it is | Used in | Original |
|---|---|---|---|---|
| `bgm-synth-chimes.mp3` | 1:01 | "Synth Chimes" — soft ambient synth bed (1:01). | CTS34 `bgm`, CTS-Flags `bgm` | CTS-Flags · Synth Chimes.mp3 |

### BGM/Casino-Lounge

Casino / lounge track. Solitaire, slots, cash themes.

| File | Length | What it is | Used in | Original |
|---|---|---|---|---|
| `bgm-casino.mp3` | 1:41 | Casino / lounge background track (1:41). | SLT (source, unused) | SLT · Casino.wav *(WAV → MP3)* |

### BGM/Action-Spy-Urban

Spy, stealth and urban action tracks. Shooters / action.

| File | Length | What it is | Used in | Original |
|---|---|---|---|---|
| `bgm-spy-city.mp3` | 1:15 | "Spy City" — spy/action background (1:15). | SHL `BGMusic` | SHL · Spy City.mp3 |
| `bgm-sneaky.mp3` | 1:14 | "Sneaky" — stealthy, tiptoe background (1:14). | SHL (alt, unused) | SHL · Sneaky.mp3 |
| `bgm-urban-game-loop.mp3` | 46 s | Urban game loop with ending (46 s). | SHL (alt, unused) | SHL · urban game loop (with end).mp3 |

### BGM/Retro-8bit

Chiptune loop. Arcade / retro.

| File | Length | What it is | Used in | Original |
|---|---|---|---|---|
| `bgm-8bit-game-theme-loop.mp3` | 15 s | 8-bit chiptune game theme loop (15 s). | SHL (alt, unused) | SHL · 8 Bit Game Theme (Loop) - Elevate Audio.mp3 |

### SFX/UI-Click-Tap

Buttons, clicks, snaps, soft open.

| File | Length | What it is | Used in | Original |
|---|---|---|---|---|
| `sfx-ui-button-click.mp3` | 1.4 s | Button / tap click (Cute UI pack). | PP button taps | PP · ButtonClick3.mp3 |
| `sfx-ui-interface-click.mp3` | 1.2 s | Clean interface click with short tail. | SLT `foundation` (card sent to foundation) | SLT · Interface Click.wav *(WAV → MP3)* |
| `sfx-ui-click-attach-01.mp3` | 0.2 s | Very short snap/attach click (0.12 s). | SLT (source, unused) | SLT · Alpha Click - Attach 01.wav *(WAV → MP3)* |
| `sfx-ui-click-attach-02.mp3` | 0.2 s | Very short snap/attach click, variation 2. | SLT (source, unused) | SLT · Alpha Click - Attach 02.wav *(WAV → MP3)* |
| `sfx-ui-click-attach-03.mp3` | 0.2 s | Very short snap/attach click, variation 3. | SLT (source, unused) | SLT · Alpha Click - Attach 03.wav *(WAV → MP3)* |
| `sfx-ui-open-soft.mp3` | 0.4 s | Soft open / pop-up (case opening). | WSS-FF `sfx_basket_open` | WSS-FF · open_case_soft.mp3 |

### SFX/Cards

Flip, place, move, return, 8 tap variations. Solitaire / card sort.

| File | Length | What it is | Used in | Original |
|---|---|---|---|---|
| `sfx-card-flip-01.mp3` | 0.3 s | Crisp card flip (from reference ad). | CTS34 `card-flip` (deal/reveal) | CTS34 · card-flip.mp3 |
| `sfx-card-flip-02.mp3` | 1.2 s | Card flip with a longer swish. | SLT `flip` | SLT · Flip.wav *(WAV → MP3)* |
| `sfx-card-flip-03.mp3` | 0.4 s | Short card flip. | SLT (source, unused) | SLT · CardFlip_BW.48003.wav *(WAV → MP3)* |
| `sfx-card-place-01.mp3` | 0.2 s | Tight card place / tap down (from reference ad). | CTS34 `card-place` | CTS34 · card-place.mp3 |
| `sfx-card-place-02.mp3` | 1.2 s | Card placed on table, with a little ring-out. | WSS-FF `sfx_card_placed`, WSS-BF `card-placed` | WSS-FF · Cards Card Placed.mp3 |
| `sfx-card-place-soft-hit.mp3` | 0.8 s | Soft cartoon hit — used as a card landing. | SLT `place` | SLT · HitSoft CTE01_80.1.wav *(WAV → MP3)* |
| `sfx-card-move.mp3` | 0.2 s | Very short card slide / move (0.18 s). | WSS-FF `sfx_card_move`, WSS-BF `card-move` | WSS-FF · card move sound.mp3 |
| `sfx-card-return.mp3` | 0.7 s | Card snapping back to where it came from. | CTS34 `sfx-card-return` | CTS34 · sfx-card-return.mp3 |
| `sfx-card-handling.mp3` | 1.0 s | Generic playing-card handling sound. | SLT (source, unused) | SLT · Playing Cards 04.wav *(WAV → MP3)* |
| `sfx-card-tap-01.mp3` | 0.6 s | Card tap/slide, variation 1 of 8 — cycle through them so repeats don't sound robotic. Also used as an X-mark stamp. | CTS-Flags `Card 0`, PPT `sfx-xmark` | CTS-Flags · Card 0.mp3 |
| `sfx-card-tap-02.mp3` | 0.5 s | Card tap/slide, variation 2 of 8 — cycle through them so repeats don't sound robotic. | CTS-Flags `Card 1` | CTS-Flags · Card 1.mp3 |
| `sfx-card-tap-03.mp3` | 0.4 s | Card tap/slide, variation 3 of 8 — cycle through them so repeats don't sound robotic. Also used as card pick-up. | CTS-Flags `Card 2`, CTS34 `sfx-card-pickup` | CTS-Flags · Card 2.mp3 |
| `sfx-card-tap-04.mp3` | 0.4 s | Card tap/slide, variation 4 of 8 — cycle through them so repeats don't sound robotic. Also used as card parked in free slot. | CTS-Flags `Card 3`, CTS34 `sfx-card-park-free-slot` | CTS-Flags · Card 3.mp3 |
| `sfx-card-tap-05.mp3` | 0.4 s | Card tap/slide, variation 5 of 8 — cycle through them so repeats don't sound robotic. | CTS-Flags `Card 4` | CTS-Flags · Card 4.mp3 |
| `sfx-card-tap-06.mp3` | 0.5 s | Card tap/slide, variation 6 of 8 — cycle through them so repeats don't sound robotic. | CTS-Flags `Card 5` | CTS-Flags · Card 5.mp3 |
| `sfx-card-tap-07.mp3` | 0.5 s | Card tap/slide, variation 7 of 8 — cycle through them so repeats don't sound robotic. | CTS-Flags `Card 6` | CTS-Flags · Card 6.mp3 |
| `sfx-card-tap-08.mp3` | 0.5 s | Card tap/slide, variation 8 of 8 — cycle through them so repeats don't sound robotic. | CTS-Flags `Card 7` | CTS-Flags · Card 7.mp3 |

### SFX/Pieces-Tiles

Board pieces, tiles and bubbles being picked up or set down.

| File | Length | What it is | Used in | Original |
|---|---|---|---|---|
| `sfx-piece-place-01.mp3` | 0.3 s | Wooden game piece set down. | WSS-MJ `sfx-drop-1`, PPT `sfx-place` | PPT · Chess Piece Moves 1 1.mp3 |
| `sfx-piece-place-02.mp3` | 0.3 s | Wooden game piece set down, variation 2. | WSS-MJ `sfx-drop-2` | PPT · Chess Piece Moves 1 2.mp3 |
| `sfx-piece-place-soft.mp3` | 0.6 s | Soft-bottomed piece placement (felt base). | WSS-MJ `sfx-refill` (tile refill) | PPT · Game Chess Piece Soft Bottom Placement 07.wav *(WAV → MP3)* |
| `sfx-soft-thud.mp3` | 0.3 s | Short soft thud / landing. | SLT (source, unused) | SLT · Soft Thud.mp3 |
| `sfx-bubble-grab.mp3` | 0.5 s | Grab / pick up a bubble or tile to drag. | BWJ `onDragStart` | BWJ · onDragStart.mp3 |

### SFX/Letters-Words

Typing, letter reveal and letter drag for word games.

| File | Length | What it is | Used in | Original |
|---|---|---|---|---|
| `sfx-letter-key-press.mp3` | 0.2 s | Keyboard key press when typing a letter (0.16 s). | Wordle `press` | Wordle · LetterPress.mp3 |
| `sfx-letter-tile-flip.mp3` | 0.3 s | Letter tile flipping over on reveal. | Wordle `flip` | Wordle · LetterFlip.mp3 |
| `sfx-letter-present.mp3` | 0.9 s | Letter is in the word but wrong spot (yellow). | Wordle `hasLetter` | Wordle · HasLetter.mp3 |
| `sfx-letter-correct-spot.mp3` | 1.0 s | Letter is in the correct spot (green). | Wordle `correctLetter` | Wordle · CorrectPerLetter.mp3 |
| `sfx-letter-drag.mp3` | 1.2 s | Dragging / swiping across letters. | WS-Zen `sfx_drag` | WS-Zen · sfx-dragletter.mp3 |

### SFX/Correct-Match

Correct answer, match, pop, category or row complete.

| File | Length | What it is | Used in | Original |
|---|---|---|---|---|
| `sfx-correct-ding-01.mp3` | 1.6 s | Bright "correct" ding, variation 1 of 8 — pick one at random per correct answer. | WSS-FF `sfx_correct_1`, WSS-BF `spark-1` | WSS-FF · Correct 1.mp3 |
| `sfx-correct-ding-02.mp3` | 1.7 s | Bright "correct" ding, variation 2 of 8 — pick one at random per correct answer. | WSS-FF `sfx_correct_2`, WSS-BF `spark-2` | WSS-FF · Correct 2.mp3 |
| `sfx-correct-ding-03.mp3` | 1.8 s | Bright "correct" ding, variation 3 of 8 — pick one at random per correct answer. | WSS-FF `sfx_correct_3`, WSS-BF `spark-3` | WSS-FF · Correct 3.mp3 |
| `sfx-correct-ding-04.mp3` | 1.6 s | Bright "correct" ding, variation 4 of 8 — pick one at random per correct answer. | WSS-FF `sfx_correct_4`, WSS-BF `spark-4` | WSS-FF · Correct 4.mp3 |
| `sfx-correct-ding-05.mp3` | 1.6 s | Bright "correct" ding, variation 5 of 8 — pick one at random per correct answer. | WSS-FF `sfx_correct_5`, WSS-BF `spark-5`, BWJ Organs `onDragSuccess` | WSS-FF · Correct 5.mp3 |
| `sfx-correct-ding-06.mp3` | 1.5 s | Bright "correct" ding, variation 6 of 8 — pick one at random per correct answer. | WSS-FF `sfx_correct_6` | WSS-FF · Correct 6.mp3 |
| `sfx-correct-ding-07.mp3` | 1.6 s | Bright "correct" ding, variation 7 of 8 — pick one at random per correct answer. | WSS-FF `sfx_correct_7` | WSS-FF · Correct 7.mp3 |
| `sfx-correct-ding-08.mp3` | 1.9 s | Bright "correct" ding, variation 8 of 8 — pick one at random per correct answer. | WSS-FF `sfx_correct_8` | WSS-FF · Correct 8.mp3 |
| `sfx-correct-answer-01.mp3` | 2.2 s | Positive "correct answer" jingle. | WSS-MJ `sfx-endcard`, PPT `sfx-check` (verdict) | PPT · Correct Answer 01.mp3 |
| `sfx-correct-answer-02.mp3` | 2.1 s | Positive "correct answer" jingle, variation 2. | Source pack (unused) | PPT · Correct Answer 02.mp3 |
| `sfx-correct-answer-03.mp3` | 1.9 s | Positive "correct answer" jingle, variation 3. | Source pack (unused) | PPT · Correct Answer 03.mp3 |
| `sfx-correct-confirm.mp3` | 3.4 s | Sparkly confirmation chime (3.4 s tail). | WSS-MJ `sfx-word` (word completed), PPT `sfx-sparkle` | PPT · soundjay_confirmation_main-01.mp3 |
| `sfx-correct-magic-bells.mp3` | 1.8 s | Cute magical bells "power-up" correct (Cute UI pack). | PP correct clue | PP · Correct1.mp3 |
| `sfx-correct-answer-zen.mp3` | 1.1 s | Correct word found. | WS-Zen `sfx_correct` | WS-Zen · sfx-correctanswer.mp3 |
| `sfx-word-solved.mp3` | 3.0 s | Whole word solved jingle (3 s). | Wordle `correctWord` | Wordle · CorrectWhole.mp3 |
| `sfx-category-complete.mp3` | 2.2 s | Group / category completed success sting. | CTS34 `sfx-category-complete`, CTS-Flags `Success`, PPT `sfx-win` | CTS34 · sfx-category-complete.mp3 |
| `sfx-bubble-drop-correct.mp3` | 0.4 s | Short pop when a dragged item lands in the right place. | BWJ Underwater `onDragSuccess` | BWJ · onDragSuccess.mp3 |
| `sfx-bubble-row-complete.mp3` | 2.1 s | Row / category filled up. | BWJ `full` | BWJ · full.mp3 |
| `sfx-bubble-pop.mp3` | 0.9 s | Bubble pop (cluster cleared). | BWJ Underwater `pop` | BWJ · Pops.mp3 |
| `sfx-chime-short.mp3` | 2.7 s | Short dry chime — reward / selection confirmed. (Source was an MP3 misnamed .wav.) | SLT `chime` | SLT · Chimes_Short1_Dry.wav |

### SFX/Wrong-Fail

Wrong answer, error, invalid move, fail.

| File | Length | What it is | Used in | Original |
|---|---|---|---|---|
| `sfx-wrong-answer.mp3` | 2.2 s | "Wrong answer" sting (2 s). | WSS-FF `sfx_wrong`, WSS-BF `wrong-letter` | WSS-FF · Wrong Answer.mp3 |
| `sfx-wrong-buzz-short.mp3` | 0.5 s | Short wrong buzz (0.5 s) — good for rapid invalid taps. | CTS34 `sfx-wrong-answer`, CTS-Flags `Error`, PPT `sfx-wrong` | CTS34 · sfx-wrong-answer.mp3 |
| `sfx-wrong-answer-soft.mp3` | 1.7 s | Gentle "incorrect" jingle (matches the correct-answer-01..03 set). | Source pack (unused) | PPT · Correct Answer 04 Incorrect.mp3 |
| `sfx-wrong-answer-zen.mp3` | 1.9 s | Wrong word. | WS-Zen `sfx_wrong` | WS-Zen · sfx-wronganswer.mp3 |
| `sfx-error-invalid-word.mp3` | 1.1 s | Invalid entry / not in word list. | Wordle `error` | Wordle · Error.mp3 |
| `sfx-error-blip.mp3` | 0.7 s | Short error blip for an illegal move. | SLT `error` | SLT · Message-04.wav *(WAV → MP3)* |
| `sfx-error-effect.mp3` | 1.2 s | Wrong / error effect. | SLT (source, unused) | SLT · Wrong Error Effect.wav *(WAV → MP3)* |
| `sfx-fail-soft.mp3` | 2.1 s | Soft fail / wrong pick. | PP fail | PP · Fail1.mp3 |
| `sfx-fail-try-again.mp3` | 1.8 s | Soft fail for a lose / try-again screen. | SHL `SFXGameTryAgain` | SHL · Soft Fail.wav *(WAV → MP3)* |
| `sfx-bubble-drop-wrong.mp3` | 1.5 s | Dragged item dropped in the wrong place (bounces back). | BWJ `onDragFailed` | BWJ · onDragFailed.mp3 |

### SFX/Win-Celebration

Win jingles, fanfare, confetti, fireworks, end-card hit.

| File | Length | What it is | Used in | Original |
|---|---|---|---|---|
| `sfx-win-jingle.mp3` | 2.4 s | Win jingle (2.4 s). | SLT (source, unused) | SLT · Win Sound.mp3 |
| `sfx-win-shine-sparkle.mp3` | 1.9 s | Win / reward shine sparkle (Cute UI pack). | PP win | PP · WinShineSparkle3.mp3 |
| `sfx-win-level-complete.mp3` | 2.3 s | Level complete fanfare. | BWJ `win` | BWJ · win.mp3 |
| `sfx-win-success-joy.mp3` | 3.1 s | Joyful success fanfare (3 s). | SHL `SFXGameWin`, WS-Zen `sfx_win` | SHL · Success Joy.wav *(WAV → MP3)* |
| `sfx-win-cash-prize.mp3` | 4.7 s | Cash prize / score tally with coins (4.7 s). | SLT (source, unused) | SLT · Scoring Cash Prize.wav *(WAV → MP3)* |
| `sfx-confetti.mp3` | 6.1 s | Confetti burst celebration (6 s). | SLT (source, unused) | SLT · confetti.mp3 |
| `sfx-endcard-gold-hit.mp3` | 1.1 s | Gold hit / impact for end-card appear. | SLT `endcard` | SLT · 16633 gold kick hit-full.wav *(WAV → MP3)* |
| `sfx-firework-burst.mp3` | 1.1 s | Firework burst with reverb (1 s) — also works as a tile explosion. | WSS-MJ `sfx-explosion` (as Explosion.wav) | SLT · Fireworks Reverb 01.wav *(WAV → MP3)* |

### SFX/Whoosh-Swipe

Swooshes for things flying in, swipes, throws.

| File | Length | What it is | Used in | Original |
|---|---|---|---|---|
| `sfx-whoosh-soft.mp3` | 0.6 s | Soft whoosh — item flying in, tap feedback. | CTS-Flags `Woosh`, PPT `sfx-tap` | CTS-Flags · Woosh.mp3 |
| `sfx-whoosh-quick-swing.mp3` | 0.7 s | Quick swing / throw swoosh. | WSS-FF `sfx_owl_appear`, WSS-BF `word-move`, WSS-MJ `sfx-pickup` | PPT · SWSH_Quick Swoosh Fast Swing Throw_JC.mp3 |

### SFX/Reveal-Magic

Something new appearing; energy / power-up hum.

| File | Length | What it is | Used in | Original |
|---|---|---|---|---|
| `sfx-reveal-new-item.mp3` | 1.6 s | Cute pop-in for something new appearing (Cute UI pack). | PP new clue spawn | PP · NewClueSpawn1.mp3 |
| `sfx-energy-hum-loop.mp3` | 18 s | Electric energy hum loop (17.5 s) — power-up / telekinesis. | SHL (alt, unused) | SHL · Energy_-_wave_loop-01.mp3 |

### SFX/Impacts-Breaks

Stone / tile breaking, heavy body thud.

| File | Length | What it is | Used in | Original |
|---|---|---|---|---|
| `sfx-stone-break-01.mp3` | 1.9 s | Stone / tile cracking and breaking, variation 1. | WSS-MJ `sfx-merge-1`, PPT `sfx-guilty` | PPT · Stone Break 1.mp3 |
| `sfx-stone-break-02.mp3` | 1.9 s | Stone / tile cracking and breaking, variation 2. | WSS-MJ `sfx-merge-2`, PPT `sfx-murder-hit` | PPT · Stone Break 2.mp3 |
| `sfx-stone-break-03.mp3` | 1.9 s | Stone / tile cracking and breaking, variation 3. | WSS-MJ `sfx-merge-3` | PPT · Stone Break 3.mp3 |
| `sfx-punch-body-thud.mp3` | 4.5 s | Heavy punch to body with thud. | SHL (alt, unused) | SHL · PunchBodyHit1Thud PE100801.wav *(WAV → MP3)* |

### SFX/Combat-Weapons

Guns, bullets, ricochets, knife stabs, gore splats.

| File | Length | What it is | Used in | Original |
|---|---|---|---|---|
| `sfx-gunshot.mp3` | 1.6 s | Gunshot. | SHL `SFXGunshot` | SHL · Gun Shot 1.mp3 |
| `sfx-bullet-swish.mp3` | 1.1 s | Bullet whizzing past. | SHL `SFXBulletSwoosh` | SHL · 12012 buttlet swish.mp3 |
| `sfx-bullet-ricochet-01.mp3` | 2.0 s | Bullet ricochet. | SHL `SFXRicochet1` | SHL · AFX_RICOCHET_1_DFMG.mp3 |
| `sfx-bullet-ricochet-02.mp3` | 1.7 s | Bullet ricochet, variation 2. | SHL `SFXRicochet2` | SHL · AFX_RICOCHET_2_DFMG.mp3 |
| `sfx-bullet-hit-body.mp3` | 0.6 s | Bullet hitting a body. | SHL `SFXBodyShot` | SHL · Pistol-Shot-to-the-Body_TTX043102.mp3 |
| `sfx-body-hit-splat.mp3` | 1.1 s | Body hit with a splat. | SHL `SFXBodyHitSplat` | SHL · Body Hit And Splat.wav *(WAV → MP3)* |
| `sfx-blood-splat.mp3` | 2.2 s | Blood splat (gore). | SHL `SFXBloodSplat` | SHL · Blood_Splat_ODC-0029-691.wav *(WAV → MP3)* |
| `sfx-knife-stab-01.mp3` | 0.7 s | Knife stab, variation 1. | PPT (source pack) | PPT · Knife Stab 01.mp3 |
| `sfx-knife-stab-02.mp3` | 1.2 s | Knife stab, variation 2. | PPT (source pack) | PPT · Knife Stab 02.mp3 |
| `sfx-knife-stab-03.mp3` | 0.9 s | Knife stab, variation 3. | PPT (source pack) | PPT · Knife Stab 03.mp3 |
| `sfx-knife-stab-04.mp3` | 1.1 s | Knife stab, variation 4. | PPT `sfx-stab` | PPT · Knife Stab 04.mp3 |
| `sfx-knife-stab-05.mp3` | 0.9 s | Knife stab, variation 5. | PPT (source pack) | PPT · Knife Stab 05.mp3 |
| `sfx-knife-stab-06.mp3` | 1.0 s | Knife stab, variation 6. | PPT (source pack) | PPT · Knife Stab 06.mp3 |

### SFX/Foley-Environment

Footsteps, water splashes, car horn.

| File | Length | What it is | Used in | Original |
|---|---|---|---|---|
| `sfx-footsteps-walk-loop.mp3` | 32 s | Male footsteps walking, 32 s loop. | Source for PPT `sfx-walk` | PPT · Male Walking.mp3 |
| `sfx-footsteps-walk-short.mp3` | 1.1 s | 1.1 s footsteps one-shot cut from the walk loop. | PPT `sfx-walk` | PPT · sfx-walk.mp3 |
| `sfx-water-splash-01.mp3` | 2.4 s | Water splash / douse, variation 1. | WSS-BF `water-1` (putting out fire) | WSS-BF · water-1.mp3 |
| `sfx-water-splash-02.mp3` | 2.4 s | Water splash / douse, variation 2. | WSS-BF `water-2` (putting out fire) | WSS-BF · water-2.mp3 |
| `sfx-water-splash-03.mp3` | 2.5 s | Water splash / douse, variation 3. | WSS-BF `water-3` (putting out fire) | WSS-BF · water-3.mp3 |
| `sfx-car-horn.mp3` | 1.8 s | Car horn honk. | SHL `SFXCar` | SHL · Car Horn02.mp3 |

### SFX/Arcade-Flappy

Flappy Bird style set: flap, hit, die, point, swoosh.

| File | Length | What it is | Used in | Original |
|---|---|---|---|---|
| `sfx-flappy-wing-flap.mp3` | 0.4 s | Wing flap on tap. | Flappy `wing` | Flappy · index.html (inlined; source mp3 not on disk) |
| `sfx-flappy-hit.mp3` | 0.6 s | Hitting a pipe / obstacle. | Flappy `hit` | Flappy · index.html (inlined; source mp3 not on disk) |
| `sfx-flappy-die.mp3` | 1.2 s | Falling after death. | Flappy `die` | Flappy · index.html (inlined; source mp3 not on disk) |
| `sfx-flappy-point.mp3` | 1.1 s | Score a point (passed a pipe). | Flappy `point` | Flappy · index.html (inlined; source mp3 not on disk) |
| `sfx-flappy-swoosh.mp3` | 2.1 s | Screen transition swoosh. | Flappy `swoosh` (loaded, not triggered) | Flappy · index.html (inlined; source mp3 not on disk) |

### VO

Voice-over lines (hooks + "download now" CTA) from Zen Revealed; played from a shuffled pool in the var3 build.

| File | Length | What it is | Used in | Original |
|---|---|---|---|---|
| `vo-how-old.mp3` | 1.8 s | Hook voice line — key phrase "how old". | WS-Zen `vo_how_old` | WS-Zen · vo-how-old.mp3 |
| `vo-10-minutes.mp3` | 4.1 s | Voice line — key phrase "10 minutes". | WS-Zen `vo_10_minutes` | WS-Zen · vo-10-minutes.mp3 |
| `vo-as-you-get-older.mp3` | 3.9 s | Voice line — key phrase "as you get older". | WS-Zen `vo_as_you_get_older` | WS-Zen · vo-as-you-get-older.mp3 |
| `vo-find-right-words.mp3` | 1.9 s | Voice line — key phrase "find the right words". | WS-Zen `vo_find_right_words` | WS-Zen · vo-find-right-words.mp3 |
| `vo-time-to-challenge.mp3` | 2.4 s | Voice line — key phrase "time to challenge". | WS-Zen `vo_time_to_challenge` | WS-Zen · vo-time-to-challenge.mp3 |
| `vo-download-now.mp3` | 2.7 s | CTA voice line — "download now". | WS-Zen `vo_download_now` | WS-Zen · vo-download-now.mp3 |

## Project legend

| Code | Project folder(s) |
|---|---|
| Wordle | 2026.04.02--Wordle-SimpleGameplay-Phaser |
| BWJ | 2026.06.01 - Bubble Word Jam - Organs pt.2 · BWJ Organ (Underwater Pearls) |
| CTS34 | 2026.09.02 CTS, MIP, gameplay_level25 (level34_NOTSIMPLE) |
| CTS-Flags | CTS Flags |
| PPT | 2026.09.22 PPT, MIP, Investigate_grid |
| WSS-FF | WSS_Playable_FFJune [+1] · WSS_FF_JulyQuestions [+2] · Game Config |
| WSS-BF | WSS-BurningForrest |
| WSS-MJ | WSS_Playable_MahjongSorting [+1v] |
| PP | Profile Perfect - Progression dogs · Progression dogs test preview |
| SLT | SLT_Template |
| SHL | The_Superhero_League-Slingshot_Playable (Unity / Luna) |
| WS-Zen | WS_ZenRevealed_several (WS_ZWLetterHint) |
| Flappy | FlappyBird |

## What was not copied

Nothing was deleted from the source projects; the files below stay where they are.

- **34 WAV masters** that have a vendor MP3 twin in the same pack folder (e.g. `Correct 1.wav`, `Knife Stab 04.wav`, `Stone Break 2.wav`). WAV-only sounds were encoded instead (marked *WAV → MP3* above); their originals — e.g. Prelude ×3 at 24 MB each in PPT / WSS-MJ `Audio/WSS/BGM`, Bouncing with Bessie in SLT `assets/audio/Sound/Furplayable` — are still in those projects if you need lossless masters.
- **21 runtime trims / re-encodes** that project build scripts generated from sources already in this library — e.g. WSS-MJ `sfx-merge-1` is `sfx-stone-break-01` silence-trimmed, PPT `sfx-stab` is `sfx-knife-stab-04` cut to 0.95 s, SLT `flip.mp3` is `sfx-card-flip-02`. Exceptions kept because they are useful edits: the 30 s BGM cuts and `sfx-footsteps-walk-short`.
- **8 fingerprint duplicates** — same audio, different encode: BWJ Organs `onDragSuccess` (= `sfx-correct-ding-05`), BWJ Underwater `bgm` / `full` / `win` (= Organs copies), BWJ Organs `onDragStart` / `onDragFailed` (lower-bitrate twins), PP 96 kbps `BGM Chill` (320 kbps kept), WS-Zen `sfx-gamewin` (= `sfx-win-success-joy`).
- **CTS34 `References/htmlreference-extracted`** — base64 text copies of `sfx-card-flip-01` / `sfx-card-place-01`, plus one `.ogg` from the reference ad that the project never used.
- **SHL `LunaTemp/`** (Luna build cache) and `__MACOSX` resource forks.
- **FlappyBird** source MP3s are missing from disk (`src/assets/audio/*.mp3` is referenced but absent); the five sounds were recovered from the built `dist/index.html`.
