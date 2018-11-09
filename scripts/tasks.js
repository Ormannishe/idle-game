var activeTask;
var taskCompleteFn;

function doTask(task) {
	// TODO: Add real tasks (events which complete over time)
	// TODO: Add more upgrades (tasks that trigger immediately)
	task();
	updateView();
}

function test() {
	// Use this to debug whatever you want
	game.player.beats += 10;
  game.player.lifetimeBeats += 10;
	game.player.money += 100;
  game.player.lifetimeMoney += 100;
}

function makeFirstSample() {
	if (game.player.beats >= game.sampleCost) {
		makeSample(1);
		document.getElementById('samples').style.display = "block";
		appendToOutputContainer("You combine some beats to make your first sample! Your eyes glow with pride as you take one more step toward your first song.");
		removeTask("makeFirstSample");
	}
}

function buyNewLaptop() {
	if (game.player.money >= 500) {
		var beatProgress = document.getElementById('beatProgress');

		game.clicksPerBeat = 5;
		game.player.money -= 500;
		updateProgress(beatProgress, beatProgress.value, game.clicksPerBeat, makeBeat);
		removeTask("buyNewLaptop");
	}
}

function longTask() {
	startActiveTask("Long Task", 100, stopActiveTask);
	removeTask("longTask");
}

function startActiveTask(taskName, timeToComplete, completeFn) {
	var container = document.getElementById('taskProgressContainer');
	var label = document.getElementById('taskLabel');
	var progress = document.getElementById('taskProgress');

	activeTask = taskName;
	taskCompleteFn = completeFn;
	label.innerHTML = taskName;
	progress.value = 0;
	progress.max = timeToComplete;
	taskProgressContainer.style.display = "block";
}

function stopActiveTask() {
	var container = document.getElementById('taskProgressContainer');
	var label = document.getElementById('taskLabel');
	var progress = document.getElementById('taskProgress');

	activeTask = undefined;
	taskProgressContainer.style.display = "none";
}

function removeTask(taskName) {
	var taskIndex = game.tasks.indexOf(taskName);
	game.tasks.splice(taskIndex, 1);
}
