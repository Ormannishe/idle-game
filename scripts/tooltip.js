var toolTipText;

function initToolTipText() {
	toolTipText = {
		test: {description: "Gives free beats and money. Cheater."},
		makeFirstSample: {description: "Create your first ever sample!",
											cost: {"Beats": game.beatsPerSample}},
		makeFirstSong: {description: "Make your first ever song!",
										cost: {"Samples": game.samplesPerSong,
													 "Time": 10}},
		makeNewSong: {description: "Make a new song!",
									cost: {"Samples": game.samplesPerSong,
												 "Time": 10}},
		djBirthdayParty: {description: "DJ for a birthday party. Rewards $50 and 250 Laptop XP.",
											cost: {"Beats": 20,
														 "Time": 120}},
		buyNewLaptop: {description: "Purchase a new laptop. Reduces the number of clicks per beat to 25%.",
									 cost: {"Money": 500}},
		buyMicrophone: {description: "Purchase a new microphone. Unlocks the vocals skill.",
										cost: {"Money": 1000}}
	}
}

function buildTooltip(buttonName) {
	var html = "";

	console.log(toolTipText[buttonName]);

	html += "<div class='tooltipHeader'>" + toolTipText[buttonName].description + "</div>";

	toolTipText[buttonName].cost.forEach(function(val, key) {
		html += "<div class='tooltipPriceInfo'>" +
							"<p class='tooltipResource'>" + key + "</p>" +
							"<p class='tooltipCost'>" + val + "</p>" +
						"</div>";
	})

	return html;
}
