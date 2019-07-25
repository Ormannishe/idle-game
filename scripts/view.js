/*
  Contains generic functions for updating or manipulating the view
*/

var tickInterval;

/* View Update Functions */

function startTicking() {
  tickInterval = setInterval(naturalTick, 1000);
}

function naturalTick() {
  game.player.stats.general.timePlayed++;
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

  updateProgress(progress, (progress.value + progressAmount), requiredProgress, partial(addResource, "beats"));
}

function updateView(natural) {
  checkTriggers(natural);
  updateResourcesTab();
  updateSongsTab();
  updateTasks();
  updateCharacterStats();
}

function updateResourcesTab() {
  for (var resource in game.resources) {
    var amount = game.player.resources[resource].amount;

    if (resource == "money")
      amount = "$" + round(amount, 2);

    document.getElementById(resource + "Amount").innerHTML = amount;

    var requiredResource = game.resources[resource].requiredResource;

    if (requiredResource !== undefined) {
      var cost = game.resources[resource].resourcesPer;
      var numReqResource = game.player.resources[requiredResource].amount;

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

  document.getElementById('songsContent').innerHTML = html;
}

function updateTasks() {
  var contexts = game.player.tasks;

  updateTaskContent("upgradeContainer", contexts);
  updateTaskContent("laptopStudyTasks", contexts, "study", "laptop");
  updateTaskContent("keyboardStudyTasks", contexts, "study", "keyboard");
  updateTaskContent("oddJobTasks", contexts, "job", "none");
  updateTaskContent("laptopJobTasks", contexts, "job", "laptop");
  updateTaskContent("keyboardJobTasks", contexts, "job", "keyboard");
}

function updateTaskContent(contentId, contexts, taskType, instrument) {
  var html = "";
  var filteredContexts = contexts.filter(function(context) {
    if (taskType == undefined && context.taskType == taskType && context.taskName != "Make New Song")
      return context;
    else if (context.taskType == taskType && context.instrument == instrument)
      return context;
  });

  filteredContexts.forEach(function(context) {
    var task = getTaskFromContext(context);
    var taskButton = makeTaskButton(task);

    html += taskButton;
  });

  document.getElementById(contentId).innerHTML = html;

  if (taskType == "study")
    updateStudyStats(instrument);
  else if (taskType == "job" && instrument !== "none")
    updateJobStats(instrument);
}

function updateStudyStats(instrument) {
  document.getElementById(instrument + "StudyXp").innerHTML = "XP Modifier: " + Math.round(game.player.studies[instrument].xpMod * 100) + "%";
  document.getElementById(instrument + "StudyCost").innerHTML = "Cost Modifier: " + Math.round(game.player.studies[instrument].costMod * 100) + "%";
}

function updateJobStats(instrument) {
  var jobType = game.player.jobs[instrument].jobType;

  if (jobType !== undefined) {
    var jobAttributes = game.jobs[instrument][jobType];
    var avgFame = jobAttributes.baseFame + (jobAttributes.variableFame / 2);
    var avgPay = (jobAttributes.basePay + (jobAttributes.variablePay / 2)) * game.player.jobs[instrument].moneyMod;
    var occurance = getJobChance(instrument, jobType);

    document.getElementById(instrument + "JobFame").innerHTML = "Average Fame: " + Math.round(avgFame);
    document.getElementById(instrument + "JobWage").innerHTML = "Average Wage: $" + Math.round(avgPay);
    document.getElementById(instrument + "JobProc").innerHTML = "Average Occurance: " + occurance + " sec";
  }
}

function updateCharacterStats() {
  updateSkills();
  updateStats();
  updateAchievements();
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

function updateStats() {
  var wrapInPTag = function(text, htmlClass) {
    return "<p class='" + htmlClass + "'>" + text + "</p>";
  };

  var generalStats = document.getElementById("generalStats");
  generalStats.innerHTML = wrapInPTag("General Stats", "statHeading");
  generalStats.innerHTML += wrapInPTag("Time Played: " + secondsToDhms(game.player.stats.general.timePlayed), "statRow");
  generalStats.innerHTML += wrapInPTag("Lifetime Fame: " + game.player.stats.general.fameLifetime, "statRow");
  generalStats.innerHTML += wrapInPTag("Lifetime Money: $" + game.player.stats.general.moneyLifetime, "statRow");
  generalStats.innerHTML += wrapInPTag("Tasks/Upgrades Completed: " + game.player.stats.general.tasksCompleted, "statRow");
  generalStats.innerHTML += wrapInPTag("Odd Jobs Completed: " + game.player.stats.general.oddJobsCompleted, "statRow");

  var laptopStats = document.getElementById("laptopStats");
  laptopStats.innerHTML = wrapInPTag("Laptop Stats", "statHeading");
  laptopStats.innerHTML += wrapInPTag("Lifetime Clicks: " + game.player.stats.laptop.clicks, "statRow");
  laptopStats.innerHTML += wrapInPTag("Lifetime Beats: " + game.player.stats.laptop.beatsLifetime, "statRow");
  laptopStats.innerHTML += wrapInPTag("Lifetime Samples: " + game.player.stats.laptop.samplesLifetime, "statRow");
  laptopStats.innerHTML += wrapInPTag("Times Studied: " + game.player.stats.laptop.studiesCompleted, "statRow");
  laptopStats.innerHTML += wrapInPTag("Contracts Completed: " + game.player.stats.laptop.workCompleted, "statRow");
  laptopStats.innerHTML += wrapInPTag("Money Made From Contracts: $" + game.player.stats.laptop.workMoney, "statRow");
  laptopStats.innerHTML += wrapInPTag("Total Experience: " + game.player.stats.laptop.xpGained, "statRow");

  var keyboardStats = document.getElementById("keyboardStats");
  keyboardStats.innerHTML = wrapInPTag("Keyboard Stats", "statHeading");
  keyboardStats.innerHTML += wrapInPTag("Lifetime Key Presses: " + game.player.stats.keyboard.keyPresses, "statRow");
  keyboardStats.innerHTML += wrapInPTag("Lifetime Notes: " + game.player.stats.keyboard.notesLifetime, "statRow");
  keyboardStats.innerHTML += wrapInPTag("Lifetime Measures: " + game.player.stats.keyboard.measuresLifetime, "statRow");
  keyboardStats.innerHTML += wrapInPTag("Times Studied: " + game.player.stats.keyboard.studiesCompleted, "statRow");
  keyboardStats.innerHTML += wrapInPTag("Contracts Completed: " + game.player.stats.keyboard.workCompleted, "statRow");
  keyboardStats.innerHTML += wrapInPTag("Money Made From Contracts: $" + game.player.stats.keyboard.workMoney, "statRow");
  keyboardStats.innerHTML += wrapInPTag("Total Experience: " + game.player.stats.keyboard.xpGained, "statRow");
}

function updateAchievements() {

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

function newGamePopUp() {
  var populateFn = function() {
    var html = "";

    html += "<p class='popUpHeader'>Are you sure you want to start a new game? All progress will be lost.</p>";
    html += "<div class='popUpRow'>";
    html += "<button class='popUpButton' onclick='newGame()'>Yes</button>";
    html += "<button class='popUpButton' onclick='closePopUp()'>No</button>";
    html += "</div>";

    document.getElementById("popUpContent").innerHTML = html;
  };

  openPopUp(populateFn);
}

function startInstrument(instrument) {
  // Enables event listeners and animations for respective instrument
  switch (instrument) {
    case "laptop":
      startLaptop();
      game.player.instruments.active = "laptop";
      break;
    case "keyboard":
      startKeyboard();
      game.player.instruments.active = "keyboard";
      break;
  }
}

function showTooltip(obj, taskName) {
  var offsets = getOffsets(obj);
  var tooltip = document.getElementById('tooltip');
  var tooltipLeft = offsets.left - (obj.offsetWidth / 3);
  var task = getTask(taskName);
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

  // Make sure tooltip doesn't go over the right side of the screen
  if (tooltipLeft + tooltip.offsetWidth - window.outerWidth > 0)
    tooltipLeft -= tooltipLeft + tooltip.offsetWidth - window.outerWidth;

  tooltip.innerHTML = html;
  tooltip.style.top = offsets.top + obj.offsetHeight + 5;
  tooltip.style.left = tooltipLeft;
  tooltip.style.visibility = "visible";
}

function hideTooltip() {
  document.getElementById('tooltip').style.visibility = "hidden";
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
  tooltip.style.visibility = "visible";

  var tooltipHeader = document.getElementById('tooltipHeader');
  tooltipHeader.style.borderBottom = "none";
}

function hideFameTooltip() {
  tooltip.style.width = "200px";
  hideTooltip();
}

function toggleTab(tabId, groupId) {
  /*
    Set the given tabId as the active tab and show its associated tabContent.
    Sets all other tabs of the same groupId to non-active, and hides their
    associated tabContent.

    If the groupId is 'instrument', starts the associated instrument and stops
    all others.
  */
  var tab = document.getElementById(tabId + "Tab");
  var tabContent = document.getElementById(tabId + "Content");
  var activeTab = document.getElementsByClassName(groupId + "Active")[0];
  var allTabContent = document.getElementsByClassName(groupId + "Content");

  // Hide all tabContent
  for (var i = 0; i < allTabContent.length; i++) {
    allTabContent[i].style.display = "none";
  }

  activeTab.className = groupId;
  tab.className = groupId + "Active";
  tabContent.style.display = "block";

  if (groupId == "instrument") {
    stopLaptop();
    stopKeyboard();
    startInstrument(tabId);
  }
}

function tabNotifyAnimation(tabId, activeTabClass) {
  if (document.getElementsByClassName(activeTabClass)[0].id !== tabId) {
    var tab = document.getElementById(tabId);
    tab.classList.remove("backgroundColorNotify");
    void tab.offsetWidth; // css magic to allow replay of the animation
    tab.classList.add("backgroundColorNotify");
  }
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

function makeTaskButton(task) {
  var html = "";
  var htmlClass = "class='invalidTask'";

  if ((task.checkFns == undefined || checkTask(task)) && (task.timeToComplete == undefined || game.player.activeTask == undefined))
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
