# REVIEW: Focus Board

Reviewer: @victor1/reviewer. Date: 2026-10-03. Verdict below is from my own
runs and file reads, not the Engineer's word.

## Gate I ran myself

`node --test` from the repo root: **28 tests, 28 pass, 0 fail** (my run:
`# pass 28`, `# fail 0`, exit 0). Test names are prefixed `criterion 1`–`4`,
so coverage maps to the criteria directly. `node --check` clean on all three
JS files was corroborated by the successful test run parsing them.

## Evidence per criterion

1. **PASS.** `addCard` (board.js:26-33): `String(title).trim()` at :27,
   `throw new Error("empty title")` at :28, id from `state.nextId` at :31,
   new array + new card objects at :30-32 (old state untouched). Tests:
   criterion 1 tests 1-7 all pass in my run, including the immutability and
   rejected-add cases.
2. **PASS.** `moveCard` (board.js:35-56) throws `no card <id>` :37,
   `bad column` :38, `WIP limit 3` :47; `deleteCard` (board.js:58-67) throws
   `no card <id>` :59. Valid-path and exact-message tests pass (tests 8-15,
   exact `{ message }` matchers).
3. **PASS.** WIP check at board.js:43-48 counts `doing` cards post-move;
   guarded by `card.column !== "doing"`, so a same-column no-op is legal.
   Tests 16-21 pass: 4th to `doing` throws, `done`/`todo` uncapped, freeing
   a slot admits the next card. Adopted the Planner's no-op decision —
   noted as the one place I did not overturn the design.
4. **PASS.** `save` writes JSON to `focusboard.v1` (board.js:87-89); `load`
   (board.js:93-105) validates structure via `isValidState` and falls back to
   `createState()` for missing/unparseable/invalid input inside try/catch —
   never throws. Round-trip and fallback tests 22-28 pass.
5. **PASS, verified by reading the files:**
   - index.html: `#add-form` :33 with `<label for="new-title">` :35 and
     submit button :46; `#new-title` :39; `#col-todo` :54, `#col-doing` :62,
     `#col-done` :71, each with an `<h2>` heading and a `#count-*` span;
     `#theme-toggle` :26 (real `<button>`); `#message` :51 with
     `role="status" aria-live="polite"`.
   - style.css: `[data-theme="dark"]` :59 and `html[data-theme="dark"]` :95;
     `@media (max-width: 640px)` :421; colours confined to the two theme
     variable blocks (`:root` :7-57, dark :59-83); `:focus-visible` rules
     present.
   - app.js: errors surface in `#message` via `showMessage` (:39-42), called
     from `run()`'s catch (:57-58). No `console.` call anywhere — the only
     match for `console\.` is the comment at app.js:38.
   - Keyboard/button usage: card actions are real `<button>` elements created
     in app.js:77 and app.js:92; skip-link :16; `:focus-visible` styles.
6. **PASS.** `node --test` green in my own run (28/28); tests named per
   criterion 1-4 cover the API contract above.

Additional greps I ran myself: no `document`/`window`/`localStorage` match in
board.js (pure logic, as the spec requires); no `console.` call in app.js.

## Findings

None blocking. Non-blocking notes:

- Deferred scripts (index.html:11-12) apply the theme after parse; acceptable,
  verified the restored page rendered the persisted theme in the Engineer's
  headless run, and board.js first-paint is deferred equally.
- `run()` commits state before persisting (app.js:62-71): a storage failure
  is reported in `#message` rather than rolling back. Deliberate; matches the
  spec's requirement that errors be shown, and the board remains usable.
- Theme persisted under a second key (`focusboard.theme`, app.js:7) — spec
  doesn't forbid it; board data stays on `focusboard.v1` only.

## Verdict

**APPROVED** — criteria 1, 2, 3, 4, 5, 6 each have evidence reproduced by me
(test output and direct file reads above). Risk: low.
