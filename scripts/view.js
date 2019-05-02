/*
  Contains generic functions for updating or manipulating the view
*/

var tickInterval;

/* View Update Functions */

function startTicking() {
  tickInterval = setInterval(naturalTick, 1000);
}

function naturalTick() {
  game.player.stats.timePlayed++;
  passiveResourceGeneration();
  updateActiveTask();
  adjustSongStats();
  updateView(true);
  saveGame();
}

function passiveResourceGeneration() {
  var progress = document.getElementById('laptopBeatProgress');
  var progressAmount = game.player.instruments.laptop.passiveProgress;
  var requiredProgress = Math.ceil(game.resources.beats.clicksPer * game.player.instruments.laptop.reqClicksMod);

  if (game.player.instruments.laptop.subgenre == "trance")
    progressAmount *= 2;

  updateProgress(progress, (progress.value + progressAmount), requiredProgress, partial(addResource, "beats"));
}

function updateView(natural) {
  checkTriggers(natural);
  updateResourcesTab();
  updateSongsTab();
  updateTasks();
  updateSkills();
}

function updateResourcesTab() {
  for (var resource in game.resources) {
    var amount = game.player.resources[resource];

    if (resource == "money")
      amount = "$" + round(amount, 2);

    document.getElementById(resource + "Amount").innerHTML = amount;

    var requiredResource = game.resources[resource].requiredResource;

    if (requiredResource !== undefined) {
      var cost = game.resources[resource].resourcesPer;
      var numReqResource = game.player.resources[requiredResource];

      modifyResourceNumber(resource, cost, numReqResource);
      modifyResourceNumber(resource, cost, numReqResource, 1);
      modifyResourceNumber(resource, cost, numReqResource, 10);
      modifyResourceNumber(resource, cost, numReqResource, 100);
    }
  }
}

function updateSongsTab() {
  var totalRevenue = 0;
  var html = "";
  var songContext = getTask("Make New Song");
  var newSongButton = "";

  if (songContext != undefined) {
    newSongButton = makeTaskButton(songContext);
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
  var contexts = game.player.tasks;

  contexts.forEach(function(context) {
    if (context.taskName != "Make New Song")
      html += makeTaskButton(context);
  });

  document.getElementById('tasks').innerHTML = "<p>Tasks</p>" + html;
}

function updateSkills() {
  document.getElementById('laptopLevel').innerHTML = game.player.skills.laptop.level;
  document.getElementById('vocalLevel').innerHTML = game.player.skills.vocal.level;
  document.getElementById('keyboardLevel').innerHTML = game.player.skills.keyboard.level;
  document.getElementById('guitarLevel').innerHTML = game.player.skills.guitar.level;
  document.getElementById('drumLevel').innerHTML = game.player.skills.drum.level;

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

/*
  ---- Event Handlers -----
*/

function openPopUp(populateFn, taskName) {
  /*
    Opens the popup box and calls the passed in populateFn, which should,
    determine the popup box content.

    If this was called by a task, you can optionally pass in the taskName to the
    populateFn.
  */
  showUiElement("popUpBlocker", "block");
  showUiElement("popUpBox", "block");
  populateFn(taskName);
}

function closePopUp() {
  /*
    Closes the popup box and clears its contents.
  */
  showUiElement("popUpBlocker", "none");
  showUiElement("popUpBox", "none");
  document.getElementById("popUpContent").innerHTML = "";
}

function startInstrument(instrument) {
  // Enables event listeners and animations for respective instrument
  switch (instrument) {
    case "laptop":
      startLaptop();
      game.player.activeInstrument = "laptop";
      break;
    case "keyboard":
      startKeyboard();
      game.player.activeInstrument = "keyboard";
      break;
  }
}

function showTooltip(obj, taskName) {
  var offsets = getOffsets(obj);
  var tooltip = document.getElementById('tooltip');
  var context = getTask(taskName);
  var task = getTaskDetails(context);
  var html = "<div id='tooltipHeader'>" + task.tooltip.description + "</div>";

  for (var key in task.tooltip.cost) {
    html += "<div class='tooltipPriceInfo'>" +
      "<p class='tooltipResource'>" + key + "</p>" +
      "<p class='tooltipCost'>" + task.tooltip.cost[key] + "</p>" +
      "</div>";
  };

  if (task.tooltip.flavor !== undefined) {
    html += "<div class='tooltipFlavor'>" + task.tooltip.flavor + "</div>";
  }

  tooltip.innerHTML = html;
  tooltip.style.left = offsets.left - (obj.offsetWidth / 3);
  tooltip.style.top = offsets.top + obj.offsetHeight + 5;
  tooltip.style.display = "inline";
}

function hideTooltip() {
  document.getElementById('tooltip').style.display = "none";
}

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

  startInstrument(instrument);

  // Show the new instrument content, and make the new instrument 'active',
  document.getElementById(instrument).style.display = "block";
  evt.currentTarget.className = "activeInstrument";
}

/* Helper Functions */

function getOffsets(e) {
  var offsets = e.getBoundingClientRect();

  return {
    left: offsets.left + window.scrollX,
    right: offsets.right + window.scrollX,
    top: offsets.top + window.scrollY
  };
}

function modifyResourceNumber(resource, cost, numReqResource, amount) {
  var htmlObj;

  if (amount == undefined) {
    amount = Math.floor(numReqResource / cost);
    htmlObj = document.getElementById(resource + "All");
  } else {
    htmlObj = document.getElementById(resource + amount);
  }

  if (numReqResource >= cost * amount && amount > 0) {
    htmlObj.innerHTML = amount;
    htmlObj.onclick = function() {
      addResource(resource, amount)
    };
  } else {
    htmlObj.innerHTML = "-";
    htmlObj.removeAttribute("onclick");
  }
}

function makeTaskButton(context) {
  var html = "";
  var htmlClass = "class='invalidTask'";
  var task = getTaskDetails(context);

  if ((task.checkFns == undefined || runCheckFns(task)) && (task.timeToComplete == undefined || game.player.activeTask == undefined))
    htmlClass = "class='validTask'";

  html += "<button " + htmlClass;

  // Add onclick event and tooltip mouseover events
  html += " onclick='doTask(\"" + task.name + "\")'";
  html += " onmouseover='showTooltip(this, \"" + task.name + "\")'";
  html += " onmouseout='hideTooltip()'";

  // Add button label and closing tag
  html += ">" + task.name + "</button>";

  return html;
}
