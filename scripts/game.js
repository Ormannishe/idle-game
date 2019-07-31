/*
  Contains all game data and functions for manipulating top-level game data
  Authoritative source for game constants (ie. how much things cost)

  The game object should be pure and stateless. This enables changing of game
  constants in the future that can be applied regardless of player progress.
*/

var gameVersion = "0.0.1";
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
      },
      subgenres: [
        "trance", "house", "drumAndBass", "hardstyle", "electro",
        "industrial", "dubstep"
      ]
    },
    keyboard: {
      maxMultiplier: 10
    }
  };
  this.jobs = {
    oddJobs: {
      baseOccurrenceRate: 100,
      basePay: 20,
      timeToComplete: 60,
      locations: [
        "Mow Lawns", "Shovel Snow", "Yardwork", "Change Tires",
        "Walk Dogs", "Babysitting", "Rake Leaves", "Clean Windows"
      ]
    },
    laptop: {
      freelance: {
        baseOccurrenceRate: 250,
        baseFame: 5,
        variableFame: 5,
        basePay: 50,
        variablePay: 10,
        baseXp: 50,
        timeToComplete: 180,
        locations: [
          "Birthday Party", "House Party", "Corporate Event", "Wedding",
          "Frat Party", "Fundraiser"
        ]
      },
      nightclub: {
        baseOccurrenceRate: 500,
        baseFame: 30,
        variableFame: 15,
        basePay: 250,
        variablePay: 50,
        baseXp: 250,
        locations: [
          "The Revision", "Rampage", "The Roxberry", "Nebula Nightclub",
          "The Jungle", "Infinity", "Club Liquid", "Pulse", "Green Door"
        ]
      }
    },
    keyboard: {
      freelance: {
        baseOccurrenceRate: 250,
        baseFame: 5,
        variableFame: 5,
        basePay: 50,
        variablePay: 10,
        baseXp: 50,
        timeToComplete: 180,
        locations: []
      }
    }
  };
  this.achievements = {
    beats: {
      ranks: ["bronze", "silver", "gold", "platinum"],
      bronze: {
        amount: 100,
        description: "Create 100 Beats.",
        flavor: "Seems achieveable..."
      },
      silver: {
        amount: 1000,
        description: "Create 1000 Beats.",
        flavor: "A small amount of beats, in the grand scheme."
      },
      gold: {
        amount: 10000,
        description: "Create 10000 Beats.",
        flavor: "Surely this will be enough..."
      },
      platinum: {
        amount: 100000,
        description: "Create 100000 Beats.",
        flavor: "Doesn't this seem a little excessive?"
      }
    },
    samples: {
      ranks: ["bronze", "silver", "gold", "platinum"],
      bronze: {
        amount: 10,
        description: "Create 10 Samples.",
        flavor: "Honestly, I've eaten more free samples in a single shopping trip."
      },
      silver: {
        amount: 100,
        description: "Create 100 Samples.",
        flavor: "At this point, other people in the store are staring at you."
      },
      gold: {
        amount: 1000,
        description: "Create 1000 Samples.",
        flavor: "This is about the point where the clerk asks you to stop."
      },
      platinum: {
        amount: 10000,
        description: "Create 10000 Samples.",
        flavor: "You're not allowed in Costco anymore."
      }
    },
    songs: {
      ranks: ["bronze", "silver", "gold", "platinum"],
      bronze: {
        amount: 1,
        description: "Create A Song.",
        flavor: "All musicians remember their first song, unfortunately."
      },
      silver: {
        amount: 10,
        description: "Create 10 Songs.",
        flavor: "You might actually be getting good at this."
      },
      gold: {
        amount: 100,
        description: "Create 100 Songs.",
        flavor: "At this point, someone must like at least one of your songs..."
      },
      platinum: {
        amount: 1000,
        description: "Create 1000 Songs.",
        flavor: "How haven't you run out of ideas yet?"
      }
    },
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
  window.localStorage.setItem('version', JSON.stringify(gameVersion));
}

function loadGame() {
  /*
    Deserializes local storage and restores game state.
    If no save data is found, starts a new game.
  */

  var playerData = JSON.parse(window.localStorage.getItem('playerData'));
  var uiData = JSON.parse(window.localStorage.getItem('uiData'));
  var textLog = JSON.parse(window.localStorage.getItem('textLog'));
  var version = JSON.parse(window.localStorage.getItem('version')); // TODO: Check saved version vs. current version

  if (playerData !== null) {
    // Restore game state
    game = new Game();
    // TODO: Before overwriting the default player object, merge in keys/values
    // that are missing from the stored player object
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

    for (var key in game.player.achievements) {
      initAchievement(key);
    }
  }
  else {
    newGame();
  }
}

function eraseSave() {
  window.localStorage.clear();
  location.reload(); // required to reload original HTML
}
