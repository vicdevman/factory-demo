# HANDOFF: Focus Board

Built from `PLAN.md` Tasks 1-5 against `SPEC.md`. Node v22.20.0, Windows, no installs.

---

## 1. What changed

| File | Status | What it is |
| --- | --- | --- |
| `board.test.js` | new | 28 tests, `node:test` + `node:assert`. Written before `board.js`. |
| `board.js` | new | Pure logic. `createState`, `addCard`, `moveCard`, `deleteCard`, `save`, `load`. No browser globals. |
| `index.html` | new | Page structure, all seven fixed ids plus `#count-*`. |
| `style.css` | new | CSS-variable theming, dark variant, 640px stack, `:focus-visible`. |
| `app.js` | new | DOM + `localStorage` wiring, error surface, theme persistence. |
| `HANDOFF.md` | new | This file. |

Nothing outside my lane was touched: `SPEC.md`, `PLAN.md` and `prompts/` are untouched.

---

## 2. Commands run, with real output

### `node --test` — exit 0, 28 pass, 0 fail

Run from the repo root immediately before writing this handoff. Full verbatim output:

```text
TAP version 13
# Subtest: criterion 1 - createState returns an empty state with nextId 1
ok 1 - criterion 1 - createState returns an empty state with nextId 1
  ---
  duration_ms: 10.4029
  type: 'test'
  ...
# Subtest: criterion 1 - addCard trims the title
ok 2 - criterion 1 - addCard trims the title
  ---
  duration_ms: 0.7341
  type: 'test'
  ...
# Subtest: criterion 1 - addCard rejects an empty title with empty title
ok 3 - criterion 1 - addCard rejects an empty title with empty title
  ---
  duration_ms: 1.8181
  type: 'test'
  ...
# Subtest: criterion 1 - addCard ids start at 1 and increase
ok 4 - criterion 1 - addCard ids start at 1 and increase
  ---
  duration_ms: 0.7159
  type: 'test'
  ...
# Subtest: criterion 1 - new cards start in todo
ok 5 - criterion 1 - new cards start in todo
  ---
  duration_ms: 0.7752
  type: 'test'
  ...
# Subtest: criterion 1 - addCard never mutates the old state
ok 6 - criterion 1 - addCard never mutates the old state
  ---
  duration_ms: 0.8617
  type: 'test'
  ...
# Subtest: criterion 1 - a rejected addCard leaves the state untouched
ok 7 - criterion 1 - a rejected addCard leaves the state untouched
  ---
  duration_ms: 1.0602
  type: 'test'
  ...
# Subtest: criterion 2 - moveCard moves a card to a valid column
ok 8 - criterion 2 - moveCard moves a card to a valid column
  ---
  duration_ms: 1.0286
  type: 'test'
  ...
# Subtest: criterion 2 - moveCard throws no card <id> for an unknown id
ok 9 - criterion 2 - moveCard throws no card <id> for an unknown id
  ---
  duration_ms: 1.5826
  type: 'test'
  ...
# Subtest: criterion 2 - moveCard throws bad column for an unknown column
ok 10 - criterion 2 - moveCard throws bad column for an unknown column
  ---
  duration_ms: 1.7582
  type: 'test'
  ...
# Subtest: criterion 2 - moveCard reports an unknown id before a bad column
ok 11 - criterion 2 - moveCard reports an unknown id before a bad column
  ---
  duration_ms: 0.8358
  type: 'test'
  ...
# Subtest: criterion 2 - deleteCard removes only the named card
ok 12 - criterion 2 - deleteCard removes only the named card
  ---
  duration_ms: 0.709
  type: 'test'
  ...
# Subtest: criterion 2 - deleteCard throws no card <id> for an unknown id
ok 13 - criterion 2 - deleteCard throws no card <id> for an unknown id
  ---
  duration_ms: 0.7413
  type: 'test'
  ...
# Subtest: criterion 2 - moveCard and deleteCard never mutate the old state
ok 14 - criterion 2 - moveCard and deleteCard never mutate the old state
  ---
  duration_ms: 1.3236
  type: 'test'
  ...
# Subtest: criterion 2 - deleteCard does not reuse ids
ok 15 - criterion 2 - deleteCard does not reuse ids
  ---
  duration_ms: 0.7858
  type: 'test'
  ...
# Subtest: criterion 3 - a 4th card moved to doing throws WIP limit 3
ok 16 - criterion 3 - a 4th card moved to doing throws WIP limit 3
  ---
  duration_ms: 1.0122
  type: 'test'
  ...
# Subtest: criterion 3 - a rejected WIP move leaves the state untouched
ok 17 - criterion 3 - a rejected WIP move leaves the state untouched
  ---
  duration_ms: 0.632
  type: 'test'
  ...
# Subtest: criterion 3 - moving a card already in doing to doing does not throw
ok 18 - criterion 3 - moving a card already in doing to doing does not throw
  ---
  duration_ms: 2.7019
  type: 'test'
  ...
# Subtest: criterion 3 - done has no limit
ok 19 - criterion 3 - done has no limit
  ---
  duration_ms: 4.4764
  type: 'test'
  ...
# Subtest: criterion 3 - todo has no limit
ok 20 - criterion 3 - todo has no limit
  ---
  duration_ms: 0.4107
  type: 'test'
  ...
# Subtest: criterion 3 - freeing a doing slot lets the next card in
ok 21 - criterion 3 - freeing a doing slot lets the next card in
  ---
  duration_ms: 0.4068
  type: 'test'
  ...
# Subtest: criterion 4 - save writes JSON to the key focusboard.v1
ok 22 - criterion 4 - save writes JSON to the key focusboard.v1
  ---
  duration_ms: 0.9521
  type: 'test'
  ...
# Subtest: criterion 4 - save and load round-trip a state
ok 23 - criterion 4 - save and load round-trip a state
  ---
  duration_ms: 0.7361
  type: 'test'
  ...
# Subtest: criterion 4 - load falls back to an empty state when nothing is stored
ok 24 - criterion 4 - load falls back to an empty state when nothing is stored
  ---
  duration_ms: 0.3523
  type: 'test'
  ...
# Subtest: criterion 4 - load falls back to an empty state for unparseable data
ok 25 - criterion 4 - load falls back to an empty state for unparseable data
  ---
  duration_ms: 0.4901
  type: 'test'
  ...
# Subtest: criterion 4 - load falls back to an empty state for structurally invalid data
ok 26 - criterion 4 - load falls back to an empty state for structurally invalid data
  ---
  duration_ms: 1.3713
  type: 'test'
  ...
# Subtest: criterion 4 - load never throws on corrupt data
ok 27 - criterion 4 - load never throws on corrupt data
  ---
  duration_ms: 0.7002
  type: 'test'
  ...
# Subtest: criterion 4 - a loaded state is usable by the rest of the API
ok 28 - criterion 4 - a loaded state is usable by the rest of the API
  ---
  duration_ms: 0.5422
  type: 'test'
  ...
1..28
# tests 28
# suites 0
# pass 28
# fail 0
# cancelled 0
# skipped 0
# todo 0
# duration_ms 428.866
```

