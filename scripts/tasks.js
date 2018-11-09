function doTask(task) {
	// TODO: Add real tasks (events which complete over time)
	// TODO: Add more upgrades (tasks that trigger immediately)
	task();
	updateView();
}

function test() {
	// Use this to debug whatever you want
	game.player.beats += 10;
	game.player.money += 100;
}

function makeFirstSample() {
	if (game.player.beats >= game.sampleCost) {
		var taskIndex = game.tasks.indexOf("makeFirstSample");

		makeSample(1);
		game.tasks.splice(taskIndex, 1);

		document.getElementById('samples').style.display = "block";
		appendToOutputContainer("You combine some beats to make your first sample! Your eyes glow with pride as you take one more step toward your first song.");
	}
}

function buyNewLaptop() {
	if (game.player.money >= 500) {
		var taskIndex = game.tasks.indexOf("buyNewLaptop");
		var beatProgress = document.getElementById('beatProgress');

		game.clicksPerBeat = 5;
		game.player.money -= 500;
		game.tasks.splice(taskIndex, 1);

		updateProgress(beatProgress, beatProgress.value, game.clicksPerBeat, makeBeat);
	}
}
