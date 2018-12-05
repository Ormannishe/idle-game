var activeTask;

function Task(name, tooltip, checkFn, failFn, startFn, tickFn, finishFn, timeToComplete) {
    this.name = name;
    this.tooltip = tooltip;
    this.checkFn = checkFn;
    this.failFn = failFn;
    this.startFn = startFn;
    this.tickFn = tickFn;
    this.finishFn = finishFn;
    this.timeToComplete = timeToComplete;
}

function doTask(taskName) {
  let task = getTask(taskName);

  if (task.checkFn()) {
    task.startFn(task);
    hideTooltip();
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
    // Only required for active tasks
    // What should be done per natural tick while the task is active
  }

  var finishFn = function(task) {
    // Only required for active tasks
    // What should be done when the task has completed
  };

  var tooltip = "String to display when hovering over the task button";

  // x = time required to complete the task (only required for active tasks)
  var sampleTask = new Task("Task Name", tooltip, checkFn, failFn, tickFn, finishFn, x);

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
    makeBeat(25);
    game.player.addMoney(100);
  };

  var tooltip = {"description": "Gives free beats and money. Cheater.",
                 "cost": {"No Cost": ""},
                 "flavor": "Cheaters never prosper. Well.. except for right now."};
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

  var tooltip = {"description": "Create your first ever sample!",
                 "cost": {"Beats": game.beatsPerSample},
                 "flavor": "Free samples are always great. These samples are okay too."};

  var firstSampleTask = new Task("Make First Sample", tooltip, checkFn, failFn, startFn);
  game.tasks.push(firstSampleTask);
}

function makeFirstSongTask() {
  var timeTaken = 10;

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

  var tooltip = {"description": "Create your first ever song!",
                 "cost": {"Samples": game.samplesPerSong,
                          "Time": timeTaken},
                 "flavor": "You'll probably be embarassed by this one in a few years."};

  var firstSongTask = new Task("Make First Song", tooltip, checkFn, failFn, startFn, undefined, finishFn, timeTaken);
  game.tasks.push(firstSongTask);
}

function makeNewSongTask() {
  var timeTaken = 10;

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

  var tooltip = {"description": "Create a new song!",
                 "cost": {"Samples": game.samplesPerSong,
                          "Time": timeTaken},
                 "flavor": "Every new song is a new chance. Unless you're Nickelback. Then it's just the same chance over and over."};

  var newSongTask = new Task("Make New Song", tooltip, checkFn, failFn, startFn, undefined, finishFn, timeTaken);
  game.tasks.push(newSongTask);
}

function makeDJAtBirthdayPartyTask() {
  var numRequiredBeats = 20;
  var timeTaken = 120;

  var checkFn = function() {
    return game.player.beats >= numRequiredBeats;
  };

  var failFn = function() {
    appendToOutputContainer("You don't have enough beats to DJ!");
  };

  var startFn = function(task) {
    if (startActiveTask(task))
      game.player.beats -= numRequiredBeats;
  };

  var finishFn = function() {
    game.player.addXp("laptop", 250);
    game.player.addMoney(50);
    appendToOutputContainer("You earn a quick 50 bucks DJing at a birthday party.");
    stopActiveTask();
  };

  var tooltip = {"description": "DJ for a birthday party! Rewards $50 and Laptop XP.",
                 "cost": {"Beats": numRequiredBeats,
                          "Time": timeTaken},
                 "flavor": "Be careful. Kids are honest. Brutally honest."};

  var DJAtBirthdayPartyTask = new Task("DJ At Birthday Party", tooltip, checkFn, failFn, startFn, undefined, finishFn, timeTaken);
  game.tasks.push(DJAtBirthdayPartyTask);
}

function makeBuyNewLaptopTask() {
  var requiredMoney = 500;

  var checkFn = function() {
    return game.player.money >= requiredMoney;
  };

  var failFn = function() {
    appendToOutputContainer("You don't have enough money to purchase a new laptop!");
  };

  var startFn = function(task) {
    var beatProgress = document.getElementById('beatProgress');

    game.clicksPerBeat = Math.ceil(game.clicksPerBeat * 0.75);
    game.player.money -= requiredMoney;
    updateProgress(beatProgress, beatProgress.value, game.clicksPerBeat, makeBeat);
    removeTask("Buy New Laptop");
  };

  var tooltip = {"description": "Purchase a new laptop. Reduces the number of clicks per beat by 25%.",
                 "cost": {"Money": requiredMoney},
                 "flavor": "A new laptop increases your efficieny. Which is weird. It doesn't work like that in the real world."};

  var buyNewLaptopTask = new Task("Buy New Laptop", tooltip, checkFn, failFn, startFn);
  game.tasks.push(buyNewLaptopTask);
}

