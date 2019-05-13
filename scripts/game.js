/*
  Contains all game data and functions for manipulating top-level game data
  Authoritative source for game constants (ie. how much things cost)

  The game object should be pure and stateless. This enables changing of game
  constants in the future that can be applied regardless of player progress.
*/

function Game() {
  this.player = new Player();
  this.resources = {
    fame: {},
    money: {},
    beats: {
      instrument: "laptop",
      clicksPer: 30,
      xpPer: 5
    },
    samples: {
      instrument: "laptop",
      resourcesPer: 25,
      requiredResource: "beats",
      xpPer: 50
    },
    notes: {
      instrument: "keyboard",
      clicksPer: 50,
      xpPer: 5
    },
    measures: {
      instrument: "keyboard",
      resourcesPer: 25,
      requiredResource: "notes",
      xpPer: 50
    }
  };
  this.specialResources = {
    songs: {
      instruments: ["laptop", "keyboard"],
      resourcesPer: 50,
      validResources: ["samples", "measures"],
      xpPer: 500
    }
  };
  this.activeInstrument = "laptop";
  this.instruments = {
    laptop: {
      maxMultiplier: 10,
      tempoSpeeds: {
        slowest: 25,
        slow: 15,
        fast: 10,
        fastest: 5
      }
    },
    keyboard: {
      maxMultiplier: 10
    }
  };
};

function newGame() {
  // Erases save data and creates a new game object
  if (window.localStorage.getItem('html') !== null)
    eraseSave();

  game = new Game();
  initTriggers();
}

function saveGame() {
  /*
    Serializes and stores all necessary player data in local storage.
    Stored data requires deserialization in the loadGame function.
  */

  // Serialize regular player data
  window.localStorage.setItem('playerData', JSON.stringify(game.player));

  // Serialize HTML
  window.localStorage.setItem('html', JSON.stringify(document.body.innerHTML));
}

function loadGame() {
  /*
    Deserializes local storage and restores game state.
  */

  var playerData = JSON.parse(window.localStorage.getItem('playerData'));
  var html = JSON.parse(window.localStorage.getItem('html'));

  if (playerData !== null) {
    // Restore game in a sane state
    game = new Game();
    game.player = playerData;
    document.body.innerHTML = html;
  }
}

function eraseSave() {
  window.localStorage.clear();
  location.reload(); // required to reload original HTML
}
