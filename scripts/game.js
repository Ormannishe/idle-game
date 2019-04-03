/*
  Contains all game data and functions for manipulating top-level game data
  Authoritative source for game constants (ie. how much things cost)
*/

function Game() {
  this.player = new Player();
  this.triggerFnSet = new Set();
  this.tasks = [];
  this.activeTask = undefined;
  this.resources = { fame: {},
                     money: {},
                     beats: { instrument: "laptop",
                              clicksPer: 30,
                              xpPer: 5 },
                     samples: { instrument: "laptop",
                               resourcesPer: 25,
                               requiredResource: "beats",
                               xpPer: 50 },
                     notes: { instrument: "keyboard",
                              clicksPer: 50,
                              xpPer: 5 },
                     measures: { instrument: "keyboard",
                                 resourcesPer: 25,
                                 requiredResource: "notes",
                                 xpPer: 50 }
                    };
  this.specialResources = { songs: { instruments: ["laptop", "keyboard"],
                                     resourcesPer: 50,
                                     validResources: ["samples", "measures"],
                                     xpPer: 500 }};
  this.instruments = { laptop: { level: 1,
                                 currentTempo: "slow",
                                 tempoSpeeds: { slowest: 25,
                                                slow: 15,
                                                fast: 10,
                                                fastest: 5 },
                                 dropActive: false },
                       keyboard: { currentNote: undefined,
                                   currentSong: undefined }
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
    Serializes and stores all necessary game data in local storage.
    Stored data requires deserialization in the loadGame function.

    Tasks and triggers require special serialization because functions cannot
    be stored in local storage.
  */
  var triggers = [];
  var tasks = {};
  var activeTask = {};
  var replacer = function(k, v) { if (v === undefined) { return null; } return v; };

  game.triggerFnSet.forEach(function (trigger){
    triggers.push(trigger.name);
  });

  game.tasks.forEach(function (task){
    tasks[task.taskFnRef] = task.argument;
  });

  if (game.activeTask !== undefined)
     activeTask[game.activeTask.taskFnRef] = game.activeTask.argument;

  // Serialize regular game data
  window.localStorage.setItem('gameData', JSON.stringify(game));

  // Serialize tasks and triggers
  window.localStorage.setItem('triggers', JSON.stringify(triggers))
  window.localStorage.setItem('tasks', JSON.stringify(tasks, replacer));
  window.localStorage.setItem('activeTask', JSON.stringify(activeTask, replacer));

  // Serialize HTML
  window.localStorage.setItem('html', JSON.stringify(document.body.innerHTML));
}

function loadGame() {
  /*
    Deserializes local storage and restores game state.

    Tasks and triggers require special restoration because functions cannot
    be stored in local storage. The stored game object will have bad values in
    game.triggerFnSet, game.tasks and game.activeTask by default.
  */

  var gameData = JSON.parse(window.localStorage.getItem('gameData'));
  var triggers = JSON.parse(window.localStorage.getItem('triggers'));
  var tasks = JSON.parse(window.localStorage.getItem('tasks'));
  var activeTask = JSON.parse(window.localStorage.getItem('activeTask'));
  var html = JSON.parse(window.localStorage.getItem('html'));

  if (gameData !== null) {
    // Restore game in a sane state
    game = gameData;
    game.triggerFnSet = new Set();
    game.tasks = [];
    stopActiveTask();

    // Re-add triggers to triggerFnSet
    triggers.forEach(function (trigger){
      game.triggerFnSet.add(window[trigger]);
    });

    // Re-create tasks and populate the task list
    for (var task in tasks) {
      var taskFn = window[task];
      makeTask(taskFn, tasks[task]);
    }

    // If there was an active task, restart it where it left off
    for (var task in activeTask) {
      var taskFn = window[task];
      var newTask = makeTask(taskFn, activeTask[task]);
      startActiveTask(newTask);
      removeTask(newTask.name);
    }

    document.body.innerHTML = html;
  }
}

function eraseSave() {
  window.localStorage.clear();
  location.reload(); // required to reload original HTML
}
