"use strict";

const test = require("node:test");
const assert = require("node:assert");

const {
  createState,
  addCard,
  moveCard,
  deleteCard,
  save,
  load,
} = require("./board.js");

// A fake storage: any object with getItem and setItem, per SPEC.md.
function fakeStorage(initial) {
  const data = Object.create(null);
  if (initial) {
    for (const key of Object.keys(initial)) data[key] = initial[key];
  }
  return {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(data, key) ? data[key] : null;
    },
    setItem(key, value) {
      data[key] = String(value);
    },
  };
}

// Add `n` cards and move each one into `column`.
function fill(column, n) {
  let state = createState();
  for (let i = 1; i <= n; i += 1) {
    state = addCard(state, "card " + i);
    state = moveCard(state, state.cards[state.cards.length - 1].id, column);
  }
  return state;
}

function countIn(state, column) {
  return state.cards.filter((card) => card.column === column).length;
}

function snapshot(value) {
  return JSON.parse(JSON.stringify(value));
}

/* ---------- criterion 1: addCard ---------- */

test("criterion 1 - createState returns an empty state with nextId 1", () => {
  assert.deepStrictEqual(createState(), { nextId: 1, cards: [] });
});

test("criterion 1 - addCard trims the title", () => {
  const state = addCard(createState(), "   write the tests   ");
  assert.strictEqual(state.cards[0].title, "write the tests");
});

test("criterion 1 - addCard rejects an empty title with empty title", () => {
  assert.throws(() => addCard(createState(), ""), { message: "empty title" });
  assert.throws(() => addCard(createState(), "   "), { message: "empty title" });
  assert.throws(() => addCard(createState(), " \t \n "), { message: "empty title" });
});

test("criterion 1 - addCard ids start at 1 and increase", () => {
  const state = addCard(addCard(addCard(createState(), "a"), "b"), "c");
  assert.deepStrictEqual(state.cards.map((card) => card.id), [1, 2, 3]);
  assert.strictEqual(state.nextId, 4);
});

test("criterion 1 - new cards start in todo", () => {
  const state = addCard(createState(), "a");
  assert.strictEqual(state.cards[0].column, "todo");
});

test("criterion 1 - addCard never mutates the old state", () => {
  const before = addCard(createState(), "a");
  const taken = snapshot(before);
  const after = addCard(before, "b");

  assert.deepStrictEqual(before, taken, "input state was mutated");
  assert.notStrictEqual(after, before, "addCard returned the same object");
  assert.notStrictEqual(after.cards, before.cards, "addCard reused the cards array");
  assert.strictEqual(before.cards.length, 1);
});

test("criterion 1 - a rejected addCard leaves the state untouched", () => {
  const before = addCard(createState(), "a");
  const taken = snapshot(before);
  assert.throws(() => addCard(before, "  "), { message: "empty title" });
  assert.deepStrictEqual(before, taken);
});

/* ---------- criterion 2: moveCard and deleteCard ---------- */

test("criterion 2 - moveCard moves a card to a valid column", () => {
  const state = moveCard(addCard(createState(), "a"), 1, "doing");
  assert.strictEqual(state.cards[0].column, "doing");

  const next = moveCard(state, 1, "done");
  assert.strictEqual(next.cards[0].column, "done");

  const back = moveCard(next, 1, "todo");
  assert.strictEqual(back.cards[0].column, "todo");
});

test("criterion 2 - moveCard throws no card <id> for an unknown id", () => {
  const state = addCard(createState(), "a");
  assert.throws(() => moveCard(state, 99, "doing"), { message: "no card 99" });
  assert.throws(() => moveCard(createState(), 1, "doing"), { message: "no card 1" });
});

test("criterion 2 - moveCard throws bad column for an unknown column", () => {
  const state = addCard(createState(), "a");
  assert.throws(() => moveCard(state, 1, "archive"), { message: "bad column" });
  assert.throws(() => moveCard(state, 1, ""), { message: "bad column" });
  assert.throws(() => moveCard(state, 1, "Doing"), { message: "bad column" });
});

test("criterion 2 - moveCard reports an unknown id before a bad column", () => {
  const state = addCard(createState(), "a");
  assert.throws(() => moveCard(state, 99, "archive"), { message: "no card 99" });
});

test("criterion 2 - deleteCard removes only the named card", () => {
  const state = addCard(addCard(createState(), "a"), "b");
  const next = deleteCard(state, 1);
  assert.deepStrictEqual(next.cards.map((card) => card.id), [2]);
});

test("criterion 2 - deleteCard throws no card <id> for an unknown id", () => {
  const state = addCard(createState(), "a");
  assert.throws(() => deleteCard(state, 99), { message: "no card 99" });
  assert.throws(() => deleteCard(state, 2), { message: "no card 2" });
});

