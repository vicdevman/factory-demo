# Plan: Focus Board — tiny kanban board, no build step

## Goal
Ship a single-page kanban board (To do / Doing / Done) that opens by double-clicking `index.html`,
with pure testable logic in `board.js`, a WIP limit of 3 on `doing`, localStorage persistence, a
remembered light/dark theme, and `node --test` green over acceptance criteria 1–4.

Source of truth: `SPEC.md`. Criterion numbers below refer to `SPEC.md` § Acceptance criteria.

## Ownership
- **Engineer** owns `board.js`, `board.test.js`, `index.html`, `style.css`, `app.js`, `HANDOFF.md`.
- **Reviewer** owns `REVIEW.md` only, and verifies by re-running and re-reading — never on the Engineer's word.
- **Planner** owns `PLAN.md` only.

No two owners touch the same file. Tasks 1–5 are a single owner's sequence; order is by risk
retirement, not convenience.

---

## Task 1: `board.js` contract, test-first
- **Owner:** Engineer
- **Covers criteria:** 1, 2, 3, 4 (and feeds 6)
- **Files:** `board.test.js`, `board.js`
- **Depends on:** nothing
- **Why first:** every exact error string, the immutability guarantee, and the WIP rule are the
  fragile part of this spec. They are also the only part with executable evidence. If any of them is
  wrong, the UI built on top is wrong too — so retire this before a single line of CSS exists.
- **Deliverable:** `board.js` exporting `createState`, `addCard`, `moveCard`, `deleteCard`, `save`,
  `load` via `module.exports`, with **no DOM access anywhere in the file**, plus `board.test.js`
  written first using `node:test` and `node:assert`.
- **Contract, exactly as specified — the strings are literal:**
  - `createState()` → `{ nextId: 1, cards: [] }`
  - `addCard(state, title)` → NEW state; title trimmed; empty-after-trim throws `Error("empty title")`;
    ids start at 1 and increase; new card `column: "todo"`; input state unchanged.
  - `moveCard(state, id, column)` → NEW state; unknown id throws `Error("no card <id>")` with the id
    interpolated; column not in `todo|doing|done` throws `Error("bad column")`; a move that would make
    `doing` hold a 4th card throws `Error("WIP limit 3")`.
  - `deleteCard(state, id)` → NEW state; unknown id throws `Error("no card <id>")`.
  - `save(state, storage)` → `storage.setItem("focusboard.v1", JSON.stringify(state))`.
  - `load(storage)` → parsed state, or `createState()` when the key is missing, unparseable, or
    structurally invalid (not an object, missing `cards` array, missing numeric `nextId`).
- **Directed decisions — implement these, do not re-open them:**
  1. Moving a card that is **already in `doing`** to `doing` must **not** throw. It does not increase
     the column count. Check the limit against the post-move count, not a blanket "doing has 3".
  2. Error-message precedence in `moveCard`: unknown id first, then bad column, then WIP. A call with
     both a bad id and a bad column throws `no card <id>`.
  3. `load` must not throw on corrupt data under any input — it falls back silently.
  4. **The WIP limit lives in `moveCard` and nowhere else.** `addCard` always places a new card in
     `todo`, so no new card can land in `doing` directly and `addCard` must not check the limit.
     `todo` and `done` are uncapped in every function. Do not add a defensive check elsewhere.
- **Acceptance:** `node --test` passes, and the suite contains at least these named tests:
  - criterion 1 — trims title, rejects empty with `empty title`, ids start at 1 and increase, and an
    assertion that the pre-call state object is deep-equal to a snapshot taken before the call
  - criterion 2 — happy path for `moveCard` and `deleteCard`, plus
    `assert.throws(..., { message: "no card 99" })` and `{ message: "bad column" }`
  - criterion 3 — 4th card into `doing` throws `{ message: "WIP limit 3" }`; 4+ cards into `done` and
    4+ into `todo` both succeed; the already-in-`doing` → `doing` case does not throw
  - criterion 4 — round-trip through a fake `{ getItem, setItem }` object returns a deep-equal state;
    missing key → `createState()`; `"{not json"` → `createState()`; `'{"cards":"nope"}'` → `createState()`
  - Command: `node --test`
  - Command: `grep -nE "document|window|localStorage" board.js` returns **no matches**

## Task 2: `index.html` structure and fixed ids
- **Owner:** Engineer
- **Covers criterion:** 5
- **Files:** `index.html`
- **Depends on:** nothing (ids are fixed by the spec, so this may be done alongside Task 1)
- **Deliverable:** page structure with every required id present, loading `board.js` and `app.js`,
  openable from the filesystem with no server.
