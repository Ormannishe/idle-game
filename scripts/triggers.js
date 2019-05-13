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
  addTrigger(newLaptopTrigger);
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
  ---- Starting Triggers -----
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

function firstBeatTrigger() {
  if (game.player.stats.beats.lifetime >= 1) {
    showUiElement("beats", "block");
    appendToOutputContainer("You've created your first beat. A building block to something greater.");
    addTrigger(tenthBeatTrigger);
    return true;
  }
}

function levelTwoLaptopTrigger() {
  if (game.player.skills.laptop.level >= 2) {
    var context = {
      taskId: "practiceDJTask",
      taskName: "Practice Making Beats",
      interval: 10,
      beatsPerInterval: 1,
      xpReward: 50,
      timeToComplete: 60,
      flavor: "Apparently 'practicing' is the same thing as waiting.",
      repeatable: true
    };

    appendToOutputContainer("If you want to get better at this, you're going to have to practice.");
    addTask(context);
    addTrigger(levelFiveLaptopTrigger);
    return true;
  }
}

/*
  ---- Beat Progression -----
*/

function tenthBeatTrigger() {
  if (game.player.stats.beats.lifetime >= 10) {
    var context = {
      taskId: "buyBeatBookTask",
      taskName: "Book Of Beats",
    };

    appendToOutputContainer("You should probably write down some of your ideas.");
    addTask(context);
    addTrigger(firstSampleTrigger);
    addTrigger(fiftiethBeatTrigger);
    return true;
  }
}

function fiftiethBeatTrigger() {
  if (game.player.stats.beats.lifetime >= 50) {
    var context = {
      taskId: "unlockLaptopTempoTask",
      taskName: "Experiment With Tempo"
    };

    appendToOutputContainer("You've got the basics down, maybe it's time to experiment with the tempo?");
    addTask(context);
    addTrigger(hundredthBeatTrigger);
    return true;
  }
}

function hundredthBeatTrigger() {
  if (game.player.stats.beats.lifetime >= 100) {
    var context = {
      taskId: "exploreSubgenreTask",
      taskName: "Explore A Sub-Genre",
      requiredBeats: 100
    };

    appendToOutputContainer("As you make your hundredth beat, you can feel you're getting better at this.");
    addTask(context);
    addTrigger(fiveHundredthBeatTrigger);
    return true;
  }
}

function fiveHundredthBeatTrigger() {
  if (game.player.stats.beats.lifetime >= 500) {
    var context = {
      taskId: "exploreSubgenreTask",
      taskName: "Explore A Sub-Genre II",
      requiredBeats: 200
    };

    appendToOutputContainer("Time to widen your horizons by delving into another sub-genre.");
    addTask(context);
    addTrigger(thousandthBeatTrigger);
    return true;
  }
}

