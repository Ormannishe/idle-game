/*
  Contains all game data and functions for manipulating top-level game data
  Authoritative source for game constants (ie. how much things cost)

  The game object should be pure and stateless. This enables changing of game
  constants in the future that can be applied regardless of player progress.
*/

var uiData = {};

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
  if (window.localStorage.getItem('playerData') !== null)
    eraseSave();

  game = new Game();
  initTriggers();
  startInstrument(game.player.instruments.active);
}

function saveGame() {
  /*
    Serializes and stores all necessary player data in local storage.
    Stored data requires deserialization in the loadGame function.
  */

  // Serialize regular player data
  window.localStorage.setItem('playerData', JSON.stringify(game.player));

  // Serialize UI data
  window.localStorage.setItem('uiData', JSON.stringify(uiData));
  window.localStorage.setItem('textLog', JSON.stringify(document.getElementById('outputContainer').innerHTML));
}

function loadGame() {
  /*
    Deserializes local storage and restores game state.
    If no save data is found, starts a new game.
  */

  var playerData = JSON.parse(window.localStorage.getItem('playerData'));
  var uiData = JSON.parse(window.localStorage.getItem('uiData'));
  var textLog = JSON.parse(window.localStorage.getItem('textLog'));

  if (playerData !== null) {
    // Restore game state
    game = new Game();
    game.player = playerData;

    // Apply UI Changes
    var outputContainer = document.getElementById('outputContainer');
    var activeInstrument = game.player.instruments.active;

    for (var key in uiData) {
      showUiElement(key, uiData[key]);
    }

    if (game.player.activeTask !== undefined) {
      var task = getTaskFromContext(game.player.activeTask);
      document.getElementById('taskLabel').innerHTML = game.player.activeTask.taskName;
      document.getElementById('taskProgress').value = game.player.activeTask.timeInProgress;
      document.getElementById('taskProgress').max = task.timeToComplete;
    }

    outputContainer.innerHTML = textLog;
    outputContainer.scrollTop = outputContainer.scrollHeight;
    toggleTab(activeInstrument, "instrument");
  }
  else {
    newGame();
  }
}

function eraseSave() {
  window.localStorage.clear();
  location.reload(); // required to reload original HTML
}
