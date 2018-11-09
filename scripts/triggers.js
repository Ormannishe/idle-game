var firstBeat = true;
var firstSample = true;
var newLaptop = false;

function checkTriggers() {
	// TODO: Figure out more scalable way to add trigger events...
	if (game.player.beats == 1 && firstBeat) {
		appendToOutputContainer("You make your first beat.");
		firstBeat = false;
	}

	if (game.player.beats >= game.sampleCost && firstSample) {
		appendToOutputContainer("After creating a number of solid beats, you're ready to combine them into a short sample.");
		firstSample = false;
		game.tasks.push("makeFirstSample");
	}

	if (game.player.money >= 500 && newLaptop == false) {
		appendToOutputContainer("Maybe a new laptop will help create beats faster...");
		game.tasks.push("buyNewLaptop");
		newLaptop = true;
	}
}