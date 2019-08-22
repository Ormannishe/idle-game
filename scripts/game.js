/*
  Contains all game data and functions for manipulating top-level game data
  Authoritative source for game constants (ie. how much things cost)

  The game object should be pure and stateless. This enables changing of game
  constants in the future that can be applied regardless of player progress.
*/

var gameVersion = "0.0.1";
var uiData = {};

function newGame() {
  // Erases save data and creates a new game object
  if (window.localStorage.getItem('playerData') !== null)
    eraseSave();

  game = new Game();
  initTriggers();
  initAchievements();
  unlockAchievement("fame");
  unlockAchievement("money");
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
    initAchievements();

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
        timeToComplete: 180,
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
    fame: {
      ranks: ["bronze", "silver", "gold", "platinum"],
      bronze: {
        amount: 100,
        description: "Gain 100 Fame.",
        flavor: "Look mom, I'm famous!"
      },
      silver: {
        amount: 10000,
        description: "Gain 10,000 Fame.",
        flavor: "Your grandma still has no idea what you do."
      },
      gold: {
        amount: 1000000,
        description: "Gain 1,000,000 Fame.",
        flavor: "Do you think T-Swift knows who you are?"
      },
      platinum: {
        amount: 100000000,
        description: "Gain 100,000,000 Fame.",
        flavor: "Everyone will know your name."
      }
    },
    money: {
      ranks: ["bronze", "silver", "gold", "platinum"],
      bronze: {
        amount: 1000,
        description: "Earn $1000.",
        flavor: "Don't quit your day job."
      },
      silver: {
        amount: 50000,
        description: "Earn $50,000.",
        flavor: "And your mom said music wasn't a career."
      },
      gold: {
        amount: 1000000,
        description: "Earn $1,000,000.",
        flavor: "Me millionth dollar!"
      },
      platinum: {
        amount: 50000000,
        description: "Earn $50,000,000.",
        flavor: "I guess you could say you made it."
      }
    },
    beats: {
      ranks: ["bronze", "silver", "gold", "platinum"],
      bronze: {
        amount: 1000,
        description: "Create 1,000 Beats.",
        flavor: "Those are some lukewarm beats."
      },
      silver: {
        amount: 10000,
        description: "Create 10,000 Beats.",
        flavor: "Is it getting hot in here are is it just your beats?"
      },
      gold: {
        amount: 100000,
        description: "Create 100,000 Beats.",
        flavor: "The fire departmant has recieved a few calls regarding your beats."
      },
      platinum: {
        amount: 1000000,
        description: "Create 1,000,000 Beats.",
        flavor: "Your beats are significantly contributing to global warming."
      }
    },
    samples: {
      ranks: ["bronze", "silver", "gold", "platinum"],
      bronze: {
        amount: 100,
        description: "Create 100 Samples.",
        flavor: "The only way to be accepted as a true DJ."
      },
      silver: {
        amount: 1000,
        description: "Create 1,000 Samples.",
        flavor: "Apparently required to hang out with Daft Punk."
      },
      gold: {
        amount: 10000,
        description: "Create 10,000 Samples.",
        flavor: "Required to gain access to the secret DJ society."
      },
      platinum: {
        amount: 100000,
        description: "Create 100,000 Samples.",
        flavor: "Legends say this is how you gain passage to DJ Heaven."
      }
    },
    notes: {
      ranks: ["bronze", "silver", "gold", "platinum"],
      bronze: {
        amount: 1000,
        description: "Create 1,000 Notes.",
        flavor: "Mary had a little lamb."
      },
      silver: {
        amount: 10000,
        description: "Create 10,000 Notes.",
        flavor: "TODO"
      },
      gold: {
        amount: 100000,
        description: "Create 100,000 Notes.",
        flavor: "TODO"
      },
      platinum: {
        amount: 1000000,
        description: "Create 1,000,000 Notes.",
        flavor: "Your vision is slowly turning black and white."
      }
    },
    measures: {
      ranks: ["bronze", "silver", "gold", "platinum"],
      bronze: {
        amount: 100,
        description: "Create 100 Measures.",
        flavor: "Just listen to the ticking of the metronome."
      },
      silver: {
        amount: 1000,
        description: "Create 1,000 Measures.",
        flavor: "No matter where you go, you hear the ticking."
      },
      gold: {
        amount: 10000,
        description: "Create 10,000 Samples.",
        flavor: "Your mind is not your own, while the metronome tolls."
      },
      platinum: {
        amount: 100000,
        description: "Create 100,000 Samples.",
        flavor: "The notes... play... themselves..."
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
        amount: 5,
        description: "Create 5 Songs.",
        flavor: "You might actually be getting good at this."
      },
      gold: {
        amount: 25,
        description: "Create 25 Songs.",
        flavor: "At this point, someone must like at least one of your songs..."
      },
      platinum: {
        amount: 100,
        description: "Create 100 Songs.",
        flavor: "How haven't you run out of ideas yet?"
      }
    },
    cheat: {
      ranks: ["platinum"],
      platinum: {
        amount: 1,
        description: "Cheater.",
        flavor: "Nobody is impressed."
      },
      hidden: true
    },
  };
};
