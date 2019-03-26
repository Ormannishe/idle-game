/*
  Contains all functionality for the trigger framework
  Defines all of the triggers available in the game
*/

function initTriggers() {
  // Populate triggerFnSet for the start of the game
  game.triggerFnSet.add(oddJobsEventTrigger);
  game.triggerFnSet.add(firstBeatTrigger);
  game.triggerFnSet.add(studyOnlineTrigger);
  game.triggerFnSet.add(newLaptopTrigger);
  game.triggerFnSet.add(finishOddJobsTrigger);
}

function checkTriggers(natural) {
  game.triggerFnSet.forEach(function(triggerFn) {
    if (triggerFn(natural)) {
      game.triggerFnSet.delete(triggerFn);
    }
  });
}

/* ------ TRIGGERS ------
A Trigger Function typically performs a check and executes an action if said check is true.
It should return 'true' if the task was executed and 'false' or undefined otherwise.

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

/* Starting Triggers */

function oddJobsEventTrigger(natural) {
  // The expected number of ticks this event takes to trigger
  var avgTicks = 60;

  if (natural && Math.random() < 1 / avgTicks) {
    appendToOutputContainer("A neighbor comes by with an opportunity to make a little cash.");
    makeOddJobsTask();
    return true;
  }
}

/* Beat Progression */

function firstBeatTrigger() {
  if (game.player.stats.beats.lifetime >= 1) {
    document.getElementById('beats').style.display = "block";
    appendToOutputContainer("You've created your first beat. A building block to something greater.");
    game.triggerFnSet.add(tenthBeatTrigger);
    return true;
  }
}

function tenthBeatTrigger() {
  if (game.player.stats.beats.lifetime >= 10) {
    appendToOutputContainer("You have so many ideas! You should probably write some of them down.");
    makeBuyBeatBookTask();
    game.triggerFnSet.add(firstSampleTrigger);
    game.triggerFnSet.add(fiftiethBeatTrigger);
    return true;
  }
}

function fiftiethBeatTrigger() {
  if (game.player.stats.beats.lifetime >= 50) {
    appendToOutputContainer("You've got the basics down, maybe it's time to experiment with the tempo?");
    makeExperimentWithTempoTask();
    game.triggerFnSet.add(hundredthBeatTrigger);
    return true;
  }
}

function hundredthBeatTrigger() {
  if (game.player.stats.beats.lifetime >= 100) {
    appendToOutputContainer("As you make your hundredth beat, you can feel you're getting better at this.");
    makeExploreSubgenreTask(100);
    game.triggerFnSet.add(fiveHundredthBeatTrigger);
    return true;
  }
}

function fiveHundredthBeatTrigger() {
  if (game.player.stats.beats.lifetime >= 500) {
    appendToOutputContainer("Time to widen your horizons by delving into another sub-genre.");
    makeExploreSubgenreTask(200);
    game.triggerFnSet.add(thousandthBeatTrigger);
    return true;
  }
}

function thousandthBeatTrigger() {
  if (game.player.stats.beats.lifetime >= 1000) {
    makeExploreSubgenreTask(400);
    appendToOutputContainer("A thousand beats, made by your hand. Hard to beleive how far you've come.");
    return true;
  }
}

/* Note Progression */

function firstNoteTrigger() {
  if (game.player.stats.notes.lifetime >= 1) {
    document.getElementById('notes').style.display = "block";
    appendToOutputContainer("You've played your first note! Practice will lead to beautiful music.");
    game.triggerFnSet.add(firstMeasureTrigger);
    return true;
  }
}

function hundredthNoteTrigger() {
  if (game.player.stats.notes.lifetime >= 100) {
    appendToOutputContainer("One hundred notes later, and you can almost play with both hands!");
    game.triggerFnSet.add(thousandthNoteTrigger);
    return true;
  }
}

function thousandthNoteTrigger() {
  if (game.player.stats.notes.lifetime >= 1000) {
    appendToOutputContainer("As you play your thousandth note, you realize you've gotten quite good at this.");
    return true;
  }
}

