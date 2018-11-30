var activeTask;
var taskCompleteFn;

var cheatTask;
var firstSampleTask;
var firstSongTask;
var newSongTask;
var DJAtBirthdayPartyTask;
var buyNewLaptopTask;
var buyMicrophoneTask;

function initTasks() {
  makeCheatTask();
  makeFirstSampleTask();
  makeFirstSongTask();
  makeNewSongTask();
  makeDJAtBirthdayPartyTask();
  makeBuyNewLaptopTask();
  makeBuyMicrophoneTask();
}

function doTask(taskName) {
  let task = game.tasks.filter(task => task.name === taskName)[0];
  if (task.checkFn()) {
    task.startFn(task.tickFn, task.finishFn)
  } else {
    task.failFn();
  }
  updateView();
}

function startActiveTask(taskName, timeToComplete, tickFn, finishFn) {
  /*
  TODO call tickFn the correct amount of times during the duration of the activeTask
  */
  if (activeTask == undefined) {
    var container = document.getElementById('taskProgressContainer');
    var label = document.getElementById('taskLabel');
    var progress = document.getElementById('taskProgress');

    activeTask = taskName;
    taskCompleteFn = function() {
      if (finishFn) {
        finishFn();
      }

      stopActiveTask();
    };

    label.innerHTML = taskName;
    progress.value = 0;
    progress.max = timeToComplete;
    taskProgressContainer.style.display = "block";

    return true;
  }

  appendToOutputContainer("You can only work on one active task at a time!");
  return false;
}

function stopActiveTask() {
  var progress = document.getElementById('taskProgress');

  activeTask = undefined;
  taskProgressContainer.style.display = "none";
}

function removeTask(taskName) {
  // var taskIndex = game.tasks.indexOf(task);
  // game.tasks.splice(taskIndex, 1);

  // game.tasks = game.tasks.filter(function(task) {
  //   return task.name == taskName;
  // })

  game.tasks.splice(game.tasks.findIndex(task => task.name === taskName), 1)
}

/* ------ TASKS ------
There are two types of Tasks:

1. Upgrades - These are tasks that execute and complete instantly, usually providing some kind of immediate bonus.
2. Active Tasks - These tasks complete over time. The Player can only work on one active task at a time.

---- Structure of Tasks -----

var sampleTask = new Task(
  "Make First Sample",
  function() {
    //checkFn
    // the check to see if a task doable
  },
  function(tickFn, finishFn) {
    //startFn
    // What happens when the task is first clicked
    // If used with startActiveTask, finishFn should be inside it
    finishFn();
  },
  function() {
    //tickFn
    // Something that happens x times over the duration of an activeFn
  },
  function() {
    //finishFn
    // What happens when the task is finished
  },
  function() {
    //failFn
    // What happens if the task is clicked but the checkFn is not passed
  },
  0, // How many times the tickFn runs during the activeTask
  "A TOOLTIP" // Tooltip to show when hovering over a task
);

------- Flow to Tasks -------

checkFn --> (if true) --> startFn --> tickFn (per tickrate) --> finishFn
        \-> (if false) -> failFn
*/

function Task(name, checkFn, startFn, tickFn, finishFn, failFn, tickCount, tooltipText) {
  this.name = name;
  this.checkFn = checkFn;
  this.startFn = startFn;
  this.tickFn = tickFn;
  this.finishFn = finishFn;
  this.failFn = failFn;
  this.tickCount = tickCount;
  this.tooltipText = tooltipText;
}

// Use this to debug whatever you want
function makeCheatTask() {
  cheatTask = new Task(
    "CHEAT",
    function() {
      //checkFn
      // the check to see if a task doable
      return true;
    },
    function(tickFn, finishFn) {
      //startFn
      // What happens when the task is first clicked
      // If used with startActiveTask, finishFn should be inside it
      game.player.addBeat(10);
      game.player.addMoney(100);
      finishFn();
    },
    function() {
      //tickFn
      // Something that happens x times over the duration of an activeFn
    },
    function() {
      //finishFn
      // What happens when the task is finished
    },
    function() {
      //failFn
      // What happens if the task is clicked but the checkFn is not passed
    },
    0, // How many times the tickFn runs during the activeTask
    "Gives free beats and money. Cheater."
  );
}

function makeFirstSampleTask() {
  firstSampleTask = new Task(
    "Make First Sample",
    function() {
      //checkFn
      return game.player.beats >= game.beatsPerSample;
    },
    function(tickFn, finishFn) {
      //startFn
      makeSample(1);
      document.getElementById('samples').style.display = "block";
      appendToOutputContainer("You've created your first musical sample! Your eyes glow with pride as you take one more step toward your destiny.");
      finishFn();
    },
    function() {
      //tickFn
    },
    function() {
      //finishFn
      removeTask("Make First Sample");
    },
    function() {
      //failFn
      appendToOutputContainer("You don't have enough beats make a sample!");
    },
    0,
    "Create your first ever sample! Requires " + game.beatsPerSample + " beats."
  );
}

