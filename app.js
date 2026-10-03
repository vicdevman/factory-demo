"use strict";

// Wires the page to board.js and to localStorage. This is the only file that
// touches the DOM or storage; board.js stays pure. Wrapped in an IIFE so
// nothing here collides with the globals board.js defines.
(function () {
  var THEME_KEY = "focusboard.theme";

  var COLUMN_LABELS = {
    todo: "To do",
    doing: "Doing",
    done: "Done",
  };

  var messageEl = document.getElementById("message");
  var formEl = document.getElementById("add-form");
  var titleEl = document.getElementById("new-title");
  var boardEl = document.querySelector(".board");
  var themeButton = document.getElementById("theme-toggle");
  var themeLabel = document.getElementById("theme-toggle-label");

  var lists = {
    todo: document.getElementById("list-todo"),
    doing: document.getElementById("list-doing"),
    done: document.getElementById("list-done"),
  };

  var counts = {
    todo: document.getElementById("count-todo"),
    doing: document.getElementById("count-doing"),
    done: document.getElementById("count-done"),
  };

  var state = createState();

  /* ---------- the user-visible error surface ---------- */

  // Errors from board.js land here, on the page, not in the console.
  function showMessage(text) {
    messageEl.textContent = text;
    messageEl.hidden = false;
  }

  function clearMessage() {
    messageEl.textContent = "";
    messageEl.hidden = true;
  }

  // Every call into board.js goes through here: a thrown Error has its
  // .message written into #message and the board is left untouched.
  function run(mutate) {
    clearMessage();

    var next;
    try {
      next = mutate(state);
    } catch (err) {
      showMessage(err.message);
      return;
    }

    state = next;
    render();

    // Committed to the board already, so a storage failure is reported
    // rather than throwing the user's change away.
    try {
      save(state, localStorage);
    } catch (err) {
      showMessage("could not save the board: " + err.message);
    }
  }

  /* ---------- rendering ---------- */

  function createActionButton(card, column) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "card__action";
    button.dataset.action = "move";
    button.dataset.id = String(card.id);
    button.dataset.column = column;
    button.textContent = COLUMN_LABELS[column];
    button.setAttribute(
      "aria-label",
      "Move " + card.title + " to " + COLUMN_LABELS[column]
    );
    return button;
  }

  function createDeleteButton(card) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "card__action card__action--delete";
    button.dataset.action = "delete";
    button.dataset.id = String(card.id);
    button.textContent = "Delete";
    button.setAttribute("aria-label", "Delete " + card.title);
    return button;
  }

  function createCardElement(card) {
    var item = document.createElement("li");
    item.className = "card";

    var title = document.createElement("p");
    title.className = "card__title";
    title.textContent = card.title;
    item.appendChild(title);

    var actions = document.createElement("div");
    actions.className = "card__actions";

    COLUMNS.forEach(function (column) {
      if (column !== card.column) {
        actions.appendChild(createActionButton(card, column));
      }
    });
    actions.appendChild(createDeleteButton(card));

    item.appendChild(actions);
    return item;
  }

  function createEmptyElement(column) {
    var item = document.createElement("li");
    item.className = "cards__empty";
    item.textContent = "No cards in " + COLUMN_LABELS[column];
    return item;
  }

  // Each column's list is rebuilt from state. Three columns is small enough
  // that correctness beats incremental patching.
  function render() {
    COLUMNS.forEach(function (column) {
      var cards = state.cards.filter(function (card) {
        return card.column === column;
      });

      lists[column].textContent = "";

      if (cards.length === 0) {
        lists[column].appendChild(createEmptyElement(column));
      } else {
        cards.forEach(function (card) {
          lists[column].appendChild(createCardElement(card));
        });
      }

      counts[column].textContent = String(cards.length);
    });
  }

  /* ---------- theme ---------- */

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    themeButton.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    themeLabel.textContent = theme === "dark" ? "Light theme" : "Dark theme";
  }

  function readTheme() {
    try {
      var stored = localStorage.getItem(THEME_KEY);
      if (stored === "light" || stored === "dark") return stored;
    } catch (err) {
      // Storage can be unavailable when the page is opened with site data
      // blocked. Fall through to the system preference.
    }

    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  function writeTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (err) {
      showMessage("could not save the theme: " + err.message);
    }
  }

  /* ---------- events ---------- */

  formEl.addEventListener("submit", function (event) {
    event.preventDefault();
    var title = titleEl.value;

    run(function (current) {
      return addCard(current, title);
    });

    // Only clear the field once the card actually landed, so a rejected
    // title is still there to fix.
    if (messageEl.hidden) {
      titleEl.value = "";
    }
    titleEl.focus();
  });

  boardEl.addEventListener("click", function (event) {
    var button = event.target.closest("button[data-action]");
    if (!button) return;

    var id = Number(button.dataset.id);

    if (button.dataset.action === "move") {
      var column = button.dataset.column;
      run(function (current) {
        return moveCard(current, id, column);
      });
      return;
    }

    if (button.dataset.action === "delete") {
      run(function (current) {
        return deleteCard(current, id);
      });
    }
  });

  themeButton.addEventListener("click", function () {
    var next =
      document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    writeTheme(next);
  });

  /* ---------- boot ---------- */

  applyTheme(readTheme());

  try {
    state = load(localStorage);
  } catch (err) {
    state = createState();
    showMessage("could not read the saved board: " + err.message);
  }

  render();
})();
