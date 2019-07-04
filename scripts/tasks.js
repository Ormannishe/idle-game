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

function getContext(taskName) {
  /*
    Given a task name, return the associated context in the task list.

    A task context stores the associated task function ID, task name, and
    any necessary paramameters for the task. To retrieve a proper task in its
    entirety, use getTask or getTaskFromContext.
  */
  var index = game.player.tasks.findIndex(context => context.taskName === taskName);
  return game.player.tasks[index];
}

function getContextFromTask(task) {
  /*
    Given a proper task, return its associated context
  */
  return getContext(task.name);
}

function getTask(taskName) {
  /*
    Given a task name, retrieve the associated context in the task list and
    return the task in its entirety.

    To retrieve a task fully, you must execute the task function for a given
    context, passing the context as an arguement. A proper task returns
    additional task information that is required to actually do the task
    (ie. checkFns, startFns, tickFns, finishFns, timeToComplete, etc.).
  */
  var context = getContext(taskName);

  if (context !== undefined) {
    var taskFn = window[context.taskId];
    return taskFn(context);
  }
}

function getTaskFromContext(context) {
  /*
    Returns a proper task, similar to the getTask function, but takes in an
    already fetched context object.
  */
  var taskFn = window[context.taskId];
  return taskFn(context);
}

function removeTask(taskName) {
  /*
    Given a task name, remove the associated context from the task list
  */
  var index = game.player.tasks.findIndex(context => context.taskName === taskName);
  if (index > -1)
    game.player.tasks.splice(index, 1);
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
  var task = getTask(taskName);

  if (task.checkFns == undefined || checkTask(task, true)) {
    if (task.timeToComplete == undefined) {
      startTask(task);
      // If a task does not have any tickFns or finishFns, then it is done
      if (task.tickFns == undefined && task.finishFns == undefined)
        finishTask(task);
    }
    else {
      if (startActiveTask(task))
        startTask(task);
    }
  }

  updateView();
}

function checkTask(task, outputOnFailure) {
  /*
    Run all of the checkFns for a given task. If any of them return false,
    return false. Otherwise returns true.

    Optional arguement 'outputOnFailure' can be set to true to log the reason
    for failure.
  */
  for (var i = 0; i < task.checkFns.length; i++) {
    var checkFn = task.checkFns[i];
    if (!checkFn(outputOnFailure))
      return false;
  }

  return true;
}

function startTask(task) {
  /*
    Run all of the startFns for a given task before removing the task from the
    task list. If the task cannot be started (ie. there is already an active
    task), returns false.

    If a task is repeatable, do not remove it from the task list.
  */
  if (task.startFns !== undefined)
    task.startFns.forEach(function(startFn) {
      startFn();
    });

  if (!task.repeatable)
    removeTask(task.name);

  hideTooltip();
}

function finishTask(task) {
  /*
    Run all of the finishFns for a given task, before adding it to the
    player.completedTasks array (if it is not already present).
  */

  if (task.finishFns !== undefined) {
    task.finishFns.forEach(function(finishFn) {
      finishFn();
    });
  }

  if (game.player.completedTasks.indexOf(task.name) == -1)
    game.player.completedTasks.push(task.name);
}

function startActiveTask(task) {
  /*
    Set the given task context as the active task.
    Returns false if there is already an active task and true otherwise.
  */
  if (game.player.activeTask == undefined) {
    var context = getContextFromTask(task);
    var label = document.getElementById('taskLabel');
    var progress = document.getElementById('taskProgress');

    game.player.activeTask = context;
    label.innerHTML = task.name;
    game.player.activeTask.timeInProgress = 0;
    progress.value = 0;
    progress.max = task.timeToComplete;
    showUiElement("taskProgressContainer", "inline-block");

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
    game.player.activeTask.timeInProgress++;

    var task = getTaskFromContext(game.player.activeTask);
    var progress = document.getElementById('taskProgress');

    if (task.tickFns !== undefined)
      task.tickFns.forEach(function(tickFn) {
        tickFn()
      });

    if (game.player.activeTask.timeInProgress >= task.timeToComplete)
      task.finishFns.push(stopActiveTask);

    updateProgress(progress, game.player.activeTask.timeInProgress, task.timeToComplete, partial(finishTask, task));
  }
}