test("criterion 2 - moveCard and deleteCard never mutate the old state", () => {
  const before = addCard(addCard(createState(), "a"), "b");
  const taken = snapshot(before);

  const moved = moveCard(before, 1, "doing");
  assert.deepStrictEqual(before, taken, "moveCard mutated the input state");
  assert.notStrictEqual(moved, before);
  assert.notStrictEqual(moved.cards, before.cards);
  assert.strictEqual(before.cards[0].column, "todo");

  const deleted = deleteCard(before, 1);
  assert.deepStrictEqual(before, taken, "deleteCard mutated the input state");
  assert.notStrictEqual(deleted, before);
  assert.strictEqual(before.cards.length, 2);
});

test("criterion 2 - deleteCard does not reuse ids", () => {
  const state = deleteCard(addCard(addCard(createState(), "a"), "b"), 2);
  const next = addCard(state, "c");
  assert.deepStrictEqual(next.cards.map((card) => card.id), [1, 3]);
});

/* ---------- criterion 3: the WIP limit ---------- */

test("criterion 3 - a 4th card moved to doing throws WIP limit 3", () => {
  let state = fill("doing", 3);
  assert.strictEqual(countIn(state, "doing"), 3);

  state = addCard(state, "card 4");
  const fourth = state.cards[state.cards.length - 1].id;
  assert.throws(() => moveCard(state, fourth, "doing"), { message: "WIP limit 3" });
});

test("criterion 3 - a rejected WIP move leaves the state untouched", () => {
  let state = fill("doing", 3);
  state = addCard(state, "card 4");
  const taken = snapshot(state);
  const fourth = state.cards[state.cards.length - 1].id;

  assert.throws(() => moveCard(state, fourth, "doing"), { message: "WIP limit 3" });
  assert.deepStrictEqual(state, taken);
  assert.strictEqual(countIn(state, "doing"), 3);
});

test("criterion 3 - moving a card already in doing to doing does not throw", () => {
  const state = fill("doing", 3);
  const existing = state.cards[0].id;

  const next = moveCard(state, existing, "doing");
  assert.strictEqual(next.cards[0].column, "doing");
  assert.strictEqual(countIn(next, "doing"), 3, "a no-op move changed the doing count");
});

test("criterion 3 - done has no limit", () => {
  const state = fill("done", 6);
  assert.strictEqual(countIn(state, "done"), 6);
});

test("criterion 3 - todo has no limit", () => {
  const state = fill("todo", 6);
  assert.strictEqual(countIn(state, "todo"), 6);
});

test("criterion 3 - freeing a doing slot lets the next card in", () => {
  let state = fill("doing", 3);
  state = addCard(state, "card 4");
  const fourth = state.cards[state.cards.length - 1].id;

  state = moveCard(state, state.cards[0].id, "done");
  state = moveCard(state, fourth, "doing");
  assert.strictEqual(countIn(state, "doing"), 3);
});

/* ---------- criterion 4: save and load ---------- */

test("criterion 4 - save writes JSON to the key focusboard.v1", () => {
  const state = moveCard(addCard(addCard(createState(), "a"), "b"), 1, "doing");
  const storage = fakeStorage();

  save(state, storage);
  const raw = storage.getItem("focusboard.v1");
  assert.strictEqual(typeof raw, "string");
  assert.deepStrictEqual(JSON.parse(raw), state);
});

test("criterion 4 - save and load round-trip a state", () => {
  const state = deleteCard(
    moveCard(addCard(addCard(addCard(createState(), "a"), "b"), "c"), 2, "done"),
    1
  );
  const storage = fakeStorage();

  save(state, storage);
  assert.deepStrictEqual(load(storage), state);
});

test("criterion 4 - load falls back to an empty state when nothing is stored", () => {
  assert.deepStrictEqual(load(fakeStorage()), createState());
});

test("criterion 4 - load falls back to an empty state for unparseable data", () => {
  const storage = fakeStorage({ "focusboard.v1": "{not json" });
  assert.deepStrictEqual(load(storage), createState());
});

test("criterion 4 - load falls back to an empty state for structurally invalid data", () => {
  const corrupt = [
    '{"cards":"nope"}',
    '{"nextId":1}',
    '{"cards":[],"nextId":"1"}',
    '{"cards":[{"id":"1","title":"a","column":"todo"}],"nextId":2}',
    '{"cards":[{"id":1,"title":"a","column":"nowhere"}],"nextId":2}',
    "null",
    '"a string"',
    "[]",
    "42",
  ];

  for (const raw of corrupt) {
    const storage = fakeStorage({ "focusboard.v1": raw });
    assert.deepStrictEqual(load(storage), createState(), "did not fall back for " + raw);
  }
});

test("criterion 4 - load never throws on corrupt data", () => {
  const storage = fakeStorage({ "focusboard.v1": "  not even close" });
  assert.doesNotThrow(() => load(storage));
});

test("criterion 4 - a loaded state is usable by the rest of the API", () => {
  const storage = fakeStorage();
  save(addCard(addCard(createState(), "a"), "b"), storage);

  const restored = load(storage);
  const next = addCard(restored, "c");
  assert.deepStrictEqual(next.cards.map((card) => card.id), [1, 2, 3]);
  assert.strictEqual(moveCard(restored, 1, "doing").cards[0].column, "doing");
});
