var firstBeat = true;
var firstSample = true;
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
  if (game.player.beats == 1 && firstBeat) {
		appendToOutputContainer("You make your first beat.");
		firstBeat = false;
    return true;
	}
  return false;
}

function firstSampleTrigger() {
	if (game.player.beats >= game.sampleCost && firstSample) {
		appendToOutputContainer("After creating a number of solid beats, you're ready to combine them into a short sample.");
		firstSample = false;
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
