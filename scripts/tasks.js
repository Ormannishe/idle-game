var activeTask;

function Task(name, tooltip, checkFn, failFn, startFn, finishFn, timeToComplete) {
    this.name = name;
    this.tooltip = tooltip;
    this.checkFn = checkFn;
    this.failFn = failFn;
    this.startFn = startFn;
    this.finishFn = finishFn;
    this.timeToComplete = timeToComplete;
}

function doTask(taskName) {
  let task = getTask(taskName);

  if (task.checkFn()) {
    task.startFn(task);
  }
  else {
    task.failFn();
  }

  updateView();
}


function getTask(taskName) {
  return game.tasks.filter(task => task.name === taskName)[0];
}

function removeTask(taskName) {
  game.tasks.splice(game.tasks.findIndex(task => task.name === taskName), 1)
}

function startActiveTask(task) {
  // TODO Implement tickFn

  if (activeTask == undefined) {
    var container = document.getElementById('taskProgressContainer');
    var label = document.getElementById('taskLabel');
    var progress = document.getElementById('taskProgress');

    activeTask = task;
    label.innerHTML = task.name;
    progress.value = 0;
    progress.max = task.timeToComplete;
    container.style.display = "block";

    return true;
  }

  appendToOutputContainer("You can only work on one active task at a time!");
  return false;
}

function stopActiveTask() {
  var container = document.getElementById('taskProgressContainer');

  activeTask = undefined;
  container.style.display = "none";
}

/* ------ TASKS ------
There are two types of Tasks:

1. Upgrades - These are tasks that execute and complete instantly, usually providing some kind of immediate bonus.
2. Active Tasks - These tasks complete over time. The Player can only work on one active task at a time.

---- Structure of Tasks -----

function makeSampleTask() {
  var checkFn = function() {
    // the check to see if a task doable
  };

  var failFn = function() {
    // What happens if the task is clicked but the checkFn is not passed (usually an error message)
  };

  var startFn = function(task) {
    // What should be done immediately after clicking the button
  };

  var tickFn = function() {
    // Not Yet Implemented!
  }

  var finishFn = function(task) {
    // Only required for active tasks
    // What should be done when the task has completed
  };

  var tooltip = "String to display when hovering over the task button";

  // x = time required to complete the task
  // finishFn and timeToComplete are only required for active tasks
  var sampleTask = new Task("Task Name", tooltip, checkFn, failFn, finishFn, x);

  // Add the task to the game's task list
  game.tasks.push(sampleTask);
}

------- Flow to Tasks -------

checkFn --> (if true) --> startFn --> tickFn (per tickrate) --> finishFn
        \-> (if false) -> failFn
*/

// Use this to debug whatever you want
function makeCheatTask() {
  var checkFn = function() {
    return true;
  }

  var startFn = function(task) {
    game.player.addBeat(10);
    game.player.addMoney(100);
  };

  var tooltip = "Gives free beats and money. Cheater.";
  var cheatTask = new Task("CHEAT", tooltip, checkFn, undefined, startFn);

  game.tasks.push(cheatTask);
}

function makeFirstSampleTask() {
  var checkFn = function() {
    return game.player.beats >= game.beatsPerSample;
  };

  var failFn = function() {
    appendToOutputContainer("You don't have enough beats make a sample!");
  };

  var startFn = function(task) {
    makeSample(1);
    document.getElementById('samples').style.display = "block";
    appendToOutputContainer("You've created your first musical sample! Your eyes glow with pride as you take one more step toward your destiny.");
    removeTask("Make First Sample");
  };

  var tooltip = "Create your first ever sample! Requires " + game.beatsPerSample + " beats.";
  var firstSampleTask = new Task("Make First Sample", tooltip, checkFn, failFn, startFn);

  game.tasks.push(firstSampleTask);
}

