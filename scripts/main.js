// TODO: Add bells and whistles to beatContainer that can be unlocked (ie. something to alter beat tempo)
// TODO: Add Achievements and Stats
// TODO: Make Songs and Albums and other cool resources
// TODO: Make Sample/Song/Album quality scale with skills

var game;

function init() {
	// TODO: Check for a save
	game = new Game();
	initToolTipText();
	startAnimations();
	updateView();
	console.log("Initialized!");
}

function updateView() {
	checkTriggers();
	updateResourcesTab();
	updateSongsTab();
	updateTasks();
	updateSkills();
}

function updateResourcesTab() {
	// TODO: Add more resources
	var defaultSuffix = "<p>-</p><p>-</p><p>-</p><p>-</p>";
	var sampleSuffix = getResourceNumbers(game.player.beats, game.beatsPerSample, "makeSample");

	document.getElementById('money').innerHTML = "<p>Money</p><p>$" + round(game.player.money, 2) + "</p>" + defaultSuffix;
	document.getElementById('beats').innerHTML = "<p>Beats</p><p>" + game.player.beats + "</p>" +defaultSuffix;
	document.getElementById('samples').innerHTML = "<p>Samples</p><p>" + game.player.samples + "</p>" + sampleSuffix;
}

function getResourceNumbers(numReqResource, cost, onClickFn) {
	var oneTime = "<p>-</p>";
	var tenTimes = "<p>-</p>";
	var hundredTimes = "<p>-</p>";
	var allTimes = "<p>-</p>";
	var maxResource = Math.floor(numReqResource / cost);

	if (numReqResource >= cost) {
		oneTime = "<p onclick=" + onClickFn + "()>1</p>";
		allTimes = "<p onclick=" + onClickFn + "(" + maxResource + ")" + ">" + maxResource + "</p>";
	}

	if (numReqResource >= (cost * 10))
		tenTimes = "<p onclick=" + onClickFn + "(10)>10</p>";

	if (numReqResource >= (cost * 100))
		hundredTimes = "<p onclick=" + onClickFn + "(100)>100</p>";

	return oneTime + tenTimes + hundredTimes + allTimes;
}

function updateSongsTab() {
	var totalRevenue = 0;
	var html = "";

	game.player.songs.forEach(function(song) {
		var songRow = "<div class='songRow'>" +
						"<p class='songTitle'>" + song.name + "</p>" +
						"<div class='songContent'" +
						   "<p>Quality: " + song.quality + "</p>" +
						   "<p>Popularity: " + song.popularity + "</p>" +
						   "<p>Revenue: $" + song.moneyPerSec + " per second</p>" +
						   "<p>Total Earnings: $" + round(song.totalEarnings, 2) + "</p>" +
						"</div>" +
					  "</div>";

		totalRevenue += song.moneyPerSec;
		html += songRow;
	});

	html  = "<div id='songsHeader'>" +
				"<p>Total Song Revenue: $" + round(totalRevenue, 2) + " per second</p>" +
				"<button tooltip='" + buildTooltip("makeNewSong") + "' onclick='doTask(makeNewSong)'>Make New Song</button>" +
			"</div>" +
			html;

	document.getElementById('songs').innerHTML = html;
}

function updateTasks() {
	var html = "";
	var tasks = game.tasks;

	for (var i = 0; i < tasks.length; i++) {
		// Cryptic Regex to make a nice name for the button
		var splitTaskName = tasks[i].replace(/([A-Z])/g, ' $1')
		var taskName = splitTaskName.replace(/^./, function(str){ return str.toUpperCase(); });

		// tasks[i] must be the name of the function to execute.
		// Function name should be a camel-case version of string you want on the button
		html += "<button tooltip='" + buildTooltip(tasks[i]) + "' onclick='doTask(" + tasks[i] + ")')>" + taskName + "</button>";
	}

	document.getElementById('tasks').innerHTML = "<p>Tasks</p>" + html;
}

