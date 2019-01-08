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
  if (game.player.beats >= 1) {
    document.getElementById('beats').style.display = "block";
    appendToOutputContainer("You've created your first beat. A building block to something greater.");
    triggerFnSet.add(firstSampleTrigger);
    return true;
  }
}

function firstSampleTrigger() {
  if (game.player.beats >= game.beatsPerSample) {
    appendToOutputContainer("After creating a number of solid beats, you're ready to combine them into a short sample.");
    makeFirstSampleTask();
    triggerFnSet.add(hundredthBeatTrigger);
    triggerFnSet.add(firstSongTrigger);
    return true;
  }
}

function firstSongTrigger() {
  if (game.player.samples >= game.samplesPerSong) {
    appendToOutputContainer("With a handful of samples, you feel like you might have enough material to make a full song!");
    makeFirstSongTask();
    return true;
  }
}

function hundredthBeatTrigger() {
  if (game.player.lifetimeBeats >= 100) {
    appendToOutputContainer("As you make your hundredth beat, you can feel you're getting better at this.");
    triggerFnSet.add(thousandthBeatTrigger);
    return true;
  }
}

function thousandthBeatTrigger() {
  if (game.player.lifetimeBeats >= 1000) {
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

function firstMeasureTrigger() {
  if (game.player.notes >= game.notesPerMeasure) {
    appendToOutputContainer("After playing several notes, you're ready to record your first measure.");
    triggerFnSet.add(hundredthNoteTrigger);
    makeFirstMeasureTask();
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

/* Skill Progression */

function studyOnlineTrigger() {
  if (game.player.skills["laptop"].level >= 2) {
    appendToOutputContainer("If you want to get better at this, you're going to have to do some studying.");
    makeStudyOnlineTask();
    triggerFnSet.add(djBirthdayTrigger);
    return true;
  }
}

function djBirthdayTrigger() {
  if (game.player.skills["laptop"].level >= 5) {
    triggerFnSet.add(djBirthdayEventTrigger);
    triggerFnSet.add(musicClassTrigger);
    return true;
  }
}

function djBirthdayEventTrigger(natural) {
  // The expected number of ticks this event takes to trigger
  var avgTicks = 100 - (5 * game.player.fame);

  if (avgTicks < 30)
    avgTicks = 30;

  if (natural && Math.random() < (1 / avgTicks)) {
    appendToOutputContainer("An opportunity to DJ for a birthday party has opened up!");
    makeDJAtBirthdayPartyTask();
    return true;
  }
}

function musicClassTrigger() {
  if (game.player.skills["laptop"].level >= 7) {
    appendToOutputContainer("You'll be able to learn more quickly if you take a music class!");
    makeMusicClassTask();
    triggerFnSet.add(unlockNewInstrumentTrigger);
    return true;
  }
}

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
  if (game.player.fame >= 5) {
    appendToOutputContainer("It's time to focus on your music. Odd jobs are a thing of the past!");
    triggerFnSet.delete(oddJobsEventTrigger);
    oddJobs.forEach(function(job) {
      removeTask(job);
    });

    return true;
  }
}