function stopActiveTask() {
  // Stop the currently active task
  game.player.activeTask = undefined;
  showUiElement("taskProgressContainer", "none");
}

function cancelTask() {
  /*
    Cancels the currently active task.
    If the task was removed from the task list, reinsert it.
  */
  if (getContext(game.player.activeTask.taskName) == undefined)
    game.player.tasks.push(game.player.activeTask);

  stopActiveTask();
  updateTasks();
}

/*
  ---- Generic Task Functions -----
*/

function hasEnoughResources(resource, numRequired, outputOnFailure) {
  /*
    CheckFn to ensure the player has enough of the given resource.

    Optional arguement 'outputOnFailure' can be set to true to log the reason
    for failure.
  */
  if (game.player.resources[resource].amount >= numRequired) {
    return true;
  } else {
    if (outputOnFailure)
      appendToOutputContainer("You don't have enough " + resource + "!");
    return false;
  }
}

function hasEnoughResourcesForSong(outputOnFailure) {
  /*
    CheckFn to ensure the player has enough resources to create a song.
    Songs are special because they can be created using any tier two resources.

    Optional arguement 'outputOnFailure' can be set to true to log the reason
    for failure.
  */
  var totalResources = 0;
  var validResources = game.specialResources.songs.validResources;

  validResources.forEach(function(resource) {
    totalResources += game.player.resources[resource].amount;
  });

  if (totalResources >= game.specialResources.songs.resourcesPer) {
    return true;
  } else {
    if (outputOnFailure)
      appendToOutputContainer("You don't have enough material to create a song!");
    return false;
  }
};

