/*
  Contains all functionality for the task framework
*/

/*
  ---- Task Implementation -----
*/

function addTask(context) {
  /*
    Adds a new task context to the game object. Tasks are not to be stored in
    their entirety because they contain functions and we want to keep the game
    object pure.
  */
  game.player.tasks.push(context);
}

function getTask(taskName) {
  /*
    Given a task name, return the associated context in the task list
  */
  var index = game.player.tasks.findIndex(context => context.taskName === taskName);
  return game.player.tasks[index];
}

function removeTask(taskName) {
  /*
    Given a task name, remove the associated context from the task list
  */
  var index = game.player.tasks.findIndex(context => context.taskName === taskName);
  if (index > -1)
    game.player.tasks.splice(index, 1);
}

function getTaskDetails(context) {
  /*
    A task context stores the associated task function ID, task name, and
    any necessary paramameters for the task.

    This function runs the task function for a given context and returns
    additional task information that is required to actually do the task
    (ie. checkFns, startFns, tickFns, finishFns, timeToComplete, etc.).
  */
  var taskFn = window[context.taskId];
  return taskFn(context);
}

function doTask(taskName) {
  /*
    Given a taskName, look up the associated task and attempt to start it.
    StartFns will execute if the following applies:
      1. All checkFns return true.
      2. The task was successfully set as the active task, when applicable.
      3. The task has startFns defined.

    If the task is not repeatable and has successfully started, remove it from
    the task list.
  */
  var context = getTask(taskName);
  var task = getTaskDetails(context);

  if (task.checkFns == undefined || runCheckFns(task)) {
    if (task.timeToComplete == undefined || startActiveTask(context)) {
      if (task.startFns !== undefined)
        task.startFns.forEach(function(startFn) {
          startFn()
        });

      if (!task.repeatable)
        removeTask(taskName);

      hideTooltip();
    }
  }

  updateView();
}

function runCheckFns(task) {
  /*
    Run all of the checkFns for a given task. If any of them return false,
    return false. Otherwise returns true.
  */
  for (var i = 0; i < task.checkFns.length; i++) {
    var checkFn = task.checkFns[i];
    if (!checkFn())
      return false;
  }

  return true;
}

