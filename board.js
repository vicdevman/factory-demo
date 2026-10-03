"use strict";

// Pure board logic with no browser or page access of any kind: every function
// takes state in and returns a new state, so Node can test it directly.
// Persistence goes through the `storage` argument, never a global.

var COLUMNS = ["todo", "doing", "done"];
var STORAGE_KEY = "focusboard.v1";
var WIP_LIMIT = 3;

function createState() {
  return { nextId: 1, cards: [] };
}

function cloneCard(card) {
  return { id: card.id, title: card.title, column: card.column };
}

function findCard(state, id) {
  for (var i = 0; i < state.cards.length; i += 1) {
    if (state.cards[i].id === id) return state.cards[i];
  }
  return null;
}

function addCard(state, title) {
  var trimmed = (title === null || title === undefined ? "" : String(title)).trim();
  if (trimmed === "") throw new Error("empty title");

  var cards = state.cards.map(cloneCard);
  cards.push({ id: state.nextId, title: trimmed, column: "todo" });
  return { nextId: state.nextId + 1, cards: cards };
}

function moveCard(state, id, column) {
  var card = findCard(state, id);
  if (!card) throw new Error("no card " + id);
  if (COLUMNS.indexOf(column) === -1) throw new Error("bad column");

  // The limit is checked against the count after the move, so moving a card
  // that is already in `doing` back to `doing` is a legal no-op. `todo` and
  // `done` are uncapped.
  if (column === "doing" && card.column !== "doing") {
    var inDoing = state.cards.filter(function (other) {
      return other.column === "doing";
    }).length;
    if (inDoing + 1 > WIP_LIMIT) throw new Error("WIP limit " + WIP_LIMIT);
  }

  var cards = state.cards.map(function (other) {
    var copy = cloneCard(other);
    if (copy.id === id) copy.column = column;
    return copy;
  });
  return { nextId: state.nextId, cards: cards };
}

function deleteCard(state, id) {
  if (!findCard(state, id)) throw new Error("no card " + id);

  var cards = state.cards
    .filter(function (card) {
      return card.id !== id;
    })
    .map(cloneCard);
  return { nextId: state.nextId, cards: cards };
}

function isValidCard(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.id === "number" &&
    isFinite(value.id) &&
    typeof value.title === "string" &&
    COLUMNS.indexOf(value.column) !== -1
  );
}

function isValidState(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  if (typeof value.nextId !== "number" || !isFinite(value.nextId)) return false;
  if (!Array.isArray(value.cards)) return false;
  return value.cards.every(isValidCard);
}

function save(state, storage) {
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Never throws: anything missing, unparseable or structurally wrong falls back
// to an empty board rather than leaving the caller without a state.
function load(storage) {
  try {
    var raw = storage.getItem(STORAGE_KEY);
    if (typeof raw !== "string") return createState();

    var parsed = JSON.parse(raw);
    if (!isValidState(parsed)) return createState();

    return { nextId: parsed.nextId, cards: parsed.cards.map(cloneCard) };
  } catch (err) {
    return createState();
  }
}

// Guarded so the same file works under `require` in Node and under a plain
// <script src> tag in the browser, where `module` does not exist.
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    COLUMNS: COLUMNS,
    STORAGE_KEY: STORAGE_KEY,
    WIP_LIMIT: WIP_LIMIT,
    createState: createState,
    addCard: addCard,
    moveCard: moveCard,
    deleteCard: deleteCard,
    save: save,
    load: load,
  };
}
