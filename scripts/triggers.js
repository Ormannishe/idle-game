/*
  Contains all functionality for the trigger framework.
*/

/*
  ---- Triggers Implementation -----
*/

function addTrigger(triggerFn) {
  // Add the name of the given triggerFn to the triggers list
  game.player.triggers.push(triggerFn.name);
}

function initTriggers() {
  // Populate triggers list for the start of the game
  addTrigger(oddJobsEventTrigger);
  addTrigger(firstBeatTrigger);
  addTrigger(levelTwoLaptopTrigger);
  addTrigger(unlockNightclubTrigger);
}

function checkTriggers(natural) {
  /*
    Execute each triggerFn in the triggers list.
    If a triggerFn returns true, remove it from the list
  */
  for (var i = 0; i < game.player.triggers.length; i++) {
    var triggerFn = window[game.player.triggers[i]];
    if (triggerFn(natural)) {
      game.player.triggers.splice(i, 1);
    }
  }
}

/* ------ TRIGGERS ------
A Trigger Function typically performs a check and executes an action if said check returns true.
A trigger should return 'true' if the task was executed and 'false' or undefined otherwise.

Ex.
function exampleTrigger() {
  if (some conditions) {
    trigger actions
    return true;
  }
}

There are two types of triggers:
1. Regular Triggers, which can deterministicly be triggered at any time
2. Event Triggers, which have a chance to trigger ONLY on a natural tick.
*/

/*
  ---- Beat Progression -----
*/

function firstBeatTrigger() {
  if (game.player.stats.beats.lifetime >= 1) {
    showUiElement("beats", "block");
    appendToOutputContainer("You've created your first beat. A building block to something greater.");
    addTrigger(tenthBeatTrigger);
    return true;
  }
}

function tenthBeatTrigger() {
  if (game.player.stats.beats.lifetime >= 10) {
    appendToOutputContainer("You're starting to get the hang of this...");
    addTrigger(firstSampleTrigger);
    addTrigger(fiftiethBeatTrigger);
    return true;
  }
}

function fiftiethBeatTrigger() {
  // TODO: What does this do now?
  if (game.player.stats.beats.lifetime >= 50) {
    addTrigger(hundredthBeatTrigger);
    return true;
  }
}

function hundredthBeatTrigger() {
  // TODO: What does this do now?
  // Achievement?
  if (game.player.stats.beats.lifetime >= 100) {
    addTrigger(fiveHundredthBeatTrigger);
    return true;
  }
}

function fiveHundredthBeatTrigger() {
  // TODO: What does this do now?
  // Achievement?
  if (game.player.stats.beats.lifetime >= 500) {
    addTrigger(thousandthBeatTrigger);
    return true;
  }
}

function thousandthBeatTrigger() {
  // Achievement?
  if (game.player.stats.beats.lifetime >= 1000) {
    appendToOutputContainer("A thousand beats, made by your hand. Hard to beleive how far you've come.");
    return true;
  }
}

/*
  ---- Note Progression -----
*/

function firstNoteTrigger() {
  if (game.player.stats.notes.lifetime >= 1) {
    appendToOutputContainer("You've played your first note! Practice will lead to beautiful music.");
    showUiElement("notes", "block");
    addTrigger(firstMeasureTrigger);
    return true;
  }
}

function hundredthNoteTrigger() {
  if (game.player.stats.notes.lifetime >= 100) {
    appendToOutputContainer("One hundred notes later, and you can almost play with both hands!");
    addTrigger(thousandthNoteTrigger);
    return true;
  }
}

function thousandthNoteTrigger() {
  if (game.player.stats.notes.lifetime >= 1000) {
    appendToOutputContainer("As you play your thousandth note, you realize you've gotten quite good at this.");
    return true;
  }
}

/*
  ---- Tier Two Resource Progression -----
*/

function firstSampleTrigger() {
  if (game.player.resources.beats.amount >= game.resources.samples.resourcesPer) {
    var context = {
      taskId: "unlockResourceTask",
      taskName: "Create First Sample",
      resource: "samples"
    }

    appendToOutputContainer("After creating a number of solid beats, you're ready to combine them into a short sample.");
    addTask(context);
    addTrigger(firstSongTrigger);
    return true;
  }
}

function firstMeasureTrigger() {
  if (game.player.resources.notes.amount >= game.resources.measures.resourcesPer) {
    var context = {
      taskId: "unlockResourceTask",
      taskName: "Create First Measure",
      resource: "measures"
    }

    appendToOutputContainer("After playing several notes, you're ready to record your first measure.");
    addTask(context);
    addTrigger(hundredthNoteTrigger);
    return true;
  }
}

/*
  ---- Tier Three Resource Progression -----
*/

