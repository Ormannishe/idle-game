var toolTipText;

function buildTooltip(buttonName) {
	return toolTipText[buttonName];
}

function initToolTipText() {
	toolTipText = {
		test: "Gives free beats and money. Cheater.",
		makeFirstSample: "Create your first ever sample! Requires " + game.beatsPerSample + " beats.",
		makeFirstSong: "Active Task: Make your first ever song! Requires " + game.samplesPerSong + " samples and takes 10 seconds to complete.",
		makeNewSong: "Active Task: Make a new song! Requires " + game.samplesPerSong + " samples and takes 10 seconds to complete.",
		buyNewLaptop: "Purchase a new laptop. Costs $500. Reduces the number of clicks per beat to 5.",
		longTask: "This is a debug task that just takes a while to complete."
	}
}