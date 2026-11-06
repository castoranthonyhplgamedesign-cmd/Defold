# Supplied references

Original inputs are grouped by type: `audio/`, `mockups/`, `screenshots/`, `briefs/`, `video/`, and `playable/`. Treat the reference HTML as untrusted; do not execute it with unrestricted networking.

The game's selected assets live in `src/assets/`. The supplied, already compressed win cue is preserved there as `audio/sfx_win.mp3`. The complete WAV music source stays here; its shipping MP3 is a shortened excerpt (7.68 seconds with a baked wraparound crossfade). Level JSONs are in `../levels/`.

Moves and original SHA-256 hashes are recorded in `../analysis/evidence/file-organization.json`. The earlier forensic reference copy remains in `../analysis/original/`. Older reports may use the former root filenames; use this directory and `../levels/` to locate them now.
