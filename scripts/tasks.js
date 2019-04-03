/*
  Contains all functionality for the task framework
  Defines all of the tasks available in the game
*/

var oddJobs = ["Mow Lawns", "Shovel Snow", "Yardwork", "Change Tires",
               "Walk Dogs", "Babysitting", "Rake Leaves", "Clean Windows"];

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

function makeTask(taskFn, argument) {
  // Add a reference to the original task function
  // When saving, store just the task functions for all tasks (as strings)
  // When loading, re-run the task functions to repopulate the task list
  // Likely need to store args too in some cases
  var newTask = taskFn(argument);
  newTask.taskFnRef = taskFn.name;
  newTask.argument = argument;
  game.tasks.push(newTask);
  return newTask;
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

function cancelTask() {
  if (getTask(game.activeTask.name) == undefined)
    game.tasks.push(game.activeTask);

  stopActiveTask();
  updateTasks();
}


function getTask(taskName) {
  return game.tasks.filter(task => task.name === taskName)[0];
}

function removeTask(taskName) {
  var index = game.tasks.findIndex(task => task.name === taskName);

  if (index > -1)
    game.tasks.splice(index, 1);
}

function startActiveTask(task) {
  if (game.activeTask == undefined) {
    var container = document.getElementById('taskProgressContainer');
    var label = document.getElementById('taskLabel');
    var progress = document.getElementById('taskProgress');

    game.activeTask = task;
    label.innerHTML = task.name;
    progress.value = 0;
    progress.max = task.timeToComplete;
    container.style.display = "inline-block";

    return true;
  }

  appendToOutputContainer("You can only work on one active task at a time!");
  return false;
}

function updateActiveTask() {
  if (game.activeTask != undefined) {
    var progress = document.getElementById('taskProgress');

    if (game.activeTask.tickFn != undefined)
      game.activeTask.tickFn();

    updateProgress(progress, (progress.value + 1), progress.max, game.activeTask.finishFn);
  }
}

function stopActiveTask() {
  var container = document.getElementById('taskProgressContainer');

  game.activeTask = undefined;
  container.style.display = "none";
}

/* ------ TASKS ------
There are two types of Tasks:

1. Upgrades - These are tasks that execute and complete instantly, usually providing some kind of immediate bonus.
2. Active Tasks - These tasks complete over time. The Player can only work on one active task at a time.

---- Structure of Tasks -----

function exampleTask() {
  var checkFn = function() {
    // the check to see if a task doable
  };

  var failFn = function() {
    // What happens if the task is clicked but the checkFn is not passed (usually an error message)
  };

  var startFn = function(task) {
    // What should be done immediately after clicking the button
    // This function always takes the task object as a parameter
  };

  var tickFn = function() {
    // Only required for active tasks
    // What should be done per natural tick while the task is active
  }

  var finishFn = function(task) {
    // Only required for active tasks or tasks that require user input
    // What should be done when the task has completed
  };

  var tooltip = { "description": "This is an example task",
                 "cost": {"Resource1": "Amount",
                          "Resource2": "Amount"},
                 "flavor": "Try to come up with something clever."};

  // x = time required to complete the task (only required for active tasks)
  var newTask = new Task("Task Name", tooltip, checkFn, failFn, tickFn, finishFn, x);

  // return the task
  return newTask;
}

// make the task using the makeTask function
makeTask(exampleTask, args);

------- Flow to Tasks -------

checkFn --> (if true) --> startFn --> tickFn (per natural tick) --> finishFn
        \-> (if false) -> failFn
*/

// Use this to debug whatever you want
function cheatTask() {
  var checkFn = function() {
    return true;
  }

  var startFn = function(task) {
    addResource("beats", 1500);
    addResource("notes", 1000);
    addResource("money", 1000);
  };

  var tooltip = {"description": "Gives free beats and money. Cheater.",
                 "cost": {"No Cost": ""},
                 "flavor": "Cheaters never prosper. Except for right now."};

  var newTask = new Task("CHEAT", tooltip, checkFn, undefined, startFn);

  return newTask;
}

function firstSampleTask() {
  var checkFn = function() {
    return game.player.resources.beats >= game.resources.samples.resourcesPer;
  };

  var failFn = function() {
    appendToOutputContainer("You don't have enough beats make a sample!");
  };

  var startFn = function(task) {
    addResource("samples");
    document.getElementById('samples').style.display = "block";
    appendToOutputContainer("You've created your first musical sample! Your eyes glow with pride as you take one more step toward your destiny.");
    removeTask(task.name);
  };

  var tooltip = {"description": "Create your first ever sample! Unlocks a tier two resource.",
                 "cost": {"Beats": game.resources.samples.resourcesPer},
                 "flavor": "Free samples are always great. These samples are okay too."};

  var newTask = new Task("Make First Sample", tooltip, checkFn, failFn, startFn);

  return newTask;
}

function firstMeasureTask() {
  var checkFn = function() {
    return game.player.resources.notes >= game.resources.measures.resourcesPer;
  };

  var failFn = function() {
    appendToOutputContainer("You don't have enough notes make a measure!");
  };

  var startFn = function(task) {
    addResource("measures");
    document.getElementById('measures').style.display = "block";
    appendToOutputContainer("You've recorded your first measure!");
    removeTask(task.name);
  };

  var tooltip = {"description": "Record your first ever measure! Unlocks a tier two resource.",
                 "cost": {"Notes": game.resources.measures.resourcesPer},
                 "flavor": "Measure twice, cut once."};

  var newTask = new Task("Make First Measure", tooltip, checkFn, failFn, startFn);

  return newTask;
}

function firstSongTask() {
  var checkFn = function() {
    var totalResources = 0;
    var validResources = game.specialResources.songs.validResources;

    validResources.forEach(function(resource) {
      totalResources += game.player.resources[resource];
    });

    return totalResources >= game.specialResources.songs.resourcesPer;
  };

  var failFn = function() {
    appendToOutputContainer("You don't have enough material to make a song!");
  };

  var startFn = function(task) {
    openPopUp(populateSongPopUp);
  };

  var tooltip = {"description": "Create your first ever song! Unlocks a tier three resource.",
                 "cost": {"Tier Two Resources": game.specialResources.songs.resourcesPer},
                 "flavor": "You'll probably be embarassed by this one in a few years."};

  var newTask = new Task("Make First Song", tooltip, checkFn, failFn, startFn);

  return newTask;
}

function newSongTask() {
  var checkFn = function() {
    var totalResources = 0;
    var validResources = game.specialResources.songs.validResources;

    validResources.forEach(function(resource) {
      totalResources += game.player.resources[resource];
    });

    return totalResources >= game.specialResources.songs.resourcesPer;
  };

  var failFn = function() {
    appendToOutputContainer("You don't have enough material to make a song!");
  };

  var startFn = function(task) {
    openPopUp(populateSongPopUp);
  };

  var tooltip = {"description": "Create a new song!",
                 "cost": {"Tier Two Resources": game.specialResources.songs.resourcesPer},
                 "flavor": "Every new song is a new chance. Unless you're Nickelback. Then it's just the same chance over and over."};

  var newTask = new Task("Make New Song", tooltip, checkFn, failFn, startFn);

  return newTask;
}

function oddJobsTask(job) {
  var timeTaken = 60;
  var moneyReward = 10;

  var checkFn = function() {
    return true;
  };

  var startFn = function(task) {
    if (startActiveTask(task)) {
      removeTask(task.name);
    }
  };

  var finishFn = function() {
    addResource("money", moneyReward);
    appendToOutputContainer("After an hour of labor, you take home a measly " + moneyReward + " bucks.");
    stopActiveTask();

    if (game.player.resources.fame < 25)
      game.triggerFnSet.add(oddJobsEventTrigger);
  };

  var tooltip = {"description": "Do some odd jobs around the neighborhood. Rewards $10.",
                 "cost": {"Time": timeTaken},
                 "flavor": "Even the most famous of legends have humble beginnings."};

  var newTask = new Task(job, tooltip, checkFn, undefined, startFn, undefined, finishFn, timeTaken);

  return newTask;
}

function onlinePortfolioTask() {
  var requiredSamples = 5;

  var checkFn = function() {
    return game.player.resources.samples >= requiredSamples;
  }

  var failFn = function() {
    appendToOutputContainer("You haven't made enough samples to build a portfolio yet!");
  }

  var startFn = function(task) {
    removeResource("samples", requiredSamples);
    game.triggerFnSet.add(djPartyTrigger);
    appendToOutputContainer("You've completed your online portfolio. Now you just have to wait for the clients to pour in!");
    removeTask(task.name);
  };

  var tooltip = {"description": "Build an online portfolio containing some of your custom samples. Unlocks opportunities to play your music at small gatherings.",
                 "cost": {"Samples": requiredSamples},
                 "flavor": "Turns out the hardest part about becoming an artist is getting other people to like your music."};

  var newTask = new Task("Make Online Portfolio", tooltip, checkFn, failFn, startFn);

  return newTask;
}

function DJAtPartyTask(partyType) {
  var timeTaken = 180;
  var moneyReward = 50;
  var maxFameReward = 5;
  var xpReward = 50;

  var checkFn = function() {
    return true;
  };

  var startFn = function(task) {
    if (startActiveTask(task)) {
      removeTask(task.name);
    }
  };

  var finishFn = function() {
    addResource("fame", Math.ceil(Math.random() * maxFameReward));
    addResource("money", moneyReward);
    addXp("laptop", xpReward);
    appendToOutputContainer("After a few hours work at a party, you manage to make $" + moneyReward + "!");
    stopActiveTask();
    game.triggerFnSet.add(djPartyTrigger);
  };

  var tooltip = {"description": "An opportunity to DJ professionally at a party! Rewards up to " + maxFameReward + " Fame, $" + moneyReward + " and " + xpReward + " Laptop XP.",
                 "cost": {"Time": timeTaken},
                 "flavor": "Turns out, parties are a lot less fun when you're working."};

  var taskName = "DJ At " + partyType;
  var newTask = new Task(taskName, tooltip, checkFn, undefined, startFn, undefined, finishFn, timeTaken);

  return newTask;
}

function meetWithNightclubOwnersTask() {
  var requiredSamples = 30;

  var checkFn = function() {
    return game.player.resources.samples >= requiredSamples;
  }

  var failFn = function() {
    appendToOutputContainer("You need more samples if you want to make a good impression!");
  }

  var startFn = function(task) {
    removeResource("samples", requiredSamples);
    game.triggerFnSet.add(djNightclubEventTrigger);
    appendToOutputContainer("Several nightclub owners liked the samples you showed them!");
    removeTask(task.name);
  };

  var tooltip = {"description": "Meet with the owners of local nightclubs and demo some of your music. Unlocks opportunities to play your music at clubs.",
                 "cost": {"Samples": requiredSamples},
                 "flavor": "Nightclubs during the day are... weird."};

  var newTask = new Task("Meet With Nightclub Owners", tooltip, checkFn, failFn, startFn);

  return newTask;
}

function DJAtNightclubTask() {
  var timeTaken = 180;
  var moneyReward = 150;
  var xpReward = 150;

  var checkFn = function() {
    return true;
  };

  var startFn = function(task) {
    if (startActiveTask(task)) {
      removeTask(task.name);
    }
  };

  var finishFn = function() {
    addResource("fame", 10 + Math.ceil(Math.random() * 5));
    addResource("money", moneyReward);
    game.player.addXp("laptop", xpReward);
    appendToOutputContainer("You earn a solid $" + moneyReward + " DJing at a nightclub!");
    stopActiveTask();
    game.triggerFnSet.add(djNightclubEventTrigger);
  };

  var tooltip = {"description": "An opportunity to DJ professionally at a nightclub! Rewards 10-15 Fame, $" + moneyReward + " and " + xpReward + " Laptop XP.",
                 "cost": {"Time": timeTaken},
                 "flavor": "It's true - this IS their song and they HAVE to dance!"};

  var newTask = new Task("DJ At Nightclub", tooltip, checkFn, undefined, startFn, undefined, finishFn, timeTaken);

  return newTask;
}

function buyBeatBookTask() {
  var requiredMoney = 10;

  var checkFn = function() {
    return game.player.resources.money >= requiredMoney;
  };

  var failFn = function() {
    appendToOutputContainer("You don't have enough money to purchase a notebook!");
  };

  var startFn = function(task) {
    removeResource("money", requiredMoney);
    game.player.bonuses.laptop.passiveProgress++;
    removeTask(task.name);
  };

  var tooltip = {"description": "Purchase a notebook to write down ideas as they come to you. Permanently generates passive beat progress.",
                 "cost": {"Money": requiredMoney},
                 "flavor": "Some people like playing games. Others prefer when the game plays itself."};

  var newTask = new Task("Book Of Beats", tooltip, checkFn, failFn, startFn);

  return newTask;
}

function buyNewLaptopTask() {
  var requiredMoney = 500;

  var checkFn = function() {
    return game.player.resources.money >= requiredMoney;
  };

  var failFn = function() {
    appendToOutputContainer("You don't have enough money to purchase a new laptop!");
  };

  var startFn = function(task) {
    var beatProgress = document.getElementById('laptopBeatProgress');
    var progressTriggerFn = function () { addResource("beats") };

    game.resources.beats.clicksPer = Math.ceil(game.resources.beats.clicksPer * 0.75);
    removeResource("money", requiredMoney);
    game.instruments.laptop.level++;
    updateProgress(beatProgress, beatProgress.value, game.resources.beats.clicksPer, progressTriggerFn);
    removeTask(task.name);
  };

  var tooltip = {"description": "Purchase a new laptop. Reduces the required number of clicks per beat by 25%.",
                 "cost": {"Money": requiredMoney},
                 "flavor": "Your old one kept overheating because your beats are too hot."};

  var newTask = new Task("Buy New Laptop", tooltip, checkFn, failFn, startFn);

  return newTask;
}

function buyMicrophoneTask() {
  var requiredMoney = 1000;

  var checkFn = function() {
    return game.player.resources.money >= requiredMoney;
  };

  var failFn = function() {
    appendToOutputContainer("You don't have enough money to purchase a microphone!");
  };

  var startFn = function(task) {
    removeResource("money", requiredMoney);
    appendToOutputContainer("You purchase a microphone. Maybe your voice will add another element to your music.");
    document.getElementById('vocalTab').style.display = "inline";
    document.getElementById('vocalSkill').style.display = "inline";
    removeTask(task.name);
  };

  var tooltip = {"description": "Purchase a new microphone. Unlocks the vocals skill.",
                 "cost": {"Money": requiredMoney},
                 "flavor": "You could never really tell if you were good at singing or just bad at hearing."};

  var buyMicrophoneTask = new Task("Buy a Microphone", tooltip, checkFn, failFn, startFn);

  return newTask;
}

function buyKeyboardTask() {
  var requiredMoney = 1000;

  var checkFn = function() {
    return game.player.resources.money >= requiredMoney;
  };

  var failFn = function() {
    appendToOutputContainer("You don't have enough money to purchase a keyboard!");
  };

  var startFn = function(task) {
    removeResource("money", requiredMoney);
    appendToOutputContainer("You purchase a keyboard - a new skill to master.");
    document.getElementById('keyboardTab').style.display = "inline";
    document.getElementById('keyboardSkill').style.display = "inline";
    game.triggerFnSet.add(firstNoteTrigger);
    removeTask(task.name);
  };

  var tooltip = {"description": "Purchase a new keyboard. Unlocks the keyboard skill.",
                 "cost": {"Money": requiredMoney},
                 "flavor": "A keyboard is an electric piano. Not to be confused with a computer keyboard, which you'll actually be using to play this keyboard. Make sense?"};

  var newTask = new Task("Buy a Keyboard", tooltip, checkFn, failFn, startFn);

  return newTask;
}

function studyOnlineTask() {
  var timeTaken = 60;

  var checkFn = function() {
    return true;
  };

  var startFn = function(task) {
    task.tickCounter = 1;
    startActiveTask(task);
  };

  var tickFn = function() {
    if (game.activeTask.tickCounter >= 5) {
      addResource("beats");
      game.activeTask.tickCounter = 1;
    }
    else if (game.activeTask.tickCounter !== undefined) {
      game.activeTask.tickCounter++;
    }
    else {
      game.activeTask.tickCounter = 1;
    }
  };

  var finishFn = function() {
    stopActiveTask();
  };

  var tooltip = {"description": "Do some online studying to improve your musical skills. Generates 1 beat every 5 seconds. Repeatable.",
                 "cost": {"Time": timeTaken},
                 "flavor": "You came here to procrastinate, but you ended up studying."};

  var newTask = new Task("Study Music Online", tooltip, checkFn, undefined, startFn, tickFn, finishFn, timeTaken);

  return newTask;
}

function musicClassTask() {
  var timeTaken = 120;
  var requiredMoney = 100;

  var checkFn = function() {
    return game.player.resources.money >= requiredMoney;
  };

  var failFn = function() {
    appendToOutputContainer("You don't have enough money to take a class!");
  };

  var startFn = function(task) {
    task.tickCounter = 1;

    if (startActiveTask(task)) {
      removeResource("money", requiredMoney);
    }
  };

  var tickFn = function() {
    if (game.activeTask.tickCounter >= 2) {
      addResource("beats");
      game.activeTask.tickCounter = 1;
    }
    else if (game.activeTask.tickCounter !== undefined) {
      game.activeTask.tickCounter++;
    }
    else {
      game.activeTask.tickCounter = 1;
    }
  };

  var finishFn = function() {
    if (Math.random() <= 0.25) {
      appendToOutputContainer("Some friends from your music class invite you to a jam session!");
      makeTask(jamSessionTask);
    }

    stopActiveTask();
  };

  var tooltip = {"description": "Take a music class to further develop your musical skills. Generates 1 beat every 2 seconds. Repeatable.",
                 "cost": {"Money": requiredMoney,
                          "Time": timeTaken},
                 "flavor": "$" + requiredMoney + " per class? Why does the world hate students?"};

  var newTask = new Task("Take A Music Class", tooltip, checkFn, failFn, startFn, tickFn, finishFn, timeTaken);

  return newTask;
}

function jamSessionTask() {
  var timeTaken = 60;

  var checkFn = function() {
    return true;
  };

  var startFn = function(task) {
    task.tickCounter = 1;
    if (startActiveTask(task)) {
      removeTask(task);
    }
  };

  var tickFn = function() {
    if (game.activeTask.tickCounter >= 2) {
      addResource("beats");
      game.activeTask.tickCounter = 1;
    }
    else if (game.activeTask.tickCounter !== undefined) {
      game.activeTask.tickCounter++;
    }
    else {
      game.activeTask.tickCounter = 1;
    }
  };

  var finishFn = function() {
    stopActiveTask();
  };

  var tooltip = {"description": "Jam out at a friend's house. Generates 1 beat every 2 seconds.",
                 "cost": {"Time": timeTaken},
                 "flavor": "Friends are great to have. Especially when they produce free beats."};

  var newTask = new Task("Attend Jam Session", tooltip, checkFn, undefined, startFn, tickFn, finishFn, timeTaken);

  return newTask;
}

function experimentWithTempoTask() {
  var requiredBeats = 50;

  var checkFn = function() {
    return game.player.resources.beats >= requiredBeats;
  }

  var failFn = function() {
    appendToOutputContainer("You don't have enough beats to unlock the tempo selector!");
  }

  var startFn = function(task) {
    var tempoSelector = document.getElementById("tempoSelector");
    tempoSelector.style.display = "inline";
    removeResource("beats", requiredBeats);
    removeTask(task.name);
  };

  var tooltip = {"description": "Experiment with making beats at different tempos. Unlocks the tempo selector for your laptop.",
                 "cost": {"Beats": requiredBeats},
                 "flavor": "The ability to alter time itself, for the low cost of " + requiredBeats + " beats."};
  var newTask = new Task("Experiment With Tempo", tooltip, checkFn, failFn, startFn);

  return newTask;
}

function exploreSubgenreTask(requiredBeats) {
  var checkFn = function() {
    return game.player.resources.beats >= requiredBeats;
  }

  var failFn = function() {
    appendToOutputContainer("You don't have enough beats to unlock a sub-genre!");
  }

  var startFn = function(task) {
    openPopUp(populateGenrePopUp);
  };

  var finishFn = function(task) {
    removeResource("beats", requiredBeats);
    removeTask(task.name);
  }

  var tooltip = {"description": "Experiment with different sub-genres of electronic music. Unlocks a bonus effect of your choice for your laptop, improving beat production.",
                 "cost": {"Beats": requiredBeats},
                 "flavor": "You're not a real artist if people aren't arguing about what sub-sub-sub-genre your music is in."};
  var newTask = new Task("Explore A Sub-Genre", tooltip, checkFn, failFn, startFn, undefined, finishFn);

  return newTask;
}
