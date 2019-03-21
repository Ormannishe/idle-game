var triggerFnSet = new Set([oddJobsEventTrigger, firstBeatTrigger, studyOnlineTrigger,
                            newLaptopTrigger, finishOddJobsTrigger]);
var newLaptop = false;

function checkTriggers(natural) {
  triggerFnSet.forEach(function(triggerFn) {
    if (triggerFn(natural)) {
      triggerFnSet.delete(triggerFn);
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
  if (game.player.lifetimeBeats >= 1) {
    document.getElementById('beats').style.display = "block";
    appendToOutputContainer("You've created your first beat. A building block to something greater.");
    triggerFnSet.add(tenthBeatTrigger);
    return true;
  }
}

function tenthBeatTrigger() {
  if (game.player.lifetimeBeats >= 10) {
    appendToOutputContainer("You have so many ideas! You should probably write some of them down.");
    makeBuyBeatBookTask();
    triggerFnSet.add(firstSampleTrigger);
    triggerFnSet.add(fiftiethBeatTrigger);
    return true;
  }
}

function fiftiethBeatTrigger() {
  if (game.player.lifetimeBeats >= 50) {
    appendToOutputContainer("You've got the basics down, maybe it's time to experiment with the tempo?");
    makeExperimentWithTempoTask();
    triggerFnSet.add(hundredthBeatTrigger);
    return true;
  }
}

function hundredthBeatTrigger() {
  if (game.player.lifetimeBeats >= 100) {
    appendToOutputContainer("As you make your hundredth beat, you can feel you're getting better at this.");
    makeExploreSubgenreTask(100);
    triggerFnSet.add(fiveHundredthBeatTrigger);
    return true;
  }
}

function fiveHundredthBeatTrigger() {
  if (game.player.lifetimeBeats >= 500) {
    appendToOutputContainer("Time to widen your horizons by delving into another sub-genre.");
    makeExploreSubgenreTask(200);
    triggerFnSet.add(thousandthBeatTrigger);
    return true;
  }
}

function thousandthBeatTrigger() {
  if (game.player.lifetimeBeats >= 1000) {
    makeExploreSubgenreTask(400);
    appendToOutputContainer("A thousand beats, made by your hand. Hard to beleive how far you've come.");
    return true;
  }
}

/* Note Progression */

function firstNoteTrigger() {
  if (game.player.notes >= 1) {
    document.getElementById('notes').style.display = "block";
    appendToOutputContainer("You've played your first note! Practice will lead to beautiful music.");
    triggerFnSet.add(firstMeasureTrigger);
    return true;
  }
}

function hundredthNoteTrigger() {
  if (game.player.lifetimeNotes >= 100) {
    appendToOutputContainer("One hundred notes later, and you can almost play with both hands!");
    triggerFnSet.add(thousandthNoteTrigger);
    return true;
  }
}

function thousandthNoteTrigger() {
  if (game.player.lifetimeNotes >= 1000) {
    appendToOutputContainer("As you play your thousandth note, you realize you've gotten quite good at this.");
    return true;
  }
}

/* Tier Two Resource Progression */

function firstSampleTrigger() {
  if (game.player.beats >= game.beatsPerSample) {
    appendToOutputContainer("After creating a number of solid beats, you're ready to combine them into a short sample.");
    makeFirstSampleTask();
    triggerFnSet.add(firstSongTrigger);
    return true;
  }
}

function firstMeasureTrigger() {
  if (game.player.notes >= game.notesPerMeasure) {
    appendToOutputContainer("After playing several notes, you're ready to record your first measure.");
    triggerFnSet.add(hundredthNoteTrigger);
    makeFirstMeasureTask();
    return true;
  }
}

/* Tier Three Resource Progression */

function firstSongTrigger() {
  var totalResources = game.player.samples + game.player.measures;

  if (totalResources >= game.samplesPerSong) {
    appendToOutputContainer("After days of effort, you feel like you might finally have enough material to make a full song!");
    makeFirstSongTask();
    return true;
  }
}

/* Skill Progression */

function studyOnlineTrigger() {
  if (game.player.skills["laptop"].level >= 2) {
    appendToOutputContainer("If you want to get better at this, you're going to have to do some studying.");
    makeStudyOnlineTask();
    triggerFnSet.add(onlinePortfolioTrigger);
    return true;
  }
}

function onlinePortfolioTrigger() {
  if (game.player.skills["laptop"].level >= 5) {
    makeOnlinePortfolioTask();
    triggerFnSet.add(musicClassTrigger);
    return true;
  }
}

function djPartyTrigger(natural) {
  // Average number of ticks required to trigger this event
  var avgTicks = 100 - game.player.fame;

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
  if (game.player.skills["laptop"].level >= 8) {
    appendToOutputContainer("You'll be able to learn more quickly if you take a music class!");
    makeMusicClassTask();
    triggerFnSet.add(unlockNewInstrumentTrigger);
    return true;
  }
}

// level 11 ?

function unlockNewInstrumentTrigger() {
  if (game.player.skills["laptop"].level >= 15) {
    appendToOutputContainer("Maybe it's time to pick up another skill?");
    makeBuyKeyboardTask();
    return true;
  }
}

/* Money Progression */

function newLaptopTrigger() {
  if (game.player.money >= 400 && newLaptop == false) {
    appendToOutputContainer("Maybe a new laptop will help create beats faster...");
    makeBuyNewLaptopTask();
    newLaptop = true;
    return true;
  }
}

/* Fame Progression */

function finishOddJobsTrigger() {
  if (game.player.fame >= 25) {
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
  var avgTicks = 500 - game.player.fame;

  if (avgTicks < 30)
    avgTicks = 30;

  if (natural && Math.random() < (1 / avgTicks)) {
    appendToOutputContainer("An opportunity to DJ at a nightclub has opened up!");
    makeDJAtNightclubTask();
    return true;
  }
}