function makeFirstSongTask() {
  firstSongTask = new Task(
    "Make First Song",
    function() {
      //checkFn
      return game.player.samples >= game.samplesPerSong;
    },
    function(tickFn, finishFn) {
      //startFn
      var songName = prompt("Please enter your song name:", "Sandstorm");
      if (songName !== null) {
        startActiveTask("Make First Song", 10, tickFn, function() {
          makeSong(songName, ["laptop"]);
          appendToOutputContainer("You've created your first song. The start of a legacy!");
          document.getElementById('songsTab').style.display = "inline";
          finishFn();
        });
      }
    },
    function() {
      //tickFn
    },
    function() {
      //finishFn
      removeTask("Make First Song");
      addMakeNewSongTask();
    },
    function() {
      //failFn
      appendToOutputContainer("You don't have enough samples to make a song!");
    },
    0,
    "Active Task: Make your first ever song! Requires " + game.samplesPerSong + " samples and takes 10 seconds to complete."
  );
}

function makeNewSongTask() {
  newSongTask = new Task(
    "Make First Song",
    function() {
      //checkFn
      return game.player.samples >= game.samplesPerSong;
    },
    function(tickFn, finishFn) {
      //startFn
      var songName = prompt("Please enter your song name:", "Sandstorm");
      if (songName !== null) {
        startActiveTask("Making New Song", 10, tickFn, function() {
          makeSong(songName, ["laptop"]);
          appendToOutputContainer("You've created a new song!");
          finishFn();
        });
      }
    },
    function() {
      //tickFn
    },
    function() {
      //finishFn
      removeTask("Make First Song");
    },
    function() {
      //failFn
      appendToOutputContainer("You don't have enough samples to make a new song!");
    },
    0,
    "Active Task: Make a new song! Requires " + game.samplesPerSong + " samples and takes 10 seconds to complete."
  );
}

function makeDJAtBirthdayPartyTask() {
  DJAtBirthdayPartyTask = new Task(
    "DJ At Birthday Party",
    function() {
      //checkFn
      return game.player.beats >= 30;
    },
    function(tickFn, finishFn) {
      //startFn
      game.player.beats -= 20;

      startActiveTask("DJing at a birthday party", 10, tickFn, function() {
        game.player.addXp("laptop", 250);
        game.player.addMoney(50);
        appendToOutputContainer("You earn a quick 50 bucks DJing at a birthday party.");
        finishFn();
      });
    },
    function() {
      //tickFn
    },
    function() {
      //finishFn
      removeTask("DJ At Birthday Party");
    },
    function() {
      //failFn
      appendToOutputContainer("You don't have enough beats to DJ! You need 30 beats!");
    },
    0,
    "Active Task: DJ for a birthday party. Requires 20 beats, rewards $50 and 250 Laptop XP. Completes over 120 seconds."
  );
}

function makeBuyNewLaptopTask() {
  buyNewLaptopTask = new Task(
    "Buy New Laptop",
    function() {
      //checkFn
      return game.player.money >= 500;
    },
    function(tickFn, finishFn) {
      //startFn
      var beatProgress = document.getElementById('beatProgress');

      game.clicksPerBeat = 5;
      game.player.money -= 500;
      updateProgress(beatProgress, beatProgress.value, game.clicksPerBeat, makeBeat);
      finishFn();
    },
    function() {
      //tickFn
    },
    function() {
      //finishFn
      removeTask("Buy New Laptop");
    },
    function() {
      //failFn
      appendToOutputContainer("You don't have enough money to purchase a new laptop!");
    },
    0,
    "Purchase a new laptop. Costs $500. Reduces the number of clicks per beat to 25%."
  );
}

function makeBuyMicrophoneTask() {
  buyMicrophoneTask = new Task(
    "Buy a Microphone",
    function() {
      //checkFn
      return game.player.money >= 1000;
    },
    function(tickFn, finishFn) {
      //startFn
      game.player.money -= 1000;
      appendToOutputContainer("You purchase a microphone. Maybe your voice will add another element to your music.");
      document.getElementById('vocalTab').style.display = "inline";
      document.getElementById('vocalSkill').style.display = "inline";
      finishFn();
    },
    function() {
      //tickFn
    },
    function() {
      //finishFn
      removeTask("Buy a Microphone");
    },
    function() {
      //failFn
      appendToOutputContainer("You don't have enough money to purchase a microphone!");
    },
    0,
    "Purchase a new microphone. Costs $1000. Unlocks the vocals skill."
  );
}
