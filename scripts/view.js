var tickInterval;

/* View Update Functions */

function startTicking() {
  tickInterval = setInterval(naturalTick, 1000);
}

function naturalTick() {
  passiveResourceGeneration();
  updateActiveTask();
  adjustSongStats();
  updateView(true);
}

function passiveResourceGeneration() {
  var progress = document.getElementById('laptopBeatProgress');
  var progressAmount = game.player.passiveBeatProgress;

  if (game.activeLaptopSubgenre == "trance")
    progressAmount *= 2;

  updateProgress(progress, (progress.value + progressAmount), game.clicksPerBeat, addBeat);
}

function updateView(natural) {
  checkTriggers(natural);
  updateResourcesTab();
  updateSongsTab();
  updateTasks();
  updateSkills();
}

function updateResourcesTab() {
  var sampleSuffix = getResourceNumbers(game.player.beats, game.beatsPerSample, "makeSample");
  var measureSuffix = getResourceNumbers(game.player.notes, game.notesPerMeasure, "makeMeasure");

  document.getElementById('fameAmount').innerHTML = game.player.fame;
  document.getElementById('moneyAmount').innerHTML = "$" + round(game.player.money, 2);
  document.getElementById('beatAmount').innerHTML = game.player.beats;
  document.getElementById('samples').innerHTML = "<p>Samples</p><p>" + game.player.samples + "</p>" + sampleSuffix;
  document.getElementById('noteAmount').innerHTML = game.player.notes;
  document.getElementById('measures').innerHTML = "<p>Measures</p><p>" + game.player.measures + "</p>" + measureSuffix;

}

function updateSongsTab() {
  var totalRevenue = 0;
  var html = "";
	var songTask = getTask("Make New Song");
	var newSongButton = "";

	if (songTask != undefined) {
		newSongButton = makeTaskButton(songTask);
	}

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

  html = "<div id='songsHeader'>" +
    "<p>Total Song Revenue: $" + round(totalRevenue, 2) + " per second</p>" +
    newSongButton +
    "</div>" +
    html;

  document.getElementById('songs').innerHTML = html;
}

function updateTasks() {
  var html = "";
  var tasks = game.tasks;

	tasks.forEach(function(task) {
		if (task.name != "Make New Song")
			html += makeTaskButton(task);
	});

  document.getElementById('tasks').innerHTML = "<p>Tasks</p>" + html;
}

function updateSkills() {
  document.getElementById('laptopLevel').innerHTML = "<p>" + game.player.skills.laptop.level + "</p>";
  document.getElementById('vocalLevel').innerHTML = "<p>" + game.player.skills.vocal.level + "</p>";
  document.getElementById('keyboardLevel').innerHTML = "<p>" + game.player.skills.keyboard.level + "</p>";
  document.getElementById('guitarLevel').innerHTML = "<p>" + game.player.skills.guitar.level + "</p>";
  document.getElementById('drumLevel').innerHTML = "<p>" + game.player.skills.drum.level + "</p>";

  updateProgress(document.getElementById('laptopSkillProgress'), game.player.skills.laptop.xp, game.player.skills.laptop.toNextLevel);
  updateProgress(document.getElementById('vocalSkillProgress'), game.player.skills.vocal.xp, game.player.skills.vocal.toNextLevel);
  updateProgress(document.getElementById('keyboardSkillProgress'), game.player.skills.keyboard.xp, game.player.skills.keyboard.toNextLevel);
  updateProgress(document.getElementById('guitarSkillProgress'), game.player.skills.guitar.xp, game.player.skills.guitar.toNextLevel);
}

function appendToOutputContainer(message) {
	var outputContainer = document.getElementById('outputContainer');

	outputContainer.innerHTML += "<p>" + message + "</p>";
	outputContainer.scrollTop = outputContainer.scrollHeight;
}

/* Event Handlers */

function fameTooltip() {
  var obj = document.getElementById('fameTooltip');
  var tooltip = document.getElementById('tooltip');
  var offsets = getOffsets(obj);
  var html = "<div id='tooltipHeader'>" +
             "Fame is a measure of how well known you are as an artist.<br><br>" +
             "You can increase your fame through various tasks or by releasing high quality songs and albums.<br><br>" +
             "The more famous you are, the larger your fanbase will be. Songs and Albums created by you will gain popularity faster if you have an established fanbase.<br><br>" +
             "Increased fame also leads to more lucrative opportunities such as playing at prestigious events with other famous artists or attending VIP social events." +
             "</div>";

  tooltip.innerHTML = html;
  tooltip.style.left = offsets.left + 20;
  tooltip.style.top = offsets.top - 70;
  tooltip.style.width = "400px";
  tooltip.style.display = "inline";

  var tooltipHeader = document.getElementById('tooltipHeader');
  tooltipHeader.style.borderBottom = "none";
}