function firstSongTrigger() {

  var totalResources = 0;
  var validResources = game.specialResources.songs.validResources;

  validResources.forEach(function(resource) {
    totalResources += game.player.resources[resource].amount;
  });

  if (totalResources >= game.specialResources.songs.resourcesPer) {
    var context = {
      taskId: "newSongTask",
      taskName: "Make First Song"
    };

    appendToOutputContainer("After days of effort, you feel like you might finally have enough material to make a full song!");
    addTask(context);
    return true;
  }
}

/*
  ---- Skill Progression -----
*/

function levelTwoLaptopTrigger() {
  // Unlocks Level 1 DJ Study Task
  if (game.player.skills.laptop.level >= 2) {
    var context = {
      taskId: "genericStudyTask",
      taskName: "Practice Making Beats",
      resource: "beats",
      level: 1
    };

    appendToOutputContainer("If you want to get better at this, you're going to have to practice.");
    addTask(context);
    addTrigger(levelThreeLaptopTrigger);
    return true;
  }
}

function levelThreeLaptopTrigger() {
  // Unlocks Tempo Selector for Laptop
  if (game.player.skills.laptop.level >= 3) {
    var context = {
      taskId: "unlockLaptopTempoTask",
      taskName: "Experiment With Tempo"
    };

    appendToOutputContainer("You've got the basics down, maybe it's time to experiment with the tempo?");
    addTask(context);
    addTrigger(levelFourLaptopTrigger);
    return true;
  }
}

function levelFourLaptopTrigger() {
  // Unlocks Level 1 DJ Job
  if (game.player.skills.laptop.level >= 4) {
    var context = {
      taskId: "advanceDJCareerTask",
      taskName: "Build Online Portfolio",
      level: 1
    };

    appendToOutputContainer("A portfolio of your best samples could lead to some extra cash!");
    addTask(context);
    addTrigger(levelFiveLaptopTrigger);
    return true;
  }
}

function levelFiveLaptopTrigger() {
  // First Laptop Upgrade
  if (game.player.skills.laptop.level >= 5) {
    var context = {
      taskId: "upgradeLaptopTask",
      taskName: "Buy DJ Software",
      level: 1
    };

    appendToOutputContainer("You'd be able to create beats a lot faster if you had the proper software...");
    addTask(context);
    addTrigger(levelSixLaptopTrigger);
    return true;
  }
}

function levelSixLaptopTrigger() {
  // First Laptop Combo Upgrade
  if (game.player.skills.laptop.level >= 6) {
    var context = {
      taskId: "increaseComboTask",
      taskName: "Improved Beat Matching",
      instrument: "laptop",
      resource: "beats",
      level: 1
    };

    addTask(context);
    addTrigger(levelSevenLaptopTrigger);
    return true;
  }
}

function levelSevenLaptopTrigger() {
  // Upgrades Level 1 DJ Study Task
  if (game.player.skills.laptop.level >= 7) {
    var context = {
      taskId: "upgradeStudyTask",
      taskName: "DJ Practice Routine",
      level: 1
    };

    addTask(context);
    addTrigger(levelEightLaptopTrigger);
    return true;
  }
}

function levelEightLaptopTrigger() {
  // Upgrades Level 1 DJ Job
  if (game.player.skills.laptop.level >= 8) {
    var context = {
      taskId: "upgradeEventChanceTask",
      taskName: "Updated Portfolio",
      level: 1,
      resource: "samples"
    };

    addTask(context);
    addTrigger(levelNineLaptopTrigger);
    return true;
  }
}

function levelNineLaptopTrigger() {
  // Improves DJ XP Gain from Beats
  if (game.player.skills.laptop.level >= 9) {
    var context = {
      taskId: "increaseResourceXpTask",
      taskName: "DJ Insight",
      resource: "beats"
    };

    addTask(context);
    addTrigger(levelTenLaptopTrigger);
    return true;
  }
}

function levelTenLaptopTrigger() {
  // TODO: Implement 'Higher Charge'
  if (game.player.skills.laptop.level >= 11) {

    addTrigger(levelElevenLaptopTrigger);
    return true;
  }
}

function levelElevenLaptopTrigger() {
  // Second Laptop Combo Upgrade
  if (game.player.skills.laptop.level >= 11) {
    var context = {
      taskId: "increaseComboTask",
      taskName: "Improved Phrasing",
      instrument: "laptop",
      resource: "beats",
      level: 2
    };

    addTask(context);
    addTrigger(levelTwelveLaptopTrigger);
    return true;
  }
}