function updateSkills() {
	document.getElementById('laptopLevel').innerHTML = "<p>" + game.player.skills.laptop.level + "</p>";
	document.getElementById('vocalLevel').innerHTML = "<p>" +game.player.skills.vocal.level + "</p>";
	document.getElementById('keyboardLevel').innerHTML = "<p>" + game.player.skills.keyboard.level + "</p>";
	document.getElementById('guitarLevel').innerHTML = "<p>" + game.player.skills.guitar.level + "</p>";
	document.getElementById('drumLevel').innerHTML = "<p>" + game.player.skills.drum.level + "</p>";

	updateProgress(document.getElementById('laptopProgress'), game.player.skills.laptop.xp, game.player.skills.laptop.toNextLevel);
	updateProgress(document.getElementById('vocalProgress'), game.player.skills.vocal.xp, game.player.skills.vocal.toNextLevel);
	updateProgress(document.getElementById('keyboardProgress'), game.player.skills.keyboard.xp, game.player.skills.keyboard.toNextLevel);
	updateProgress(document.getElementById('guitarProgress'), game.player.skills.guitar.xp, game.player.skills.guitar.toNextLevel);
}

function getOffsets(e) {
  var offsets = e.getBoundingClientRect();

  return {
    left: offsets.left + window.scrollX,
    right: offsets.right + window.scrollY
  };
}

function clickBeat() {
	/*
		Advances the progress bar if the user has clicked the 'Make Beat' button.
		Amount of progress is determined by how well the user lined up the marker with the different 'tiers' of zones.

		Green = +3 (and adds to the multiplier)
		Yellow = +2 (and maintains the multuplier)
		Orange = +1  (and removes from the multiplier)
		Red = 0	(and resets the multiplier)
	*/
	var progressAmount = 0;
	var progress = document.getElementById('beatProgress');
	var markerOffsets = getOffsets(document.querySelector('#marker'));
	var greenOffsets = getOffsets(document.getElementsByClassName('greenZone')[0]);
	var firstYellowOffsets = getOffsets(document.getElementsByClassName('yellowZone')[0]);
	var secondYellowOffsets = getOffsets(document.getElementsByClassName('yellowZone')[1]);
	var firstOrangeOffsets = getOffsets(document.getElementsByClassName('orangeZone')[0]);
	var secondOrangeOffsets = getOffsets(document.getElementsByClassName('orangeZone')[1])


	if (markerOffsets.left > greenOffsets.left && markerOffsets.left < greenOffsets.right) {
		progressAmount = 3;

		if (game.player.beatMultiplier < 10)
			game.player.beatMultiplier++;
	}
	else if ((markerOffsets.left > firstYellowOffsets.left && markerOffsets.left < firstYellowOffsets.right) ||
			 (markerOffsets.left > secondYellowOffsets.left && markerOffsets.left < secondYellowOffsets.right)) {
		progressAmount = 2;
	}
	else if ((markerOffsets.left > firstOrangeOffsets.left && markerOffsets.left < firstOrangeOffsets.right) ||
			 (markerOffsets.left > secondOrangeOffsets.left && markerOffsets.left < secondOrangeOffsets.right)) {
		progressAmount = 1;
		
		if (game.player.beatMultiplier > 1)
			game.player.beatMultiplier--;
	}
	else {
		game.player.beatMultiplier = 1;
	}

	progressAmount *= game.player.beatMultiplier;

	console.log(progressAmount);

	updateProgress(progress, (progress.value + progressAmount), game.clicksPerBeat, makeBeat);
	updateView();
}

function updateProgress(progress, value, max, triggerFn) {
	progress.max = max;

	if (value >= max) {
		progress.value = 0;

		if (triggerFn != undefined)
			triggerFn();
	}
	else {
		progress.value = value;
	}
}

function appendToOutputContainer(message) {
	var outputContainer = document.getElementById('outputContainer');

	outputContainer.innerHTML += "<p>" + message + "</p>";
	outputContainer.scrollTop = outputContainer.scrollHeight;
}

$(document).ready(function() {
	init();
});
