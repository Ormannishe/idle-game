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
		djBirthdayParty: "Active Task: DJ for a birthday party. Requires 20 beats, rewards $50 and 250 Laptop XP. Completes over 120 seconds.",
		buyNewLaptop: "Purchase a new laptop. Costs $500. Reduces the number of clicks per beat to 25%.",
		buyMicrophone: "Purchase a new microphone. Costs $1000. Unlocks the vocals skill."
	}
}