function levelTwelveLaptopTrigger() {
  // Unlocks Level 2 DJ Study Task
  // TODO: Make a task which gives you level 2 studying?
  if (game.player.skills.laptop.level >= 12) {
    var context = {
      taskId: "genericStudyTask",
      taskName: "Study DJing Online",
      resource: "beats",
      level: 2
    };

    appendToOutputContainer("Furthering your DJ skills will require some research!");
    addTask(context);
    addTrigger(levelThirteenLaptopTrigger);
    return true;
  }
}

function levelThirteenLaptopTrigger() {
  // Unlocks Laptop SubGenres
  if (game.player.skills.laptop.level >= 13) {
    var context = {
      taskId: "exploreSubgenreTask",
      taskName: "Explore A Sub-Genre",
      level: 1
    };

    appendToOutputContainer("Maybe it's time to explore a specific subgenre?");
    addTask(context);
    addTrigger(levelFourteenLaptopTrigger);
    return true;
  }
}

function levelFourteenLaptopTrigger() {
  // Level 2 DJ Job
  // TODO: Make Fame requirement part of task
  if (game.player.skills.laptop.level >= 14) {
    if (game.player.resources.fame.amount >= 25) {
      var context = {
        taskId: "advanceDJCareerTask",
        taskName: "Meet With Nightclub Owners",
        level: 2
      };

      appendToOutputContainer("You're starting to become well known as a freelance artist, but your sound is destined for a larger venue.");
      addTask(context);
      addTrigger(nightclubDJEventTrigger);
      addTrigger(levelFifteenLaptopTrigger);
      return true;
    }
  }
}

function levelFifteenLaptopTrigger() {
  // Level 2 Laptop Upgrade
  // TODO: Requires level 1 laptop upgrade ?
  if (game.player.skills.laptop.level >= 15) {
    var context = {
      taskId: "upgradeLaptopTask",
      taskName: "Buy A New Laptop",
      level: 2
    };

    appendToOutputContainer("A new laptop would help produce beats even faster!");
    addTask(context);
    return true;
  }
}

function levelFiftyLaptopTrigger() {
  // Currently unlocks a new instrument
  // TODO: Figure out when this happens
  if (game.player.skills.laptop.level >= 50) {
    var context = {
      taskId: "newInstrumentTask",
      taskName: "Buy A Keyboard", // TODO: Buy A New Instrument
    };

    appendToOutputContainer("Maybe it's time to pick up another skill?");
    addTask(context);
    return true;
  }
}

/*
  ---- Money Progression -----
*/

function thousandDollarTrigger() {
  // Achievement ?
  if (game.player.resources.money.amount >= 1000) {
    return true;
  }
}

/*
  ---- Fame Progression -----
*/

function unlockNightclubTrigger() {
  // Achievement for 100 Fame ?
  if (game.player.resources.fame.amount >= 100) {

    return true;
  }
}

/*
  ---- Event Triggers -----
*/

function oddJobsEventTrigger(natural) {
  // The expected number of ticks this event takes to trigger
  var avgTicks = 60;

  if (natural) {
    if (Math.random() < 1 / avgTicks) {
      var oddJobs = [
        "Mow Lawns", "Shovel Snow", "Yardwork", "Change Tires",
        "Walk Dogs", "Babysitting", "Rake Leaves", "Clean Windows"
      ];
      var job = oddJobs[Math.floor(Math.random() * oddJobs.length)];
      var context = {
        taskId: "oddJobsTask",
        taskName: job
      };

      appendToOutputContainer("A neighbor comes by with an opportunity to make a little cash.");
      addTask(context);
      return true;
    }
  }
}

function freelanceDJEventTrigger(natural) {
  // Average number of ticks required to trigger this event
  var avgTicks = (100 - game.player.resources.fame.amount) * game.player.jobs.laptop.freelance.procMod;

  if (avgTicks < 10)
    avgTicks = 10;

  if (natural && Math.random() < (1 / avgTicks)) {
    var eventTypes = [
      "Birthday Party", "House Party", "Corporate Event", "Wedding", "Frat Party"
    ];
    var djEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    var context = {
      taskId: "workAsDJTask",
      taskName: "DJ At " + djEvent,
      level: 1,
      djEvent: djEvent
    };

    appendToOutputContainer("A client has contacted you with an opportunity to DJ for a " + djEvent.toLowerCase() + "!");
    addTask(context);
    return true;
  }
}

function nightclubDJEventTrigger(natural) {
  // The expected number of ticks this event takes to trigger
  var avgTicks = (500 - game.player.resources.fame.amount) * game.player.jobs.laptop.nightclub.procMod;

  if (avgTicks < 10)
    avgTicks = 10;

  if (natural && Math.random() < (1 / avgTicks)) {
    var context = {
      taskId: "workAsDJTask",
      taskName: "DJ At Nightclub",
      level: 2
    };

    appendToOutputContainer("An opportunity to DJ at a nightclub has opened up!");
    addTask(context);
    return true;
  }
}
