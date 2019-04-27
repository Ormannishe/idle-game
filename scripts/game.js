/*
  Contains all game data and functions for manipulating top-level game data
  Authoritative source for game constants (ie. how much things cost)
*/

function Game() { // TODO: Remove state from Game object. Player object holds all state.
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
      level: 1,
      currentTempo: "slow",
      tempoSpeeds: {
        slowest: 25,
        slow: 15,
        fast: 10,
        fastest: 5
      },
      dropActive: false
    },
    keyboard: {
      currentNote: undefined,
      currentSong: undefined
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

    Triggers require special serialization because functions cannot be stored in
    local storage.
  */
  var triggers = [];

  game.player.triggers.forEach(function(trigger) {
    triggers.push(trigger.name);
  });

  // Serialize regular player data
  window.localStorage.setItem('playerData', JSON.stringify(game.player));

  // Serialize triggers
  window.localStorage.setItem('triggers', JSON.stringify(triggers))

  // Serialize HTML
  window.localStorage.setItem('html', JSON.stringify(document.body.innerHTML));
}

function loadGame() {
  /*
    Deserializes local storage and restores game state.

    Triggers require special restoration because functions cannot be stored in
    local storage.
  */

  var playerData = JSON.parse(window.localStorage.getItem('playerData'));
  var triggers = JSON.parse(window.localStorage.getItem('triggers'));
  var html = JSON.parse(window.localStorage.getItem('html'));

  if (playerData !== null) {
    // Restore game in a sane state
    game.player = playerData;
    game.player.triggers = new Set();

    // Re-add triggers to trigger set
    triggers.forEach(function(trigger) {
      var triggerFn = window[trigger];
      if (triggerFn !== undefined)
        game.player.triggers.add(triggerFn);
    });

    document.body.innerHTML = html;
  }
}

function eraseSave() {
  window.localStorage.clear();
  location.reload(); // required to reload original HTML
}
