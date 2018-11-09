var activeTask;
var taskCompleteFn;

function doTask(task) {
	task();
	updateView();
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
	var progress = document.getElementById('taskProgress');

	activeTask = undefined;
	taskProgressContainer.style.display = "none";
}

function removeTask(taskName) {
	var taskIndex = game.tasks.indexOf(taskName);
	game.tasks.splice(taskIndex, 1);
}

/* ------ TASKS ------
There are two types of Tasks:

1. Upgrades - These are tasks that execute and complete instantly, usually providing some kind of immediate bonus.
2. Active Tasks - These tasks complete over time. The Player can only work on one active task at a time.

The function name for ALL tasks MUST be a camel-case version of the title you want on the associated button.
*/

// Use this to debug whatever you want
function test() {
	game.player.beats += 10;
	game.player.money += 100;
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
	if (activeTask == undefined) {
		startActiveTask("Long Task", 100, stopActiveTask);
		removeTask("longTask");
	}
}

function otherTask() {
	if (activeTask == undefined) {
		startActiveTask("Other Task", 10, stopActiveTask);
		removeTask("otherTask");
	}
}