### The PLAN.md per-task gates

Each command below is quoted from `PLAN.md`, with its real output.

```text
$ grep -nE "document|window|localStorage" board.js
(no output)
exit status 1 — no matches, so board.js touches no browser global

$ grep -oE 'id="(add-form|new-title|col-todo|col-doing|col-done|theme-toggle|message)"' index.html | sort -u
id="add-form"
id="col-doing"
id="col-done"
id="col-todo"
id="message"
id="new-title"
id="theme-toggle"
(7 of 7)

$ grep -nE '<label[^>]*for="new-title"' index.html
35:          <label class="field__label" for="new-title">New card title</label>

$ grep -c '<button' index.html
2
(the two static buttons: submit and #theme-toggle; card action buttons are
 created as real <button> elements in app.js:77 and app.js:92)

$ grep -n '@media (max-width: 640px)' style.css
421:@media (max-width: 640px) {

$ grep -n '\[data-theme="dark"\]' style.css
59:[data-theme="dark"] {
95:html[data-theme="dark"] {

$ grep -c -- '--' style.css
189

$ grep -n 'focus-visible' style.css
114::focus-visible {
121:.button:focus-visible,
122:.field__input:focus-visible,
123:.skip-link:focus-visible {
141:.skip-link:focus-visible {

$ grep -n 'focusboard.theme' app.js
7:  var THEME_KEY = "focusboard.theme";

$ node --check board.js && node --check app.js && node --check board.test.js
board.js parses
app.js parses
board.test.js parses
```

