var triggerFnSet = new Set([firstBeatTrigger, newLaptopTrigger]);
var newLaptop = false;

function checkTriggers() {
  triggerFnSet.forEach(function(triggerFn) {
    if (triggerFn()) {
      triggerFnSet.delete(triggerFn);
    }
  });
}

/* ------ TRIGGERS ------
A Trigger Function typically performs a check and executes an action if said check is true.
It should return 'true' if the task was executed and false otherwise.

Ex.
function exampleTrigger() {
  if (some conditions) {
    trigger actions
    return true;
  }
  return false;
}
*/

function firstBeatTrigger() {
  if (game.player.beats >= 1) {
		appendToOutputContainer("You've created your first beat. A building block to something greater.");
    triggerFnSet.add(hundredthBeatTrigger);
    triggerFnSet.add(djBirthdayTrigger);
    triggerFnSet.add(firstSampleTrigger);
    return true;
	}
  return false;
}

function hundredthBeatTrigger() {
  if (game.player.lifetimeBeats >= 100) {
		appendToOutputContainer("You make your hundredth beat, you feel like you're getting better at this");
    return true;
	}
  return false;
}

function firstSampleTrigger() {
	if (game.player.beats >= game.beatsPerSample) {
		appendToOutputContainer("After creating a number of solid beats, you're ready to combine them into a short sample.");
		game.tasks.push("makeFirstSample");
    triggerFnSet.add(firstSongTrigger);
    return true;
	}
  return false;
}

function firstSongTrigger() {
  if (game.player.samples >= game.samplesPerSong) {
    appendToOutputContainer("With a handful of samples, you feel like you might have enough material to make a full song!");
    game.tasks.push("makeFirstSong");
    return true;
  }
  return false;
}

function djBirthdayTrigger() {
  if (game.player.skills["laptop"].level >= 5) {
    game.tasks.push("djBirthdayParty");
    triggerFnSet.add(unlockVocalsTrigger);
    return true;
  }
  return false;
}

function newLaptopTrigger() {
	if (game.player.money >= 400 && newLaptop == false) {
		appendToOutputContainer("Maybe a new laptop will help create beats faster...");
		game.tasks.push("buyNewLaptop");
		newLaptop = true;
    return true;
	}
  return false;
}

function unlockVocalsTrigger() {
  if (game.player.skills["laptop"].level >= 10) {
    appendToOutputContainer("Maybe it's time to pick up another skill?");
    game.tasks.push("buyMicrophone");
    return true;
  }
  return false;
}
