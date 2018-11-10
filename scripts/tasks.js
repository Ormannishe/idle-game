var activeTask;
var taskCompleteFn;

function doTask(task) {
	task();
	updateView();
}

function startActiveTask(taskName, timeToComplete, completeFn) {
	if (activeTask == undefined) {
		var container = document.getElementById('taskProgressContainer');
		var label = document.getElementById('taskLabel');
		var progress = document.getElementById('taskProgress');

		activeTask = taskName;
		taskCompleteFn = function() {
			if (completeFn) {
				completeFn();
			}

			stopActiveTask();
		};

		label.innerHTML = taskName;
		progress.value = 0;
		progress.max = timeToComplete;
		taskProgressContainer.style.display = "block";

		return true;
	}

	appendToOutputContainer("You can only work on one active task at a time!");
	return false;
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
	game.player.addBeat(10);
  	game.player.addMoney(100);
}

function makeFirstSample() {
	if (game.player.beats >= game.beatsPerSample) {
		makeSample(1);
		document.getElementById('samples').style.display = "block";
		appendToOutputContainer("You've created your first musical sample! Your eyes glow with pride as you take one more step toward your destiny.");
		removeTask("makeFirstSample");
	}
}

function makeFirstSong() {
	if (game.player.samples >= game.samplesPerSong) {
		var songName = prompt("Please enter your song name:", "Sandstorm");

		var activeFn = function() {
			makeSong(songName);
			appendToOutputContainer("You've created your first song. The start of a legacy!");
			document.getElementById('songsTab').style.display = "inline";
		};

		if (startActiveTask("Make First Song", 10, activeFn)) {
			removeTask("makeFirstSong");
			game.tasks.push("makeNewSong");
		}
	}
}

function makeNewSong() {
	if (game.player.samples >= game.samplesPerSong) {
		var songName = prompt("Please enter your song name:", "Sandstorm");

		var activeFn = function() {
			makeSong(songName);
			appendToOutputContainer("You've created a new song!");
		};

		startActiveTask("Make New Song", 10, activeFn)
	}
	else {
		appendToOutputContainer("You don't have enough samples to make a new song!");
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
	if (startActiveTask("Long Task", 100))
		removeTask("longTask");
}