### Browser verification — headless Chrome, real `file://` load

The plan's Task 2/3/4 items marked "Manual" were run in Chrome
(`/c/Program Files/Google/Chrome/Application/chrome.exe`, `--headless=new`) against
`file:///C:/.../factory-demo/index.html`, driven by a temporary script that clicked the
real buttons in the real markup. **The temporary driver was deleted afterwards** — the
repo contains only the six files listed above.

```text
counts after 4 adds (todo/doing/done): 4/0/0
first card title: "alpha"                      <- "  alpha  " was trimmed by addCard
empty-title message text: "empty title"        <- shown on the page
empty-title message visible: true
input preserved after rejection: "   "
counts after 3 moves to doing: 1/3/0
message after legal moves: "" hidden=true      <- cleared on success
4th-move message text: "WIP limit 3"           <- shown on the page, not the console
4th-move message visible: true
counts after rejected move: 1/3/0              <- board unchanged by the rejection
counts after moving a doing card to done: 1/2/1
counts after delete: 1/1/1
message cleared on success: "" hidden=true
theme: dark -> light
aria-pressed: false
toggle label: "Dark theme"
focusboard.theme in storage: "light"
focusboard.v1 in storage: {"nextId":5,"cards":[{"id":1,"title":"alpha","column":"done"},{"id":3,"title":"gamma","column":"doing"},{"id":4,"title":"delta","column":"todo"}]}
```

Then `index.html` was loaded again in the **same browser profile** — a real refresh:

```text
<html lang="en" data-theme="light">            <- theme remembered
<p class="card__title">delta</p>               <- board restored
<p class="card__title">gamma</p>
<p class="card__title">alpha</p>
id="count-todo">1  id="count-doing">1  id="count-done">1
<p id="message" ... hidden=""></p>             <- no error on load
```

Focus ring, probed in the same browser:

```text
#new-title matches :focus-visible => true
#new-title outline => rgb(142, 166, 255) 3px solid
#theme-toggle matches :focus-visible => true
```

Note on the two storage keys: the board lives in `focusboard.v1` and the theme in
`focusboard.theme`, confirmed separate in the dump above.

---

## 3. Evidence per acceptance criterion