function startActiveTask(context) {
  /*
    Set the given task context as the active task.
    Returns false if there is already an active task and true otherwise.
  */
  if (game.player.activeTask == undefined) {
    var task = getTaskDetails(context);
    var container = document.getElementById('taskProgressContainer');
    var label = document.getElementById('taskLabel');
    var progress = document.getElementById('taskProgress');

    game.player.activeTask = context;
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
  /*
    Update the progress bar for the active task every natural tick.
    If the task has tickFns, execute them.
    If the task has completed, execute its finishFns and stop the active task.
  */
  if (game.player.activeTask !== undefined) {
    var task = getTaskDetails(game.player.activeTask);
    var finishFns = task.finishFns;
    var progress = document.getElementById('taskProgress');

    if (task.tickFns !== undefined)
      task.tickFns.forEach(function(tickFn) {
        tickFn()
      });

    if (finishFns !== undefined)
      finishFns.push(stopActiveTask);
    else
      finishFns = [stopActiveTask];

    updateProgress(progress, (progress.value + 1), task.timeToComplete, finishFns);
  }
}

function stopActiveTask() {
  // Stop the currently active task
  var container = document.getElementById('taskProgressContainer');

  game.player.activeTask = undefined;
  container.style.display = "none";
}

function cancelTask() {
  /*
    Cancels the currently active task.
    If the task was removed from the task list, reinsert it.
  */
  if (getTask(game.player.activeTask.taskName) == undefined)
    game.player.tasks.push(game.player.activeTask);

  stopActiveTask();
  updateTasks();
}

/*
  ---- Generic Task Functions -----
*/

function hasEnoughResources(resource, numRequired) {
  /*
    CheckFn to ensure the player has enough of the given resource.
  */
  if (game.player.resources[resource] >= numRequired) {
    return true;
  } else {
    appendToOutputContainer("You don't have enough " + resource + "!");
    return false;
  }
}

function hasEnoughResourcesForSong() {
  /*
    CheckFn to ensure the player has enough resources to create a song.
    Songs are special because they can be created using any tier two resources.
  */
  var totalResources = 0;
  var validResources = game.specialResources.songs.validResources;

  validResources.forEach(function(resource) {
    totalResources += game.player.resources[resource];
  });

  if (totalResources >= game.specialResources.songs.resourcesPer) {
    return true;
  } else {
    appendToOutputContainer("You don't have enough material to create a song!");
    return false;
  }
};

function addResourcesPerTick(resource, numResource, numTicks) {
  /*
    TickFn which rewards the player with the given number of the given resource
    after the given number of natural ticks.
  */
  if (game.player.activeTask.tickCounter >= numTicks) {
    addResource(resource, numResource);
    game.player.activeTask.tickCounter = 1;
  } else if (game.player.activeTask.tickCounter !== undefined) {
    game.player.activeTask.tickCounter++;
  } else {
    game.player.activeTask.tickCounter = 1;
  }
}

/* ------ TASKS ------
There are two types of Tasks:

1. Upgrades - These are tasks that execute and complete instantly, usually providing some kind of immediate bonus.
2. Active Tasks - These tasks complete over time. The Player can only work on one active task at a time.

All tasks should take in a 'context' object as a parameter.

---- Structure of Tasks -----

function exampleTask(context) {
  // A list of functions returning true or false. All must return true for the task to start.
  var checkFns = [...];

  // A list of functions to execute immediately after clicking on a task.
  var startFns = [...];

  // A list of functions to execute every natural tick, for timeToComplete ticks.
  var tickFns = [...];

  // A list of functions to execute once the task has finished (ie. timeToComplete ticks have passed).
  // FinishFns will never be called for non-Active Tasks unless called manually.
  var finishFns = [...];

  var tooltip = { "description": "This is an example task",
                 "cost": {"Resource1": "Amount1",
                          "Resource2": "Amount2"},
                 "flavor": "Try to come up with something clever."};

  return {
    name: context.taskName,
    checkFns: checkFns,
    startFns: startFns,
    tickFns: tickFns,
    finishFns: finishFns,
    tooltip: tooltip,
    timeToComplete: context.timeToComplete // if timeToComplete is defined, this will be an Active Task
  };
}

------- Flow to Tasks -------

checkFn --> (if true) --> startFn --> if timeToComplete !== undefined --> tickFn (per natural tick) --> after timeToComplete ticks --> finishFn
*/

/*
  ---- Resource Related Tasks -----
*/

function cheatTask(context) {
  /*
    Use this to debug whatever you want
  */
  var startFns = [
    //anonymize(addResource, ["money", 10]),
    anonymize(addResource, ["beats", 10]),
    //anonymize(addResource, ["notes", 1000])
  ];

  var tooltip = {
    "description": "Gives free beats and money. Cheater.",
    "cost": {
      "No Cost": ""
    },
    "flavor": "Cheaters never prosper. Except for right now."
  };

  return {
    name: context.taskName,
    startFns: startFns,
    tooltip: tooltip,
    repeatable: true
  };
}

function unlockResourceTask(context) {
  /*
    This task is used to unlock the Tier Two resources. A Tier Two resource is
    any resource that is composed of basic resources (ie. beats, notes, etc.)
    The resource to unlock should be specified in the context.
  */
  var requiredResource = game.resources[context.resource].requiredResource;
  // Capitalized version of the required resource for the tooltip
  var tooltipResource = requiredResource.charAt(0).toUpperCase() + requiredResource.slice(1);

  var checkFns = [
    anonymize(hasEnoughResources, [requiredResource, game.resources[context.resource].resourcesPer])
  ];

  var startFns = [
    anonymize(addResource, [context.resource]),
    anonymize(appendToOutputContainer, [context.outputText]),
    anonymize(showUiElement, [context.resource, "block"])
  ];

  var tooltip = {
    "description": "Unlocks a new tier two resource.",
    "cost": {},
    "flavor": context.flavor
  };

  tooltip.cost[tooltipResource] = game.resources[context.resource].resourcesPer;

  return {
    name: context.taskName,
    checkFns: checkFns,
    startFns: startFns,
    tooltip: tooltip
  };
}

function newSongTask(context) {
  /*
    If the player has enough 'Tier Two' resources (ie. resources that are made
    from basic resources, like beats or notes), they can create a Song.

    Song details are gathered in a pop up panel, which is created when this task
    is started.
  */
  var checkFns = [hasEnoughResourcesForSong];
  var startFns = [anonymize(openPopUp, [populateSongPopUp])];

  var tooltip = {
    "description": context.description,
    "cost": {
      "Tier Two Resources": game.specialResources.songs.resourcesPer
    },
    "flavor": context.flavor
  };

  return {
    name: context.taskName,
    checkFns: checkFns,
    startFns: startFns,
    tooltip: tooltip
  };
}

/*
  ---- Job Related Tasks -----
*/

function oddJobsTask(context) {
  /*
    Odd Jobs are the starting job of the player. This task is simply a way to
    earn money early on and is replaced with other opportunities as the player
    increases their skill levels.
  */
  var timeToComplete = 60;
  var moneyReward = 10;

  var finishFns = [
    anonymize(addResource, ["money", moneyReward]),
    anonymize(appendToOutputContainer, ["After an hour of labor, you take home a measly " + moneyReward + " bucks."]),
    anonymize(addTrigger, [oddJobsEventTrigger])
  ];

  var tooltip = {
    "description": "Rewards $10.",
    "cost": {
      "Time": timeToComplete
    },
    "flavor": "Even the most famous of legends have humble beginnings."
  };

  return {
    name: context.taskName,
    finishFns: finishFns,
    timeToComplete: timeToComplete,
    tooltip: tooltip
  };
}

function advanceDJCareerTask(context) {
  /*
    As a player increases their laptop skill level, they unlock the ability to
    advance their career as a DJ. This function creates a series of tasks,
    depending on the context, which unlock new event triggers for the DJ career.
  */
  var eventTrigger;

  switch (context.level) {
    case 1:
      eventTrigger = freelanceDJEventTrigger;
      break;
    case 2:
      eventTrigger = nightclubDJEventTrigger;
      break;
    default:
      break;
  };

  var checkFns = [
    anonymize(hasEnoughResources, ["samples", context.requiredSamples])
  ];

  var startFns = [
    anonymize(removeResource, ["samples", context.requiredSamples]),
    anonymize(addTrigger, [eventTrigger]),
    anonymize(appendToOutputContainer, [context.outputText])
  ];

  var tooltip = {
    "description": context.description,
    "cost": {
      "Samples": context.requiredSamples
    },
    "flavor": context.flavor
  };

  return {
    name: context.taskName,
    checkFns: checkFns,
    startFns: startFns,
    tooltip: tooltip
  };
}

function workAsDJTask(context) {
  /*
    This task becomes available when a DJ Event is triggered. There are various
    levels of DJ work available. Rewards Laptop XP, Money, and Fame and requires
    timeToComplete depending on the context.

    On completion, reinsert the given level of event trigger to the trigger set.
  */
  var eventTrigger;

  switch (context.level) {
    case 1:
      eventTrigger = freelanceDJEventTrigger;
      break;
    case 2:
      eventTrigger = nightclubDJEventTrigger;
      break;
    default:
      break;
  };

  var finishFns = [
    anonymize(addXp, ["laptop", context.xpReward]),
    anonymize(addResource, ["money", context.moneyReward]),
    anonymize(addResource, ["fame", context.fameReward]),
    anonymize(appendToOutputContainer, [context.outputText]),
    anonymize(addTrigger, [eventTrigger])
  ];

  var tooltip = {
    "description": "Rewards " + context.fameReward + " Fame, $" + context.moneyReward + " and " + context.xpReward + " Laptop XP.",
    "cost": {
      "Time": context.timeToComplete
    },
    "flavor": context.flavor
  };

  return {
    name: context.taskName,
    finishFns: finishFns,
    tooltip: tooltip,
    timeToComplete: context.timeToComplete
  };
}

/*
  ---- Study Related Tasks -----
*/

function practiceDJTask(context) {
  /*
    This is a generic task for passive beat production. A configurable number of
    beats is rewarded after every configurable number of ticks.
    This process repeats for the specified timeToComplete, before rewarding
    Laptop XP upon completion.
  */
  var unit = " beat";

  if (context.beatsPerInterval > 1)
    unit = " beats";

  var tickFns = [
    anonymize(addResourcesPerTick, ["beats", context.beatsPerInterval, context.interval])
  ];

  var finishFns = [
    anonymize(addXp, ["laptop", context.xpReward])
  ];

  var tooltip = {
    "description": "Generates " + context.beatsPerInterval + unit + " every " + context.interval + " seconds. Rewards " + context.xpReward + " Laptop XP on completion. Repeatable.",
    "cost": {
      "Time": context.timeToComplete
    },
    "flavor": context.flavor
  };

  return {
    name: context.taskName,
    tickFns: tickFns,
    finishFns: finishFns,
    tooltip: tooltip,
    timeToComplete: context.timeToComplete,
    repeatable: context.repeatable
  };
}

/*
  ---- Other Upgrades -----
*/

function buyBeatBookTask(context) {
  /*
    This task is meant to be the first source of passive beat progress available
    to the player. Other tasks will add to the amount of passive beat progress
    they have access to.
  */
  var requiredMoney = 10;

  var checkFns = [
    anonymize(hasEnoughResources, ["money", requiredMoney])
  ];

  var startFns = [
    anonymize(removeResource, ["money", requiredMoney]),
    function() {
      game.player.bonuses.laptop.passiveProgress++;
    }
  ];

  var tooltip = {
    "description": "Purchase a notebook to write down ideas as they come to you. Permanently generates passive beat progress.",
    "cost": {
      "Money": requiredMoney
    },
    "flavor": "Some people like playing games. Others prefer when the game plays itself."
  };

  return {
    name: context.taskName,
    checkFns: checkFns,
    startFns: startFns,
    tooltip: tooltip
  };
}

function unlockLaptopTempoTask(context) {
  var requiredBeats = 50;

  var checkFns = [
    anonymize(hasEnoughResources, ["beats", requiredBeats])
  ];

  var startFns = [
    anonymize(removeResource, ["beats", requiredBeats]),
    anonymize(showUiElement, ["tempoSelector", "inline"])
  ];

  var tooltip = {
    "description": "Unlocks the tempo selector for your laptop.",
    "cost": {
      "Beats": requiredBeats
    },
    "flavor": "The ability to alter time itself, for the low cost of " + requiredBeats + " beats."
  };

  return {
    name: context.taskName,
    checkFns: checkFns,
    startFns: startFns,
    tooltip: tooltip,
  };
}

function exploreSubgenreTask(context) {
  var checkFns = [
    anonymize(hasEnoughResources, ["beats", context.requiredBeats])
  ];

  var startFns = [
    anonymize(openPopUp, [populateGenrePopUp])
  ];

  var finishFns = [
    anonymize(removeResource, ["beats", context.requiredBeats])
  ];

  var tooltip = {
    "description": "Experiment with different sub-genres of electronic music. Unlocks a bonus effect of your choice for your laptop, improving beat production.",
    "cost": {
      "Beats": context.requiredBeats
    },
    "flavor": "You're not a real artist if people aren't arguing about what sub-sub-sub-genre your music is in."
  };

  return {
    name: context.taskName,
    checkFns: checkFns,
    startFns: startFns,
    finishFns: finishFns,
    tooltip: tooltip,
  };
}

function upgradeLaptopTask(context) {
  /*
    This task reduces the amount of clicks required per beat. It can be made
    more generic, but for now, it will always apply a 25% reduction (rounded up).
  */
  var checkFns = [
    anonymize(hasEnoughResources, ["money", context.requiredMoney])
  ];

  var applyLaptopBonus = function() {
    game.player.bonuses.laptop.reqClicksMod *= 0.75;
    game.instruments.laptop.level++;

    var beatProgress = document.getElementById('laptopBeatProgress');
    var requiredProgress = Math.ceil(game.resources.beats.clicksPer * game.player.bonuses.laptop.reqClicksMod);
    updateProgress(beatProgress, beatProgress.value, requiredProgress, anonymize(addResource, ["beats"]));
  };

  var startFns = [
    anonymize(removeResource, ["money", context.requiredMoney]),
    applyLaptopBonus
  ];

  var tooltip = {
    "description": "Reduces the required number of clicks per beat by 25%.",
    "cost": {
      "Money": context.requiredMoney
    },
    "flavor": "Your old one kept overheating because your beats are too hot."
  };

  return {
    name: context.taskName,
    checkFns: checkFns,
    startFns: startFns,
    tooltip: tooltip
  };
}

function newInstrumentTask(context) {
  /*
    This task unlocks a new instrument for the player.
    TODO: make generic using a pop up box.
  */
  var requiredMoney = 1000;
  var outputText = "You purchase a keyboard. Maybe it will add another element to your music.";
  // keeping this here because i don't want to forget it
  var vocalFlavor = "You could never really tell if you were good at singing or just bad at hearing.";

  var checkFns = [
    anonymize(hasEnoughResources, ["money", context.requiredMoney])
  ];

  var startFns = [
    anonymize(removeResource, ["money", context.requiredMoney]),
    anonymize(appendToOutputContainer, [outputText]),
    anonymize(showUiElement, ["keyboardTab", "inline"]),
    anonymize(showUiElement, ["keyboardSkill", "inline"]),
  ];

  var tooltip = {
    "description": "Unlocks the keyboard skill.",
    "cost": {
      "Money": context.requiredMoney
    },
    "flavor": "A keyboard is an digital piano. Not to be confused with a computer keyboard, which you'll actually be using to play this keyboard."
  };

  return {
    name: context.taskName,
    checkFns: checkFns,
    startFns: startFns,
    tooltip: tooltip
  };
}
