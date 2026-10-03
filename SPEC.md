# SPEC: Focus Board - a tiny kanban board (no build step)

A single-page kanban app that opens by double-clicking `index.html`. No frameworks, no installs.
Plain HTML, CSS and JavaScript only. Node is used only to run tests (`node --test`).

## Files
- `index.html`   - page structure
- `style.css`    - styling (modern, clean, light and dark theme)
- `board.js`     - pure logic, no DOM access, exported with `module.exports` so Node can test it
- `app.js`       - wires the DOM to `board.js` and to localStorage
- `board.test.js`- tests using `node:test` and `node:assert`

## Behaviour
- Three columns: To do, Doing, Done.
- Add a card with a title. Move a card to another column with buttons on the card. Delete a card.
- Doing allows at most 3 cards (the WIP limit).
- The board survives a page refresh.
- A theme toggle switches light and dark, and remembers the choice.

## board.js API (state is `{ nextId, cards: [{id, title, column}] }`, columns are `todo`, `doing`, `done`)
- `createState()` returns an empty state with `nextId: 1`.
- `addCard(state, title)` returns a NEW state. Title is trimmed. Empty title throws `Error("empty title")`. Ids increase from 1. New cards start in `todo`.
- `moveCard(state, id, column)` returns a NEW state. Unknown id throws `Error("no card <id>")`. Unknown column throws `Error("bad column")`. Moving a 4th card into `doing` throws `Error("WIP limit 3")`.
- `deleteCard(state, id)` returns a NEW state. Unknown id throws `Error("no card <id>")`.
- `save(state, storage)` writes JSON to key `focusboard.v1`. `load(storage)` reads it back, or returns `createState()` if nothing valid is stored. `storage` is any object with `getItem` and `setItem`.

## UI requirements (element ids are fixed so they can be checked)
- Form `#add-form` with input `#new-title` (has a `<label>`) and a submit button.
- Columns `#col-todo`, `#col-doing`, `#col-done`, each with a visible heading and a card count.
- Theme button `#theme-toggle`.
- Everything is reachable and usable with the keyboard. Cards use real `<button>` elements for actions.
- Under 640px wide the columns stack in one column (a `@media (max-width: 640px)` rule in `style.css`).
- Colors come from CSS variables, with a dark variant under `[data-theme="dark"]`.
- An error from `board.js` (for example the WIP limit) is shown to the user in an element `#message` and is not only logged to the console.

## Acceptance criteria
1. `addCard` trims titles, rejects empty ones with `empty title`, starts ids at 1 and increases them, and never mutates the old state.
2. `moveCard` and `deleteCard` work for valid input and throw the exact error messages above for bad input.
3. The WIP limit holds: a 4th card moved to `doing` throws `WIP limit 3`, and `done` and `todo` have no limit.
4. `save` and `load` round-trip a state through a fake storage, and `load` falls back to an empty state for missing or corrupt data.
5. `index.html` contains every required id, `style.css` has the media query and the dark theme variant, and `app.js` shows errors in `#message`.
6. `node --test` passes and covers criteria 1-4.

## Done means
The Reviewer has re-run `node --test` itself, checked criterion 5 by reading the files, and posted APPROVED with evidence for all six criteria.
The human then opens `index.html` in a browser for a visual check.
