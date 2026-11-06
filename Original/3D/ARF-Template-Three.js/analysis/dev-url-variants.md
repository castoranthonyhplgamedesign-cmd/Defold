# Development URL variants - 2026-10-30

`npm run dev` now accepts a `variant` query parameter at boot:

- `?variant=3clicks`: three counted arrow presses, no countdown.
- `?variant=10clicks`: ten counted arrow presses, no countdown.
- `?variant=60sec` or `60seconds`: 60 active seconds.
- `?variant=90sec` or `90seconds`: 90 active seconds.

Reloading starts a fresh session. Missing/unknown values retain the build's default: normally 60 seconds, or 90 for `npm run dev:90`. There is no arbitrary numeric parsing, external configuration object or production override. The allowlist is inside `import.meta.env.DEV` and production compilation removes it. Existing countdown start, click counting, win/fail and lifecycle behavior are reused.

Validation: TypeScript and standalone build pass. `node tools/variant-smoke.mjs` confirms all four presets, aliases, default and invalid fallback using the live session in muted Chromium. It checks press-down increments once, release does not increment again, and the 90-second timer begins after the accepted launch. Static assertions on the freshly built production HTML confirm the query selector and dev preset strings are absent. Evidence: `evidence/dev-url-variants.json`. No production globals were added; fixture inspection exists only in the test browser's intercepted source.

Network packages were not regenerated for this development-only selector. No device/official-host testing was needed for the URL selection itself; previous gameplay and host limitations remain.