function makeFirstSongTask() {
  var checkFn = function() {
    return game.player.samples >= game.samplesPerSong;
  };

  var failFn = function() {
    appendToOutputContainer("You don't have enough samples to make a song!");
  };

  var startFn = function(task) {
    var songName = prompt("Please enter your song name:", "Sandstorm");

    if (songName !== null) {
      task.songName = songName;
      startActiveTask(task);
    }

    removeTask("Make First Song");
  };

  var finishFn = function() {
    makeSong(activeTask.songName, ["laptop"]);
    appendToOutputContainer("You've created your first song. The start of a legacy!");
    document.getElementById('songsTab').style.display = "inline";
    stopActiveTask();
    makeNewSongTask();
  };

  var tooltip = "Active Task: Make your first ever song! Requires " + game.samplesPerSong + " samples and takes 10 seconds to complete.";
  var firstSongTask = new Task("Make First Song", tooltip, checkFn, failFn, startFn, finishFn, 10);

  game.tasks.push(firstSongTask);
}

function makeNewSongTask() {
  var checkFn = function() {
    return game.player.samples >= game.samplesPerSong;
  };

  var failFn = function() {
    appendToOutputContainer("You don't have enough samples to make a song!");
  };

  var startFn = function(task) {
    var songName = prompt("Please enter your song name:", "Sandstorm");

    if (songName !== null) {
      task.songName = songName;
      startActiveTask(task);
    }
  };

  var finishFn = function() {
    makeSong(activeTask.songName, ["laptop"]);
    appendToOutputContainer("You've created a new song!");
    stopActiveTask();
  };

  var tooltip = "Active Task: Make your first ever song! Requires " + game.samplesPerSong + " samples and takes 10 seconds to complete.";
  var newSongTask = new Task("Make New Song", tooltip, checkFn, failFn, startFn, finishFn, 10);

  game.tasks.push(newSongTask);
}

function makeDJAtBirthdayPartyTask() {
  var checkFn = function() {
    return game.player.beats >= 20;
  };

  var failFn = function() {
    appendToOutputContainer("You don't have enough beats to DJ!");
  };

  var startFn = function(task) {
    if (startActiveTask(task))
      game.player.beats -= 20;
  };

  var finishFn = function() {
    game.player.addXp("laptop", 250);
    game.player.addMoney(50);
    appendToOutputContainer("You earn a quick 50 bucks DJing at a birthday party.");
    stopActiveTask();
  };

  var tooltip = "Active Task: DJ for a birthday party. Requires 20 beats, rewards $50 and 250 Laptop XP. Completes over 120 seconds.";
  var DJAtBirthdayPartyTask = new Task("DJ At Birthday Party", tooltip, checkFn, failFn, startFn, finishFn, 120);

  game.tasks.push(DJAtBirthdayPartyTask);
}

function makeBuyNewLaptopTask() {
  var checkFn = function() {
    return game.player.money >= 500;
  };

  var failFn = function() {
    appendToOutputContainer("You don't have enough money to purchase a new laptop!");
  };

  var startFn = function(task) {
    var beatProgress = document.getElementById('beatProgress');

    game.clicksPerBeat = Math.ceil(game.clicksPerBeat * 0.75);
    game.player.money -= 500;
    updateProgress(beatProgress, beatProgress.value, game.clicksPerBeat, makeBeat);
    removeTask("Buy New Laptop");
  };

  var tooltip = "Purchase a new laptop. Costs $500. Reduces the number of clicks per beat by 25%.";
  var buyNewLaptopTask = new Task("Buy New Laptop", tooltip, checkFn, failFn, startFn);

  game.tasks.push(buyNewLaptopTask);
}

function makeBuyMicrophoneTask() {
  var checkFn = function() {
    return game.player.money >= 1000;
  };

  var failFn = function() {
    appendToOutputContainer("You don't have enough money to purchase a microphone!");
  };

  var startFn = function(task) {
    game.player.money -= 1000;
    appendToOutputContainer("You purchase a microphone. Maybe your voice will add another element to your music.");
    document.getElementById('vocalTab').style.display = "inline";
    document.getElementById('vocalSkill').style.display = "inline";
    removeTask("Buy a Microphone");
  };

  var tooltip = "Purchase a new microphone. Costs $1000. Unlocks the vocals skill.";
  var buyMicrophoneTask = new Task("Buy a Microphone", tooltip, checkFn, failFn, startFn);

  game.tasks.push(buyMicrophoneTask);
}
