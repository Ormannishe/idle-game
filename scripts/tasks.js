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
	else {
		appendToOutputContainer("You don't have enough beats make a sample!");
	}
}

function makeFirstSong() {
	if (game.player.samples >= game.samplesPerSong) {
		var songName = prompt("Please enter your song name:", "Sandstorm");

		if (songName !== null) {
			var activeFn = function() {
				makeSong(songName, ["laptop"]);
				appendToOutputContainer("You've created your first song. The start of a legacy!");
				document.getElementById('songsTab').style.display = "inline";
			};

			if (startActiveTask("Make First Song", 10, activeFn)) {
				removeTask("makeFirstSong");
			}
		}
	}
	else {
		appendToOutputContainer("You don't have enough samples to make a song!");
	}
}

function makeNewSong() {
	if (game.player.samples >= game.samplesPerSong) {
		var songName = prompt("Please enter your song name:", "Sandstorm");

		if (songName !== null) {
			var activeFn = function() {
				makeSong(songName, ["laptop"]);
				appendToOutputContainer("You've created a new song!");
			};

			startActiveTask("Make New Song", 10, activeFn)
		}
	}
	else {
		appendToOutputContainer("You don't have enough samples to make a new song!");
	}
}

function djBirthdayParty() {
	if (game.player.beats >= 20) {

		if (activeTask == undefined)
			game.player.beats -= 20;

		var activeFn = function() {
			game.player.addXp("laptop", 250);
			game.player.addMoney(50);
			appendToOutputContainer("You earn a quick 50 bucks DJing at a birthday party.");
		};

		startActiveTask("DJ Birthday Party", 120, activeFn)
	}
	else {
		appendToOutputContainer("You don't have enough beats to DJ! You need 20 beats!");
	}
}

function buyNewLaptop() {
	if (game.player.money >= 500) {
		var beatProgress = document.getElementById('beatProgress');

		game.clicksPerBeat = Math.round(game.clicksPerBeat * 0.75);
		game.player.money -= 500;
		updateProgress(beatProgress, beatProgress.value, game.clicksPerBeat, makeBeat);
		removeTask("buyNewLaptop");
	}
	else {
		appendToOutputContainer("You don't have enough money to purchase a new laptop!");
	}
}

function buyMicrophone() {
	if (game.player.money >= 1000) {
		game.player.money -= 1000;
		appendToOutputContainer("You purchase a microphone. Maybe your voice will add another element to your music.");
		document.getElementById('vocalTab').style.display = "inline";
		document.getElementById('vocalSkill').style.display = "inline";
		removeTask("buyMicrophone");
	}
	else {
		appendToOutputContainer("You don't have enough money to purchase a microphone!");
	}
}