function makeBuyMicrophoneTask() {
  var requiredMoney = 1000;

  var checkFn = function() {
    return game.player.money >= requiredMoney;
  };

  var failFn = function() {
    appendToOutputContainer("You don't have enough money to purchase a microphone!");
  };

  var startFn = function(task) {
    game.player.money -= requiredMoney;
    appendToOutputContainer("You purchase a microphone. Maybe your voice will add another element to your music.");
    document.getElementById('vocalTab').style.display = "inline";
    document.getElementById('vocalSkill').style.display = "inline";
    removeTask("Buy a Microphone");
  };

  var tooltip = {"description": "Purchase a new microphone. Unlocks the vocals skill.",
                 "cost": {"Money": requiredMoney},
                 "flavor": "You could never really tell if you were good at singing or just bad at hearing."};

  var buyMicrophoneTask = new Task("Buy a Microphone", tooltip, checkFn, failFn, startFn);
  game.tasks.push(buyMicrophoneTask);
}

function makeStudyOnlineTask() {
  var timeTaken = 30;

  var checkFn = function() {
    return true;
  };

  var startFn = function(task) {
    startActiveTask(task);
  };

  var tickFn = function() {
    if (Math.random() <= 0.2)
      makeBeat();
  };

  var finishFn = function() {
    stopActiveTask();
  };

  var tooltip = {"description": "Do some online studying to improve your musical skills. Has a 20% chance per second to generate a beat and rewards laptop XP.",
                 "cost": {"Time": timeTaken},
                 "flavor": "Even in your video games, you can't escape studying."};

  var studyOnlineTask = new Task("Study Music Online", tooltip, checkFn, undefined, startFn, tickFn, finishFn, timeTaken);
  game.tasks.push(studyOnlineTask);
}

function makeMusicClassTask() {
  var timeTaken = 120;
  var requiredMoney = 100;

  var checkFn = function() {
    return game.player.money >= requiredMoney;
  };

  var failFn = function() {
    appendToOutputContainer("You don't have enough money to take a class!");
  };

  var startFn = function(task) {
    if (startActiveTask(task))
      game.player.money -= requiredMoney;
  };

  var tickFn = function() {
    if (Math.random() <= 0.5)
      makeBeat();
  };

  var finishFn = function() {
    if (Math.random() <= 0.25) {
      appendToOutputContainer("Some friends from your music class invite you to a jam session!");
      makeJamSessionTask();
    }

    stopActiveTask();
  };

  var tooltip = {"description": "Take a music class to further develop your musical skills. Has a 50% chance per second to generate a beat and rewards laptop XP.",
                 "cost": {"Money": requiredMoney,
                          "Time": timeTaken},
                 "flavor": "$" + requiredMoney + " per class? Why does the world hate students?"};

  var musicClassTask = new Task("Take A Music Class", tooltip, checkFn, failFn, startFn, tickFn, finishFn, timeTaken);
  game.tasks.push(musicClassTask);
}

function makeJamSessionTask() {
  var timeTaken = 60;

  var checkFn = function() {
    return true;
  };

  var startFn = function(task) {
    startActiveTask(task);
    removeTask(task);
  };

  var tickFn = function() {
    if (Math.random() <= 0.5)
      makeBeat();
  };

  var finishFn = function() {
    stopActiveTask();
  };

  var tooltip = {"description": "Jam out at a friend's house. Has a 50% chance per second to generate a beat and rewards laptop XP.",
                 "cost": {"Time": timeTaken},
                 "flavor": "Friends are great to have. Especially when they produce free beats."};

  var jamSessionTask = new Task("Attend Jam Session", tooltip, checkFn, undefined, startFn, tickFn, finishFn, timeTaken);
  game.tasks.push(jamSessionTask);
}
