# Analysis and validation files

Start with `REPORT.md` for the playable reference, `template-analysis.md` for the Babylon template, and `audio-verification.md` for audio behavior and device limitations. These are dated evidence; later tuning reports can supersede earlier findings.

- `experiments/`: exploratory tuning/probe scripts, run from the repository root. Some write candidate results; they are not runtime modules.
- `evidence/`: recorded measurements and test results.
- `screenshots/`, `recordings/`: visual evidence.
- `build/`: generated staging builds; not source files or final delivery packages.
- `original/`, `extracted/`, `assets/`, `template-source/`: preserved forensic inputs and extracted assets.
- `artist-conveyor/`, `artist-longarrow/`, `artist-rescue/`: artist-model import studies and fixtures.
- `tools/`: original reference-analysis scripts.

Loose supplied inputs now live in `../reference/` and levels in `../levels/`. The relocation record is `evidence/file-organization.json`; originals were retained and their hashes checked. Build/verification tools remain in the root `scripts/` and `tools/` folders. Final deliveries belong in `dist/`, not here.
