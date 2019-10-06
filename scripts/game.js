/*
  Contains all game data and functions for manipulating top-level game data
  Authoritative source for game constants (ie. how much things cost)

  The game object should be pure and stateless. This enables changing of game
  constants in the future that can be applied regardless of player progress.
*/

var gameVersion = "0.0.1";
var uiData = {};

/*
  Save/Load Functionality
*/

function newGame() {
  // Erases save data and creates a new game object
  if (window.localStorage.getItem('saveData') !== null)
    eraseSave();

  game = new Game();
  addTrigger(oddJobsEventTrigger);
  initAchievements();
  unlockAchievement("fame");
  unlockAchievement("money");
  firstInstrumentPopUp();
}

function selectInstrument(instrument) {
  showUiElement(instrument + "Tab", "inline"),
  showUiElement(instrument + "Skill", "inline"),
  toggleTab(instrument, "instrument");

  switch (instrument) {
    case "laptop":
      initLaptopTriggers();
      appendToOutputContainer("While browsing the web, you come across an online tool for editing music! Curiosity pulls you toward your destiny.");
      break;
    case "vocal":
      initVocalTriggers();
      appendToOutputContainer("You lay in your bed with nothing but a pad of paper, a pen, and a tune stuck in your head. You begin to write.");
      break;
    case "keyboard":
      initKeyboardTriggers();
      appendToOutputContainer("You discover a dusty keyboard in your basement. You feel drawn to the glossy white and black keys.");
      break;
    default:
      break;
  }

  document.getElementById("popUpClose").style.display = "block";
  closePopUp();
  hideTooltip();
  startTicking();
}

function getSaveData() {
  /*
    Returns an object containing all of the data necessary to restore game state.
  */
  var saveData = {
    playerData: game.player,
    uiData: uiData,
    textLog: document.getElementById('outputContainer').innerHTML,
    version: gameVersion
  }

  return saveData;
}

function saveGame() {
  /*
    Serializes and stores all necessary player data in local storage.
    Stored data requires deserialization in the loadGame function.
  */

  window.localStorage.setItem('saveData', JSON.stringify(getSaveData()));
}

function loadGame(saveData) {
  /*
    Deserializes local storage and restores game state.
    If no save data is found, starts a new game.
  */

  // TODO: Check version in save data
  if (saveData == undefined)
    saveData = JSON.parse(window.localStorage.getItem('saveData'));

  if (saveData !== null) {
    // Restore game state
    game = new Game();
    // TODO: Before overwriting the default player object, merge in keys/values
    // that are missing from the stored player object
    game.player = saveData.playerData;
    initAchievements();

    // Apply UI Changes
    var outputContainer = document.getElementById('outputContainer');
    var activeInstrument = game.player.instruments.active;

    for (var key in saveData.uiData) {
      showUiElement(key, saveData.uiData[key]);
    }

    if (game.player.activeTask !== undefined) {
      var task = getTaskFromContext(game.player.activeTask);
      document.getElementById('taskLabel').innerHTML = game.player.activeTask.taskName;
      document.getElementById('taskProgress').value = game.player.activeTask.timeInProgress;
      document.getElementById('taskProgress').max = task.timeToComplete;
    }

    outputContainer.innerHTML = saveData.textLog;
    outputContainer.scrollTop = outputContainer.scrollHeight;
    toggleProgressNumbers(game.player.options.progressNumbers);
    updateCharacterName(game.player.name);
    updateCharacterResource("health");
    updateCharacterResource("energy");
    toggleTab(activeInstrument, "instrument");
    closePopUp();
    startTicking();
  }
  else {
    newGame();
  }
}

function eraseSave() {
  window.localStorage.clear();
  location.reload(); // required to reload original HTML
}

function exportSave() {
  var saveLink = document.createElement('a');
  var saveData = JSON.stringify(getSaveData());

  saveLink.href = "data:application/octet-stream,"+encodeURIComponent(window.btoa(saveData));
  saveLink.download = 'idleGameSave.txt';
  saveLink.click();
  saveLink.parentNode.removeChild(saveLink);
}

function importSave() {
  var saveData = document.getElementById("loadGameInput").value;

  loadGame(JSON.parse(window.atob(saveData)));
}

/*
  Game Options
*/

function toggleProgressNumbers(setValue) {
  var progressList = document.getElementsByTagName("progress");
  var optionButton = document.getElementById("progressNumberButton");

  if (setValue == false || (setValue == undefined && game.player.options.progressNumbers)) {
    // disable the progress numbers by removing the progressNumbers class
    for (var i = 0; i < progressList.length; i++) {
      progressList[i].classList.remove("progressNumbers");
    }

    game.player.options.progressNumbers = false;
    optionButton.innerHTML = "OFF";
    optionButton.classList.remove("optionButtonOn");
    optionButton.classList.add("optionButtonOff");
  }
  else {
    // enable the progress numbers by adding the progressNumbers class
    for (var i = 0; i < progressList.length; i++) {
      progressList[i].classList.add("progressNumbers");
    }

    game.player.options.progressNumbers = true;
    optionButton.innerHTML = "ON";
    optionButton.classList.remove("optionButtonOff");
    optionButton.classList.add("optionButtonOn");
  }
}

/*
  Game Object
*/

function Game() {
  this.player = new Player();
  this.resources = {
    fame: {},
    money: {},
    beats: {
      instrument: "laptop",
      clicksPer: 150,
      xpPer: 5
    },
    samples: {
      instrument: "laptop",
      resourcesPer: 25,
      requiredResource: "beats",
      xpPer: 50
    },
    lyrics: {
      instrument: "vocal",
      clicksPer: 1000,
      xpPer: 5
    },
    stanzas: {
      instrument: "vocal",
      resourcesPer: 25,
      requiredResource: "lyrics",
      xpPer: 50
    },
    notes: {
      instrument: "keyboard",
      clicksPer: 100,
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
    vocal: {
      maxMultiplier: 10,
      minAmplitude: 10,
      maxAmplitude: 50,
      minFrequency: 10,
      maxFrequency: 50,
      framesToSolve: 1500
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
    lyrics: {
      ranks: ["bronze", "silver", "gold", "platinum"],
      bronze: {
        amount: 1000,
        description: "Create 1,000 Lyrics.",
        flavor: "TODO"
      },
      silver: {
        amount: 10000,
        description: "Create 10,000 Lyrics.",
        flavor: "TODO"
      },
      gold: {
        amount: 100000,
        description: "Create 100,000 Lyrics.",
        flavor: "TODO"
      },
      platinum: {
        amount: 1000000,
        description: "Create 1,000,000 Lyrics.",
        flavor: "'I would define, in brief, the poetry of words as the rhythmical creation of Beauty' - Edgar Allan Poe"
      }
    },
    stanzas: {
      ranks: ["bronze", "silver", "gold", "platinum"],
      bronze: {
        amount: 100,
        description: "Create 100 Stanzas.",
        flavor: "TODO"
      },
      silver: {
        amount: 1000,
        description: "Create 1,000 Stanzas.",
        flavor: "TODO"
      },
      gold: {
        amount: 10000,
        description: "Create 10,000 Stanzas.",
        flavor: "TODO"
      },
      platinum: {
        amount: 100000,
        description: "Create 100,000 Stanzas.",
        flavor: "TODO"
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
        description: "Use the secret cheat task.",
        flavor: "That was meant for debugging."
      },
      hidden: true
    },
  };
};
