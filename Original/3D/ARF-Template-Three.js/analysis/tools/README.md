# Analysis tooling

These scripts inspect data and produce forensic exports; they do not implement the game. Run from the workspace root. The original HTML is read only. No dependency was installed into the workspace.

The extraction order used was `extract.cjs`, `decode.cjs`, `modules.cjs`, `deserialize.cjs`, `catalog.cjs`, `details.cjs`, `summarize.cjs`, `deliver-assets.cjs`, `tuning.cjs`, `supplement.cjs`. Reports and specifications were then written from those outputs. Some scripts reference existing TypeScript/Sharp installations in the adjacent Bubble-Cash checkout; inspect those paths before moving the analysis package to another machine. Re-running generators may overwrite report fragments or manually clarified inventory text.

Run `node analysis/tools/validate.cjs` to check original/copy hashes, JSON parsing, required files, inventory sizes, serialized reference bounds and glTF buffer/index integrity. This does not validate visual equivalence or Cocos deserialization semantics.

`observe.cjs` is the attempted Playwright observation harness. It keeps Chromium sandboxing enabled, mutes audio, blocks service workers, aborts outgoing requests and closes WebSockets. Only the synthetic document route is fulfilled from the copied HTML. It failed before navigation in this environment; it is not a completed interaction suite or a successful-run recording. Do not weaken sandboxing to bypass that failure. The original was never navigated outside this harness.