function thousandthBeatTrigger() {
  if (game.player.stats.beats.lifetime >= 1000) {
    var context = {
      taskId: "exploreSubgenreTask",
      taskName: "Explore A Sub-Genre III",
      requiredBeats: 400
    };

    appendToOutputContainer("A thousand beats, made by your hand. Hard to beleive how far you've come.");
    addTask(context);
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
  if (game.player.resources.beats >= game.resources.samples.resourcesPer) {
    var context = {
      taskId: "unlockResourceTask",
      taskName: "Create First Sample",
      resource: "samples",
      outputText: "You've created your first musical sample! Your eyes glow with pride as you take one more step toward your destiny.",
      flavor: "Free samples are always great. These samples are okay too."
    }

    appendToOutputContainer("After creating a number of solid beats, you're ready to combine them into a short sample.");
    addTask(context);
    addTrigger(firstSongTrigger);
    return true;
  }
}

function firstMeasureTrigger() {
  if (game.player.resources.notes >= game.resources.measures.resourcesPer) {
    var context = {
      taskId: "unlockResourceTask",
      taskName: "Create First Measure",
      resource: "measures",
      outputText: "You've created your first measure!",
      flavor: "Measure twice, cut once."
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
    totalResources += game.player.resources[resource];
  });

  if (totalResources >= game.specialResources.songs.resourcesPer) {
    var context = {
      taskId: "newSongTask",
      taskName: "Make First Song",
      description: "Create a new song! Unlocks a new tier three resource.",
      flavor: "You'll probably be embarassed by this one in a few years.",
      repeatable: true
    };

    appendToOutputContainer("After days of effort, you feel like you might finally have enough material to make a full song!");
    addTask(context);
    return true;
  }
}

/*
  ---- Skill Progression -----
*/

function levelFiveLaptopTrigger() {
  if (game.player.skills.laptop.level >= 5) {
    var context = {
      taskId: "advanceDJCareerTask",
      taskName: "Build Online Portfolio",
      level: 1,
      requiredSamples: 5,
      outputText: "You've completed your online portfolio. Now you just need clients!",
      description: "Become a Freelance DJ, unlocking opportunities to play at small gatherings.",
      flavor: "Turns out the hardest part about becoming an artist is getting other people to like your music."
    };

    addTask(context);
    addTrigger(levelEightLaptopTrigger);
    return true;
  }
}

function levelEightLaptopTrigger() {
  if (game.player.skills.laptop.level >= 8) {
    var context = {
      taskId: "practiceDJTask",
      taskName: "Study DJing Online",
      interval: 5,
      beatsPerInterval: 1,
      xpReward: 100,
      timeToComplete: 120,
      flavor: "If you're procrastinating studying right now, this doesn't count.",
      repeatable: true
    };

    appendToOutputContainer("Furthering your DJ skills will require some research!");
    addTask(context);
    addTrigger(levelFifteenLaptopTrigger);
    return true;
  }
}

function levelFifteenLaptopTrigger() {
  if (game.player.skills.laptop.level >= 15) {
    var context = {
      taskId: "newInstrumentTask",
      taskName: "Buy A Keyboard", // TODO: Buy A New Instrument
      requiredMoney: 1000,
    };

    appendToOutputContainer("Maybe it's time to pick up another skill?");
    addTask(context);
    return true;
  }
}

/*
  ---- Money Progression -----
*/

function newLaptopTrigger() {
  if (game.player.resources.money >= 400) {
    var context = {
      taskId: "upgradeLaptopTask",
      taskName: "Buy New Laptop",
      requiredMoney: 500
    };

    appendToOutputContainer("You've almost saved up enough money to afford a new laptop!");
    addTask(context);
    return true;
  }
}

/*
  ---- Fame Progression -----
*/

function unlockNightclubTrigger() {
  if (game.player.resources.fame >= 25) {
    var context = {
      taskId: "advanceDJCareerTask",
      taskName: "Meet With Nightclub Owners",
      level: 2,
      requiredSamples: 30,
      outputText: "Many of the nightclub owners liked the samples you showed them!",
      description: "Unlocks more lucrative opportunities to DJ at nightclubs.",
      flavor: "Nightclubs during the day are... strange."
    };

    appendToOutputContainer("It's time to focus on your music. Odd jobs are a thing of the past!");
    addTask(context);
    addTrigger(nightclubDJEventTrigger);
    return true;
  }
}

/*
  ---- Event Triggers -----
*/

function freelanceDJEventTrigger(natural) {
  // Average number of ticks required to trigger this event
  var avgTicks = 100 - game.player.resources.fame;

  if (avgTicks < 30)
    avgTicks = 30;

  if (natural && Math.random() < (1 / avgTicks)) {
    var eventTypes = [
      "Birthday Party", "House Party", "Corporate Event", "Wedding", "Frat Party"
    ];
    var djEvent = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    var context = {
      taskId: "workAsDJTask",
      taskName: "DJ At " + djEvent,
      level: 1,
      xpReward: 50,
      moneyReward: 50,
      fameReward: 5,
      timeToComplete: 180,
      outputText: "After a few hours work at a " + djEvent.toLowerCase() + ", you manage to make $50!",
      flavor: "Turns out, parties are a lot less fun when you're working."
    };

    appendToOutputContainer("A client has contacted you with an opportunity to DJ for a " + djEvent.toLowerCase() + "!");
    addTask(context);
    return true;
  }
}

function nightclubDJEventTrigger(natural) {
  // The expected number of ticks this event takes to trigger
  var avgTicks = 500 - game.player.resources.fame;

  if (avgTicks < 30)
    avgTicks = 30;

  if (natural && Math.random() < (1 / avgTicks)) {
    var context = {
      taskId: "workAsDJTask",
      taskName: "DJ At Nightclub",
      level: 2,
      xpReward: 250,
      moneyReward: 250,
      fameReward: 30,
      timeToComplete: 180,
      outputText: "After a crazy night at a club, you manage to make a solid $250!",
      flavor: "'This isss myyy sooooooooong!' - That White Girl"
    };

    appendToOutputContainer("An opportunity to DJ at a nightclub has opened up!");
    addTask(context);
    return true;
  }
}
