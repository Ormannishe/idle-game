var newLaptop = false;

// A trigger function usually does a check
// and performs an action if said check is true
// It will return true if action happened and false otherwise
// Example
/*
function exampleTrigger() {
  if (some conditions) {
    trigger actions
    return true;
  }
  return false;
}
 */

var triggerFnSet = new Set([firstBeatTrigger, firstSampleTrigger, newLaptopTrigger]);

function checkTriggers() {
  triggerFnSet.forEach(function(triggerFn) {
    if (triggerFn()) {
      triggerFnSet.delete(triggerFn);
    }
  });
}

function firstBeatTrigger() {
  if (game.player.beats >= 1) {
		appendToOutputContainer("You make your first beat.");
    triggerFnSet.add(hundredthBeatTrigger);
    return true;
	}
  return false;
}

function hundredthBeatTrigger() {
  if (game.player.lifetimeBeats >= 100) {
		appendToOutputContainer("You make your hundredth beat, you feel like you are getting better at this");
    return true;
	}
  return false;
}

function firstSampleTrigger() {
	if (game.player.beats >= game.beatsPerSample) {
		appendToOutputContainer("After creating a number of solid beats, you're ready to combine them into a short sample.");
		game.tasks.push("makeFirstSample");
    return true;
	}
  return false;
}

function newLaptopTrigger() {
	if (game.player.money >= 500 && newLaptop == false) {
		appendToOutputContainer("Maybe a new laptop will help create beats faster...");
		game.tasks.push("buyNewLaptop");
		newLaptop = true;
    return true;
	}
  return false;
}
