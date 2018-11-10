// TODO: Add tabs to beatContainer to be unlocked (for different instruments)
// TODO: Add bells and whistles to beatContainer that can be unlocked (ie. something to alter beat tempo)
// TODO: Add Achievements and Stats
// TODO: Make Songs and Albums and other cool resources
// TODO: Make Sample/Song/Album quality scale with skills

var game;

function init() {
	// TODO: Check for a save
	game = new Game();
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

	document.getElementById('money').innerHTML = "<p>Money</p><p>" + game.player.money + "</p>" + defaultSuffix;
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
	var html = "";

	game.player.songs.forEach(function(song) {
		var songRow = "<div class='songRow'>" +
						"<p class='songTitle'>" + song.name + "</p>" +
						"<div class='songContent'" +
						   "<p>Quality: " + song.quality + "</p>" +
						   "<p>Popularity: " + song.popularity + "</p>" +
						   "<p>Revenue: $" + song.moneyPerSec + " per second</p>" +
						   "<p>Total Earnings: " + song.totalEarnings + "</p>" +
						"</div>" +
					  "</div>";

		html += songRow;
	});

	document.getElementById('songs').innerHTML = html;
}

function updateTasks() {
	var tasks = game.tasks;

	if (tasks.length > 0) {
		var html = "";

		for (var i = 0; i < tasks.length; i++) {
			// Cryptic Regex to make a nice name for the button
			var splitTaskName = tasks[i].replace(/([A-Z])/g, ' $1')
			var taskName = splitTaskName.replace(/^./, function(str){ return str.toUpperCase(); });

			// tasks[i] must be the name of the function to execute.
			// Function name should be a camel-case version of string you want on the button 
			html += "<button onclick='doTask(" + tasks[i] + ")')>" + taskName + "</button>";
		}

		document.getElementById('tasks').innerHTML = "<p>Tasks</p>" + html;
	}
}

function updateSkills() {
	document.getElementById('laptopSkill').innerHTML = "<p>" + game.player.laptopSkill + "</p>";
	document.getElementById('vocalSkill').innerHTML = "<p>" + game.player.vocalSkill + "</p>";
	document.getElementById('keyboardSkill').innerHTML = "<p>" + game.player.keyboardSkill + "</p>";
	document.getElementById('guitarSkill').innerHTML = "<p>" + game.player.guitarSkill + "</p>";
	document.getElementById('drumSkill').innerHTML = "<p>" + game.player.drumSkill + "</p>";

	updateProgress(document.getElementById('laptopProgress'), game.player.laptopXp, game.laptopXpToNextLevel);
	updateProgress(document.getElementById('vocalProgress'), game.player.vocalXp, game.vocalXpToNextLevel);
	updateProgress(document.getElementById('keyboardProgress'), game.player.keyboardXp, game.keyboardXpToNextLevel);
	updateProgress(document.getElementById('guitarProgress'), game.player.guitarXp, game.guitarXpToNextLevel);
}

function clickBeat() {
	// TODO: only up the progress bar if the beat was made on the correct frame(s) (you must click to the beat!)
	//		 maybe player gets a beat bonus for not clicking  off-beat (x1, x2, x3)
	// TODO: .... add beat (which leads to a whole slew of additional work so...)
	var progress = document.getElementById('beatProgress');

	updateProgress(progress, (progress.value + 1), game.clicksPerBeat, makeBeat);
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