- **Required, verbatim ids:** `#add-form`, `#new-title`, `#col-todo`, `#col-doing`, `#col-done`,
  `#theme-toggle`, `#message`.
- **Also required:** a real `<label>` associated with `#new-title` (`for`/`id` pair); a submit button
  in the form; each column has a visible heading and a card-count element; card action buttons are
  real `<button>` elements, never clickable `<div>`s.
- **Directed decisions:**
  1. Card-count elements use ids `#count-todo`, `#count-doing`, `#count-done` so Task 4 and the
     Reviewer target them unambiguously.
  2. `#message` carries `role="status"` and `aria-live="polite"` so errors are announced, and it is
     present in the DOM at all times (hidden when empty) rather than created on demand.
  3. `board.js` must load in the browser without a bundler. Use plain `<script src>` tags (not
     `type="module"`), and in `board.js` guard the export as
     `if (typeof module !== "undefined") { module.exports = { ... } }` so the same file works in Node
     and in the browser. This is the one place where the no-build-step rule and `module.exports`
     collide; resolve it here, not at review time.
- **Acceptance:**
  - Command: `grep -oE 'id="(add-form|new-title|col-todo|col-doing|col-done|theme-toggle|message)"' index.html | sort -u`
    lists all **seven** ids
  - Command: `grep -nE '<label[^>]*for="new-title"' index.html` matches
  - Command: `grep -c '<button' index.html` is ≥ 2
  - Opening `index.html` by double-click renders three columns with no console errors

## Task 3: `style.css` theming and responsive layout
- **Owner:** Engineer
- **Covers criterion:** 5
- **Files:** `style.css`
- **Depends on:** Task 2 (needs the final markup hooks)
- **Deliverable:** modern, clean styling — consistent spacing scale, readable type scale, visible
  focus states, and light + dark themes driven entirely by CSS variables.
- **Required:**
  - All colors come from CSS custom properties declared on `:root`; no raw hex values on individual
    rules.
  - A dark variant under the exact selector `[data-theme="dark"]` that re-declares those variables.
  - A `@media (max-width: 640px)` rule that stacks the three columns into one.
  - A visible `:focus-visible` style on every interactive element — this is the keyboard requirement,
    not an optional polish item.
- **Acceptance:**
  - Command: `grep -n '@media (max-width: 640px)' style.css` matches
  - Command: `grep -n '\[data-theme="dark"\]' style.css` matches
  - Command: `grep -c -- '--' style.css` shows CSS variables in use
  - Command: `grep -n 'focus-visible' style.css` matches
  - Narrowing the window under 640px stacks the columns

## Task 4: `app.js` — DOM wiring, persistence, theme, error surface
- **Owner:** Engineer
- **Covers criterion:** 5 (and the `SPEC.md` § Behaviour items)
- **Files:** `app.js`
- **Depends on:** Tasks 1, 2
- **Deliverable:** `app.js` wires the DOM to `board.js` and `localStorage`. It holds the only mutable
  board state in the app and is the only file that touches `localStorage` or `document`.
- **Required:**
  - On load, `load(localStorage)` restores the board, so it survives a refresh.
  - Every mutation goes through `board.js`, then `save(state, localStorage)`, then re-render.
  - Card counts in `#count-todo` / `#count-doing` / `#count-done` update on every render.
  - **Every** call into `board.js` is wrapped so a thrown `Error` has its `.message` written to
    `#message` for the user. A `console.log`/`console.error` alone fails criterion 5.
  - `#theme-toggle` flips `data-theme` on `<html>` and persists the choice; the saved theme is applied
    on load before first paint where possible.
    - **Resolved during implementation:** "before first paint" and "`localStorage` confined to
      `app.js`" are in tension — applying the theme pre-paint needs a blocking inline script in
      `<head>`, which would put storage access in `index.html`. The confinement rule is the stronger
      constraint, so the theme is applied from a deferred `app.js` and a brief flash on first paint is
      accepted. This is a deliberate resolution of my own wording, not an unmet requirement; no
      acceptance criterion depends on paint timing.
  - The add form uses a `submit` handler with `preventDefault()`, so Enter in `#new-title` works.
- **Directed decisions:**
  1. Theme persists under its own key `focusboard.theme`. Do not stuff it into `focusboard.v1` —
    criterion 4 round-trips that key and an extra field would muddy it.
  2. `#message` is cleared at the start of each successful action, so a stale WIP error does not sit
    on screen after the user fixes it.
  3. Render by rebuilding each column's card list from state. No incremental DOM patching — it is a
    three-column board and correctness beats cleverness here.