function hideFameTooltip() {
  tooltip.style.width = "200px";
  hideTooltip();
}

function showTooltip(obj, taskName) {
	var offsets = getOffsets(obj);
	var tooltip = document.getElementById('tooltip');
	var task = getTask(taskName);
	var html = "<div id='tooltipHeader'>" + task.tooltip["description"] + "</div>";

	for (var key in task.tooltip["cost"]) {
		html += "<div class='tooltipPriceInfo'>" +
							"<p class='tooltipResource'>" + key + "</p>" +
							"<p class='tooltipCost'>" + task.tooltip["cost"][key] + "</p>" +
						"</div>";
	};

	if (task.tooltip["flavor"] !== undefined) {
		html += "<div class='tooltipFlavor'>" + task.tooltip["flavor"] + "</div>";
	}

	tooltip.innerHTML = html;
	tooltip.style.left = offsets.left - (obj.offsetWidth / 3);
	tooltip.style.top = offsets.top + obj.offsetHeight + 5;
	tooltip.style.display = "inline";
}

function hideTooltip() {
	document.getElementById('tooltip').style.display = "none";
}

function toggleItemTab(evt, tab) {
  // TODO: Add tab content for money generating resources (ie. songs, albums, brand, other media/products)
  var tabContent, activeTabs;

  // Hide all tabcontent
  tabContent = document.getElementsByClassName("tabcontent");

  for (var i = 0; i < tabContent.length; i++) {
    tabContent[i].style.display = "none";
  }

  // Set the active tab to non-active
  activeTabs = document.getElementsByClassName("active-tab")

  for (var i = 0; i < activeTabs.length; i++) {
    activeTabs[i].className = "tab";
  }

  // Show the new tab content, and make the new tab 'active'
  document.getElementById(tab).style.display = "block";
  evt.currentTarget.className = "active-tab";
}

function toggleInstrument(evt, instrument) {
  // Hide all instrumentContent
  var instrumentContent = document.getElementsByClassName("instrumentContent");

  for (var i = 0; i < instrumentContent.length; i++) {
    instrumentContent[i].style.display = "none";
  }

  // Disable all instrument key handlers and animations
  stopLaptop();
  stopKeyboard();

  // Set the active instrument to non-active
  var activeInstrument = document.getElementsByClassName("activeInstrument")

  for (var i = 0; i < activeInstrument.length; i++) {
    activeInstrument[i].className = "instrument";
  }

  // Enable event listeners and animations for respective instrument
  switch(instrument) {
    case "laptop":
      startLaptop();
      break;
    case "keyboard":
      startKeyboard();
      break;
  }

  // Show the new instrument content, and make the new instrument 'active',
  document.getElementById(instrument).style.display = "block";
  evt.currentTarget.className = "activeInstrument";
}

/* Helper Functions */

function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function updateProgress(progress, value, max, triggerFn) {
  progress.max = max;

  while (value >= max) {
    value = value - max;

    if (triggerFn != undefined)
      triggerFn();
  }

  progress.value = value;
}

function updateMultiplier(multiplier, elementId) {
  var colorAndFontShift = Math.min(10, multiplier);
  var multDiv = document.getElementById(elementId);
  var r = 250 - (colorAndFontShift - 1) * 30;
  var g = 250 - Math.abs(colorAndFontShift - 5) * 30;
  var b = (colorAndFontShift - 5) * 50;

  multDiv.innerHTML = "x" + multiplier;
  multDiv.style.fontSize = 15 + colorAndFontShift;
  multDiv.style.color = "rgb(" + r + "," + g + "," + b + ")";
}

function getOffsets(e) {
  var offsets = e.getBoundingClientRect();

  return {
    left: offsets.left + window.scrollX,
    right: offsets.right + window.scrollX,
		top: offsets.top + window.scrollY
  };
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

function makeTaskButton(task) {
	var html = "";
	var htmlClass = "class='invalidTask'";

	if (task.checkFn() && (task.finishFn == undefined || activeTask == undefined))
		htmlClass = "class='validTask'";

	html += "<button " + htmlClass;

	// Add onclick event and tooltip mouseover events
	if (task != undefined) {
		html += " onclick='doTask(\"" + task.name + "\")'";
		html += " onmouseover='showTooltip(this, \"" + task.name + "\")'";
		html += " onmouseout='hideTooltip()'";
	}

	// Add button label and closing tag
	html +=  ">" + task.name + "</button>";

	return html;
}

function openPopUp(populateFn) {
  document.getElementById("popUpBox").style.display = "block";
  populateFn();
}

function closePopUp() {
  document.getElementById("popUpBox").style.display = "none";
  document.getElementById("popUpContent").innerHTML = "";
}