function addResourcesPerTick(resource, numResource, numTicks) {
  /*
    TickFn which rewards the player with the given number of the given resource
    after the given number of natural ticks.
  */
  if (game.player.activeTask.timeInProgress % numTicks == 0) {
    addResource(resource, numResource);
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

checkFns --> (if true) --> startFns --> if timeToComplete !== undefined --> tickFns (per natural tick) --> after timeToComplete ticks --> finishFns
*/

/*
  ---- Resource Related Tasks -----
*/

function cheatTask(context) {
  /*
    Use this to debug whatever you want
  */
  var startFns = [
    partial(addResource, "money", 10),
    partial(addResource, "beats", 10),
    //partial(addResource, "notes", 1000)
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

function newGameTask(context) {
  /*
    Use this wipe your save data
  */
  var startFns = [
    newGame
  ];

  var tooltip = {
    "description": "Start a New Game.",
    "cost": {
      "No Cost": ""
    },
    "flavor": "Rebirth."
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
  var outputText;
  var flavor;

  switch(context.resource) {
    case "samples":
      outputText = "You've created your first musical sample! Your eyes glow with pride as you take one more step toward your destiny.";
      flavor = "Free samples are always great. These samples are okay too.";
      break;
    case "measures":
      outputText = "You've created your first measure!";
      flavor = "Measure twice, cut once.";
      break;
    default:
      return null;
  }

  var checkFns = [
    partial(hasEnoughResources, requiredResource, game.resources[context.resource].resourcesPer)
  ];

  var startFns = [
    partial(addResource, context.resource),
    partial(appendToOutputContainer, outputText),
    partial(showUiElement, context.resource, "block")
  ];

  var tooltip = {
    "description": "Unlocks a new tier two resource.",
    "cost": {},
    "flavor": flavor
  };

  tooltip.cost[capitalize(context.resource)] = game.resources[context.resource].resourcesPer;

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
  var description;
  var flavor;
  var checkFns = [hasEnoughResourcesForSong];
  var startFns = [partial(openPopUp, populateSongPopUp)];
  var finishFns;

  if (context.taskName == "Make First Song") {
    var newContext = {
      taskId: "newSongTask",
      taskName: "Make New Song"
    };

    finishFns = [
      partial(showUiElement, "songsTab", "inline"),
      partial(removeTask, "Make First Song"),
      partial(addTask, newContext)
    ];

    description = "Unlocks a new tier three resource.";
    flavor = "You'll probably be embarassed by this one in a few years.";
  }
  else {
    description = "Create a new song!";
    flavor = "Every song is a new opportunity. Unless you're Nickleback. Then it's kind of just the same every time.";
  }

  var tooltip = {
    "description": description,
    "cost": {
      "Tier Two Resources": game.specialResources.songs.resourcesPer
    },
    "flavor": flavor
  };

  return {
    name: context.taskName,
    checkFns: checkFns,
    startFns: startFns,
    finishFns: finishFns,
    tooltip: tooltip,
    repeatable: true
  };
}

/*
  ---- Study Tasks -----
*/

function genericStudyTask(context) {
  /*
    This is a generic task for passive resource production. A number of resources
    is rewarded after every number of ticks, depending on the level of study,
    provided in the context.
    This process repeats for the specified timeToComplete, before rewarding the
    appropriate type of XP upon completion.
  */
  var interval;
  var resourcesPerInterval;
  var xpReward;
  var timeToComplete;
  var flavor;
  var instrument = game.resources[context.resource].instrument;

  switch (context.level) {
    case 1:
      interval = 10;
      resourcesPerInterval = 1;
      xpReward = 20
      timeToComplete = 60;
      flavor = "Practice makes perfect, but the skill levels have no cap so...";
      break;
    case 2:
      interval = 5;
      resourcesPerInterval = 1;
      xpReward = 40
      timeToComplete = 120;
      flavor = "If you're procrastinating studying right now, this doesn't count.";
      break;
    default:
      return null;
  }

  xpReward = Math.round(xpReward * game.player.studies[instrument].xpMod);

  var tickFns = [
    partial(addResourcesPerTick, context.resource, resourcesPerInterval, interval)
  ];

  var finishFns = [
    partial(addXp, instrument, xpReward)
  ];

  var tooltip = {
    "description": "Generates " + resourcesPerInterval + " " + context.resource + " every " + interval + " seconds. Rewards " + xpReward + " " + instrument + " XP on completion. Repeatable.",
    "cost": {
      "Time": timeToComplete
    },
    "flavor": flavor
  };

  return {
    name: context.taskName,
    tickFns: tickFns,
    finishFns: finishFns,
    tooltip: tooltip,
    timeToComplete: timeToComplete,
    repeatable: true
  };
}

function upgradeStudyTask(context) {
  // Increases XP gains from Studying DJing by 10%
  // TODO: Make generic
  var requiredBeats;
  var studyType;
  var description;

  switch(context.level) {
    case 1:
      requiredBeats = 50;
      studyType = "practice";
      description = "Increases XP Gains from Practicing DJing by 10%";
      break;
    case 2:
      requiredBeats = 500;
      studyType = "studyOnline";
      description = "Increases XP Gains from Studying DJing Online by 10%";
      break;
    default:
      return null;
  }

  var checkFns = [
    partial(hasEnoughResources, "beats", requiredBeats)
  ];

  var startFns = [
    partial(removeResource, "beats", requiredBeats),
    function() { game.player.studies.laptop.xpMod += 0.1; }
  ]

  var tooltip = {
    "description": description,
    "cost": {
      "Beats": requiredBeats
    },
    "flavor": "In order to properly learn a thing, you first must learn to learn."
  };

  return {
    name: context.taskName,
    checkFns: checkFns,
    startFns: startFns,
    tooltip: tooltip
  };
}


/*
  ---- Job Tasks -----
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
    partial(addResource, "money", moneyReward),
    partial(appendToOutputContainer, "After an hour of labor, you take home a measly " + moneyReward + " bucks."),
    partial(addTrigger, oddJobsEventTrigger)
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

    Advancing your career typically requires a certain level of Fame (which is
    not consumed upon completion) and a number of Samples.
  */

  var requiredFame;
  var requiredSamples;
  var outputText;
  var description;
  var flavor;
  var eventTrigger;

  switch (context.level) {
    case 1:
      requiredFame = 0;
      requiredSamples = 5;
      outputText = "You've completed your online portfolio. Soon, your first clients will reach out to you!";
      description = "Become a Freelance DJ, unlocking opportunities to play at small gatherings.";
      flavor = "Turns out the hardest part about becoming an artist is getting other people to like your music.";
      eventTrigger = freelanceDJEventTrigger;
      break;
    case 2:
      requiredFame = 50;
      requiredSamples = 30;
      outputText = "Many of the nightclub owners liked the samples you showed them!";
      description = "Unlocks more lucrative opportunities to DJ at nightclubs. Requires 50 Fame.";
      flavor = "Nightclubs during the day are... strange.";
      eventTrigger = nightclubDJEventTrigger;
      break;
    default:
      return null;
  };

  var checkFns = [
    partial(hasEnoughResources, "fame", requiredFame),
    partial(hasEnoughResources, "samples", requiredSamples)
  ];

  var startFns = [
    partial(removeResource, "samples", requiredSamples),
    partial(addTrigger, eventTrigger),
    partial(appendToOutputContainer, outputText)
  ];

  var tooltip = {
    "description": description,
    "cost": {
      "Samples": requiredSamples
    },
    "flavor": flavor
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

    On completion, reinsert the given level of event trigger to the triggers list.
  */
  var xpReward;
  var moneyReward;
  var fameReward;
  var timeToComplete;
  var outputText;
  var flavor;
  var eventTrigger;

  switch (context.level) {
    case 1:
      xpReward = 50;
      moneyReward = 50;
      fameReward = 5;
      timeToComplete = 180;
      outputText = "After a few hours work at a " + context.djEvent.toLowerCase() + ", you manage to make $50!";
      flavor = "Turns out, parties are a lot less fun when you're working.";
      eventTrigger = freelanceDJEventTrigger;
      break;
    case 2:
      xpReward = 250;
      moneyReward = 250;
      fameReward = 30;
      timeToComplete = 180;
      outputText = "After a crazy night at a club, you manage to make a solid $250!";
      flavor = "'This isss myyy sooooooooong!' - That White Girl";
      eventTrigger = nightclubDJEventTrigger;
      break;
    default:
      return null;
  };

  moneyReward = Math.round(moneyReward * game.player.jobs.laptop.moneyMod);

  var finishFns = [
    partial(addXp, "laptop", xpReward),
    partial(addResource, "money", moneyReward),
    partial(addResource, "fame", fameReward),
    partial(appendToOutputContainer, outputText),
    partial(addTrigger, eventTrigger)
  ];

  var tooltip = {
    "description": "Rewards " + fameReward + " Fame, $" + moneyReward + " and " + xpReward + " Laptop XP.",
    "cost": {
      "Time": timeToComplete
    },
    "flavor": flavor
  };

  return {
    name: context.taskName,
    finishFns: finishFns,
    tooltip: tooltip,
    timeToComplete: timeToComplete
  };
}

function upgradeEventChanceTask(context) {
  /*
    Increases the player's chance of recieving a Job opportunity by 20%.
  */

  switch(context.level) {
    case 1:
      context.requiredResource = 100;
      context.flavor = "Come up with something clever."; // TODO
      break;
    case 2:
      context.requiredResource = 1000;
      context.flavor = "Come up with something clever."; // TODO
      break;
    default:
      return null;
  }

  switch(context.instrument) {
    case "laptop":
      context.jobType = "DJ";
      break;
    default:
      return null;
  }

  var reduceProcTime = function() {
    game.player.jobs[context.instrument].procMod -= 0.2;
  }

  var checkFns = [
    partial(hasEnoughResources, "money", context.requiredResource)
  ];

  var startFns = [
    reduceProcTime,
    partial(removeResource, "money", context.requiredResource)
  ];

  var tooltip = {
    "description": "Increases your chance of getting " + context.jobType + " contracts by 20%.",
    "cost": {
      "Money": context.requiredResource
    },
    "flavor": context.flavor
  };

  return {
    name: context.taskName,
    checkFns: checkFns,
    startFns: startFns,
    tooltip: tooltip,
  };
}

function upgradeJobChargeTask(context) {
  // Increases the amount of money awarded for completing jobs by a percentage

  switch(context.level) {
    case 1:
      context.requiredResource = 5;
      context.flavor = "Come up with something clever."; // TODO
      break;
    case 2:
      context.requiredResource = 50;
      context.flavor = "Come up with something clever."; // TODO
      break;
    default:
      return null;
  }

  switch(context.instrument) {
    case "laptop":
      context.resource = "samples";
      context.jobType = "DJ";
      break;
    default:
      return null;
  }

  var reduceProcTime = function() {
    game.player.jobs[context.instrument].moneyMod += 0.2;
  }

  var checkFns = [
    partial(hasEnoughResources, context.resource, context.requiredResource)
  ];

  var startFns = [
    reduceProcTime,
    partial(removeResource, context.resource, context.requiredResource)
  ];

  var tooltip = {
    "description": "Increases income from " + context.jobType + " contracts by 20%.",
    "cost": {
      "Money": context.requiredResource
    },
    "flavor": context.flavor
  };

  return {
    name: context.taskName,
    checkFns: checkFns,
    startFns: startFns,
    tooltip: tooltip,
  };
}

/*
  Instrument Upgrades
*/

function upgradeLaptopTask(context) {
  /*
    Generic task for upgrading the laptop instrument. Upgrading the laptop
    reduces the number of clicks required to make a beat. Reduction amount and
    cost are dependant on the level of the instrument.
  */
  var requiredMoney;
  var clickModifier;
  var flavor;

  switch (context.level) {
    case 1:
      requiredMoney = 100;
      clickModifier = 0.9;
      flavor = "Couldn't you have just pirated this?";
      break;
    case 2:
      requiredMoney = 1000;
      clickModifier = 0.9;
      flavor = "Your old one kept overheating because your beats are too hot.";
      break;
    default:
      return null;
  }

  var applyLaptopBonus = function() {
    game.player.instruments.laptop.reqClicksMod *= clickModifier;
    game.player.instruments.laptop.level++;

    var beatProgress = document.getElementById('laptopBeatProgress');
    var requiredProgress = Math.ceil(game.resources.beats.clicksPer * game.player.instruments.laptop.reqClicksMod);
    updateProgress(beatProgress, beatProgress.value, requiredProgress, partial(addResource, "beats"));
  };

  var checkFns = [
    partial(hasEnoughResources, "money", requiredMoney)
  ];

  var startFns = [
    partial(removeResource, "money", requiredMoney),
    applyLaptopBonus
  ];

  var tooltip = {
    "description": "Reduces the required number of clicks per beat by 10%.",
    "cost": {
      "Money": requiredMoney
    },
    "flavor": flavor
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
    partial(hasEnoughResources, "money", requiredMoney)
  ];

  var startFns = [
    partial(removeResource, "money", requiredMoney),
    partial(appendToOutputContainer, outputText),
    partial(showUiElement, "keyboardTab", "inline"),
    partial(showUiElement, "keyboardSkill", "inline"),
    partial(addTrigger, firstNoteTrigger)
  ];

  var tooltip = {
    "description": "Unlocks the keyboard skill.",
    "cost": {
      "Money": requiredMoney
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

/*
  ---- Mechanic Upgrades -----
*/

function unlockLaptopTempoTask(context) {
  var requiredBeats = 30;

  var checkFns = [
    partial(hasEnoughResources, "beats", requiredBeats)
  ];

  var startFns = [
    partial(removeResource, "beats", requiredBeats),
    partial(showUiElement, "tempoSelector", "inline")
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
  var requiredBeats;

  switch(context.level) {
    case 1:
      requiredBeats = 100;
      break;
    case 2:
      requiredBeats = 500;
      break;
    case 3:
      requiredBeats = 1000;
      break;
    case 4:
      requiredBeats = 5000;
      break;
    case 5:
      requiredBeats = 10000;
      break;
    case 6:
      requiredBeats = 50000;
      break;
    case 7:
      requiredBeats = 100000;
      break;
    default:
      return null;
  }

  var checkFns = [
    partial(hasEnoughResources, "beats", requiredBeats)
  ];

  var startFns = [
    partial(openPopUp, populateGenrePopUp, context.taskName)
  ];

  var finishFns = [
    partial(removeResource, "beats", requiredBeats),
    partial(removeTask, context.taskName)
  ];

  var tooltip = {
    "description": "Unlocks a bonus effect of your choice for your laptop, improving beat production.",
    "cost": {
      "Beats": requiredBeats
    },
    "flavor": "Are you even a real artist if people aren't arguing about what sub-genre your music is in?"
  };

  return {
    name: context.taskName,
    checkFns: checkFns,
    startFns: startFns,
    finishFns: finishFns,
    tooltip: tooltip,
    repeatable: true // This task isn't actually repeatable, it gets removed manually in the finishFn
  };
}

/*
  ---- Other Upgrades -----
*/

function increaseComboTask(context) {
  // Increases the max combo of the given instrument by 1.
  var requiredResource;

  switch(context.level) {
    case 1:
      requiredResource = 50;
      break;
    case 2:
      requiredResource = 500;
      break;
    default:
      return null;
  }

  var addBonusMultiplier = function() {
    game.player.instruments[context.instrument].bonusMaxMultiplier++;
  }

  var checkFns = [
    partial(hasEnoughResources, context.resource, requiredResource)
  ];

  var startFns = [
    addBonusMultiplier,
    partial(removeResource, context.resource, requiredResource)
  ];

  var tooltip = {
    "description": "Increases the max combo for your " + context.instrument + " by 1.",
    "cost": {},
    "flavor": "C-C-C-Combo... gainer?"
  };

  tooltip.cost[capitalize(context.resource)] = requiredResource;

  return {
    name: context.taskName,
    checkFns: checkFns,
    startFns: startFns,
    tooltip: tooltip,
  };
}

function increaseResourceXpTask(context) {
  // Increases the amount of XP awarded by a given resource by a flat amount
  var requiredResource;
  var bonusXpAmount;
  var flavor;

  switch(context.resource) {
    case "beats":
      requiredResource = 100;
      bonusXpAmount = 1;
      flavor = "It's called the 'ah-ha!' moment.";
      break;
    case "samples":
      requiredResource = 1000;
      bonusXpAmount = 10;
      flavor = "You finally understand the meaning of life... and more importantly, how to get more XP from samples.";
      break;
    default:
      return null;
  }

  var addBonusXp = function() {
    game.player.resources[context.resource].bonusXp += bonusXpAmount;
  }

  var checkFns = [
    partial(hasEnoughResources, context.resource, requiredResource)
  ];

  var startFns = [
    addBonusXp,
    partial(removeResource, context.resource, requiredResource)
  ];

  var tooltip = {
    "description": "Increases the amount of XP gained when creating " + context.resource + " by " + bonusXpAmount + ".",
    "cost": {},
    "flavor": flavor
  };

  tooltip.cost[capitalize(context.resource)] = requiredResource;

  return {
    name: context.taskName,
    checkFns: checkFns,
    startFns: startFns,
    tooltip: tooltip,
  };
}

function reduceXpRequiredTask(context) {
  // TODO: Reduces the amount of XP required to level a skill by a percentage
}