/* Tier Two Resource Progression */

function firstSampleTrigger() {
  if (game.player.resources.beats >= game.resources.samples.resourcesPer) {
    appendToOutputContainer("After creating a number of solid beats, you're ready to combine them into a short sample.");
    makeFirstSampleTask();
    game.triggerFnSet.add(firstSongTrigger);
    return true;
  }
}

function firstMeasureTrigger() {
  if (game.player.resources.notes >= game.resources.measures.resourcesPer) {
    appendToOutputContainer("After playing several notes, you're ready to record your first measure.");
    game.triggerFnSet.add(hundredthNoteTrigger);
    makeFirstMeasureTask();
    return true;
  }
}

/* Tier Three Resource Progression */

function firstSongTrigger() {
  var totalResources = 0;
  var validResources = game.specialResources.songs.validResources;

  validResources.forEach(function(resource) {
    totalResources += game.player.resources[resource];
  });

  if (totalResources >= game.specialResources.songs.resourcesPer) {
    appendToOutputContainer("After days of effort, you feel like you might finally have enough material to make a full song!");
    makeFirstSongTask();
    return true;
  }
}

/* Skill Progression */

function studyOnlineTrigger() {
  if (game.player.skills.laptop.level >= 2) {
    appendToOutputContainer("If you want to get better at this, you're going to have to do some studying.");
    makeStudyOnlineTask();
    game.triggerFnSet.add(onlinePortfolioTrigger);
    return true;
  }
}

function onlinePortfolioTrigger() {
  if (game.player.skills.laptop.level >= 5) {
    makeOnlinePortfolioTask();
    game.triggerFnSet.add(musicClassTrigger);
    return true;
  }
}

function djPartyTrigger(natural) {
  // Average number of ticks required to trigger this event
  var avgTicks = 100 - game.player.resources.fame;

  if (avgTicks < 30)
    avgTicks = 30;

  if (natural && Math.random() < (1 / avgTicks)) {
    var partyTypes = ["Birthday Party", "House Party", "Corporate Party", "Wedding", "Frat Party"]
    var party = partyTypes[Math.floor(Math.random() * partyTypes.length)]
    appendToOutputContainer("A client has contacted you with an opportunity to DJ for a " + party.toLowerCase() + "!");
    makeDJAtPartyTask(party);
    return true;
  }
}

function musicClassTrigger() {
  if (game.player.skills.laptop.level >= 8) {
    appendToOutputContainer("You'll be able to learn more quickly if you take a music class!");
    makeMusicClassTask();
    game.triggerFnSet.add(unlockNewInstrumentTrigger);
    return true;
  }
}

// level 11 ?

function unlockNewInstrumentTrigger() {
  if (game.player.skills.laptop.level >= 15) {
    appendToOutputContainer("Maybe it's time to pick up another skill?");
    makeBuyKeyboardTask();
    return true;
  }
}

/* Money Progression */

function newLaptopTrigger() {
  if (game.player.resources.money >= 400) {
    appendToOutputContainer("You've almost saved up enough money to afford a new laptop!");
    makeBuyNewLaptopTask();
    return true;
  }
}

/* Fame Progression */

function finishOddJobsTrigger() {
  if (game.player.resources.fame >= 25) {
    makeMeetWithNightclubOwnersTask();
    appendToOutputContainer("It's time to focus on your music. Odd jobs are a thing of the past!");
    triggerFnSet.delete(oddJobsEventTrigger);
    oddJobs.forEach(function(job) {
      removeTask(job);
    });

    return true;
  }
}

function djNightclubEventTrigger(natural) {
  // The expected number of ticks this event takes to trigger
  var avgTicks = 500 - game.player.resources.fame;

  if (avgTicks < 30)
    avgTicks = 30;

  if (natural && Math.random() < (1 / avgTicks)) {
    appendToOutputContainer("An opportunity to DJ at a nightclub has opened up!");
    makeDJAtNightclubTask();
    return true;
  }
}