| # | Criterion | Evidence |
| --- | --- | --- |
| 1 | `addCard` trims, rejects empty with `empty title`, ids from 1 increasing, never mutates | Tests `criterion 1 - addCard trims the title`, `criterion 1 - addCard rejects an empty title with empty title`, `criterion 1 - addCard ids start at 1 and increase`, `criterion 1 - new cards start in todo`, `criterion 1 - addCard never mutates the old state`, `criterion 1 - a rejected addCard leaves the state untouched`. Implementation `board.js:26-33`; the throw is `board.js:28`. The non-mutation test deep-equals the input against a JSON snapshot taken before the call *and* asserts the returned object and `cards` array are not the same references. |
| 2 | `moveCard` / `deleteCard` work, and throw the exact messages | Tests `criterion 2 - moveCard moves a card to a valid column`, `criterion 2 - moveCard throws no card <id> for an unknown id`, `criterion 2 - moveCard throws bad column for an unknown column`, `criterion 2 - moveCard reports an unknown id before a bad column`, `criterion 2 - deleteCard removes only the named card`, `criterion 2 - deleteCard throws no card <id> for an unknown id`, `criterion 2 - moveCard and deleteCard never mutate the old state`, `criterion 2 - deleteCard does not reuse ids`. Every throw assertion uses an exact `{ message: "..." }` matcher, so a typo'd message fails. Implementation `board.js:35-56` and `board.js:58-66`. |
| 3 | WIP limit holds; `done` and `todo` uncapped | Tests `criterion 3 - a 4th card moved to doing throws WIP limit 3`, `criterion 3 - a rejected WIP move leaves the state untouched`, `criterion 3 - moving a card already in doing to doing does not throw`, `criterion 3 - done has no limit`, `criterion 3 - todo has no limit`, `criterion 3 - freeing a doing slot lets the next card in`. Implementation `board.js:43-48` — the check is `inDoing + 1 > WIP_LIMIT` guarded by `card.column !== "doing"`, i.e. the post-move count, so the legal no-op is not rejected. Per PLAN.md Task 1 decision 4, the limit exists only in `moveCard`; `addCard` has no limit check. |
| 4 | `save`/`load` round-trip; `load` falls back for missing or corrupt data | Tests `criterion 4 - save writes JSON to the key focusboard.v1`, `criterion 4 - save and load round-trip a state`, `criterion 4 - load falls back to an empty state when nothing is stored`, `criterion 4 - load falls back to an empty state for unparseable data`, `criterion 4 - load falls back to an empty state for structurally invalid data` (9 corrupt inputs incl. `{not json`, `{"cards":"nope"}`, `null`, `[]`, `42`), `criterion 4 - load never throws on corrupt data`, `criterion 4 - a loaded state is usable by the rest of the API`. Implementation `board.js:87-89` and `board.js:93-106`. |
| 5 | Required ids; media query and dark variant; errors shown in `#message` | **Ids** `index.html`: `#theme-toggle` :26, `#add-form` :33, `#new-title` :39, `#message` :51, `#col-todo` :54, `#col-doing` :62, `#col-done` :71, plus `#count-todo` :57, `#count-doing` :66, `#count-done` :74. **Label** `index.html:35`. **CSS** `@media (max-width: 640px)` `style.css:421` (sets `.board { grid-template-columns: 1fr }`), `[data-theme="dark"]` `style.css:59`, `:focus-visible` `style.css:114`. All 36 literal colours sit inside the two theme blocks (`:root` 7-57, dark 59-83); no rule carries a raw colour. **Error surface** `app.js:51-73` — `run()` catches and calls `showMessage(err.message)` at `app.js:58`, and `showMessage` at `app.js:39-42` assigns `messageEl.textContent`. Nothing is console-only: `grep -n 'console\.' app.js` returns exactly one line, `app.js:38`, which is a comment — there is no `console` call in the file. Also `app.js:70`, `app.js:181`, `app.js:239`. Browser-confirmed above: `WIP limit 3` and `empty title` both rendered on the page. |
| 6 | `node --test` passes and covers 1-4 | The run in section 2: **28 tests, 28 pass, 0 fail, exit 0**. Test names are prefixed `criterion 1` / `2` / `3` / `4`, so coverage maps directly. Test file `board.test.js`. |

---

## 4. Things the Reviewer should look at closely

1. **The WIP no-op.** `board.js:43` guards on `card.column !== "doing"` so re-moving a card already in `doing` to `doing` is allowed. This is PLAN.md Task 1 decision 1 and its open question. If the intent was a literal "doing already has 3" check, the test `criterion 3 - moving a card already in doing to doing does not throw` is the one to overturn.
2. **The export guard.** `board.js:109` is `if (typeof module !== "undefined" && module.exports)`, so the same file is `require`-able in Node and loadable via `<script src>` with no bundler. The browser load was verified — see section 2.
3. **Script loading.** `index.html:11-12` uses `defer` in `<head>` rather than inline scripts, which keeps `localStorage` and `document` access confined to `app.js` as PLAN.md Task 4 requires. The cost is that the theme is applied in a deferred script rather than a blocking inline one; the headless load showed the correct theme on the restored page.
4. **`run()` commits before saving.** `app.js:62-71`: state is committed and rendered, then saved. A storage failure reports `could not save the board: ...` in `#message` rather than discarding the user's action. This is a deliberate choice, not an oversight.

---

## 5. Not run

- No linter or formatter: the project has no `package.json`, no lint config and no CI workflow, so `node --test` is the entire gate. Nothing was skipped.
- The human's own browser visual check is still outstanding by design — `SPEC.md` § Done means assigns that to the human after APPROVED.