- **Acceptance:**
  - Command: `grep -n 'message' app.js` shows the error `.message` being assigned to
    `#message`'s text inside a `catch`
  - Command: `grep -n 'focusboard.theme' app.js` matches
  - Manual: adding a 4th card to `doing` shows `WIP limit 3` on the page
  - Manual: add two cards, refresh, both are still there; toggle theme, refresh, theme persists
  - Manual: the whole flow — add, move, delete, toggle theme — is operable with Tab and Enter alone

## Task 5: Handoff with real evidence
- **Owner:** Engineer
- **Covers criterion:** 6, and evidence for 1–5
- **Files:** `HANDOFF.md`
- **Depends on:** Tasks 1–4
- **Deliverable:** `HANDOFF.md` containing the files changed, the commands run, and their **real,
  pasted output** — not a summary of it — plus, for each criterion 1–6, the test name, command, or
  `file:line` that shows it.
- **Acceptance:**
  - `node --test` was run immediately before the handoff and its verbatim output, including the pass
    count, is in `HANDOFF.md`
  - Each of criteria 1–6 has a named row pointing at a specific test name or `file:line`
  - The Reviewer is @mentioned in the room with the path to `HANDOFF.md`

## Task 6: Independent verification
- **Owner:** Reviewer
- **Covers criteria:** 1, 2, 3, 4, 5, 6
- **Files:** `REVIEW.md`
- **Depends on:** Task 5
- **Deliverable:** `REVIEW.md` with a verdict and the evidence actually observed.
- **Method — reproduce, do not read the Engineer's claims:**
  - Re-run `node --test` locally and paste your own output.
  - Confirm the suite genuinely asserts criteria 1–4, including the exact error-message strings and
    the non-mutation assertion. A passing suite that never asserts the strings does not satisfy
    criterion 6.
  - Check criterion 5 by reading `index.html`, `style.css` and `app.js` yourself: all seven ids, the
    `<label>`, the `@media (max-width: 640px)` rule, the `[data-theme="dark"]` variant, and the
    error surfaced in `#message` rather than only logged.
  - Confirm `board.js` contains no `document`, `window`, or `localStorage` reference.
- **Acceptance:** `REVIEW.md` says `APPROVED` with per-criterion evidence for all six, or `BLOCKED`
  with a numbered list naming exactly which criterion lacks evidence and what is missing. Post the
  verdict in the room, @mentioning the Planner and the Engineer.

## Task 7: Close
- **Owner:** Planner
- **Covers:** nothing new
- **Files:** none
- **Depends on:** Task 6 returning `APPROVED`
- **Deliverable:** a one-paragraph summary for the human, and the note that the remaining step is the
  human opening `index.html` for the visual check.
- **Acceptance:** Posted only after `APPROVED` exists in the room. A `BLOCKED` verdict routes back to
  the Engineer at Task 5; nothing closes.

---

## Risks
- **The `module.exports` / no-build-step collision.** `board.js` must be `require`-able by Node and
  loadable by a plain `<script>` tag. Earliest observation: Task 2, the first time `index.html` is
  opened in a browser — an unguarded `module.exports` throws `module is not defined` immediately.
  Mitigated by the guard in Task 2's directed decisions.
- **Tests that pass without asserting the strings.** `assert.throws(fn)` passes for *any* error,
  including a typo'd message. Criterion 6 would look green while criterion 2 is unmet. Earliest
  observation: Task 6, where the Reviewer reads the assertions rather than the exit code. Mitigated
  by requiring `{ message: ... }` matchers in Task 1.
- **Errors reaching only the console.** The most common way criterion 5 fails is a `catch` that logs.
  Earliest observation: Task 4's grep; conclusively at Task 6.
- **Theme state leaking into `focusboard.v1`.** Would break criterion 4's round-trip. Earliest
  observation: Task 1's round-trip test failing once Task 4 lands. Mitigated by the separate key.
- **WIP check written as "doing already has 3".** Blocks a legal no-op move and is the most likely
  spec misreading. Earliest observation: the explicit already-in-`doing` test required in Task 1.

## Open questions
- **Does a card already in `doing` block its own re-move to `doing`?** `SPEC.md` says only that "a 4th
  card moved to `doing` throws". My call, already written into Task 1: it must **not** throw, because
  the post-move count is still 3 and throwing would reject a no-op. Flagged for @victor1 to overturn
  if the intent was a literal count check. The Engineer proceeds on my call; nothing waits on this.
- **Nothing else in `SPEC.md` is ambiguous enough to block.** Element ids, error strings, the storage
  key, and the media-query breakpoint are all stated verbatim and are treated as literal.
