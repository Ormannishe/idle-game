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
  game.player.instruments.laptop.currentProgress = progress.value;
}

function updateView(natural) {
  checkTriggers(natural);
  updateResourcesTab();
  updateSongsTab();
  updateTasks();
  updateJobs();
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
  var songTask = getTask("Make New Song");

  if (songTask != undefined) {
    if (checkTask(songTask)) {
      document.getElementById("newSongButton").classList.add("validTask");
      document.getElementById("newSongButton").classList.remove("invalidTask");
    }
    else {
      document.getElementById("newSongButton").classList.add("invalidTask");
      document.getElementById("newSongButton").classList.remove("validTask");
    }
  }

  document.getElementById("songsList").innerHTML = "";

  game.player.songs.forEach(function(song) {
    var data = {
      name: song.name,
      quality: song.quality,
      popularity: song.popularity,
      revenue: round(song.moneyPerSec * 60, 2),
      earnings: round(song.totalEarnings, 2)
    };

    $("#songsList").append(Mustache.render($("#songTemplate").html(), data));

    totalRevenue += song.totalEarnings;
  });

  document.getElementById("totalSongRevenue").innerHTML = "Total Song Revenue: $" + round(totalRevenue, 2);
}

function updateTasks() {
  var contexts = game.player.tasks;

  updateTaskContent("upgradeContainer", contexts);
  updateTaskContent("laptopStudyTasks", contexts, "study", "laptop");
  updateTaskContent("keyboardStudyTasks", contexts, "study", "keyboard");
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
}

function updateStudyStats(instrument) {
  document.getElementById(instrument + "StudyXp").innerHTML = "XP Modifier: " + Math.round(game.player.studies[instrument].xpMod * 100) + "%";
  document.getElementById(instrument + "StudyCost").innerHTML = "Cost Modifier: " + Math.round(game.player.studies[instrument].costMod * 100) + "%";
}

function updateJobs() {
  var template = "#jobTemplate";
  var contractDisplay = document.getElementById("numContractsDisplay");
  var jobContainer = document.getElementById("jobsContainer");
  var activeTask = game.player.activeTask;

  // Remove existing contract divs
  while (jobContainer.firstChild) {
    jobContainer.removeChild(jobContainer.firstChild);
  };

  // Update the display for the number of active contracts
  contractDisplay.innerHTML = "Available Contracts: " + game.player.jobs.numContracts + "/" + game.player.jobs.maxContracts;

  // Stylize the display for the number of active contracts
  if (game.player.jobs.numContracts == game.player.jobs.maxContracts)
    contractDisplay.style.color = "red";
  else
    contractDisplay.style.color = "white";

  // If no contracts are available, display a message in the jobsContainer
  if (game.player.jobs.numContracts == 0 ||
      game.player.jobs.numContracts == 1 && activeTask !== undefined && activeTask.taskType == "job") {
    document.getElementById("noJobsLabel").style.display = "block";
  }
  else {
    document.getElementById("noJobsLabel").style.display = "none";
  }

  // Recreate the contract divs with updated content and remove expired job tasks
  for (var i = 0; i < game.player.tasks.length; i++) {
    var context = game.player.tasks[i];

    if (context.taskType == "job") {
      if (context.timeToExpiration > 0) {
        var task = getTaskFromContext(context);
        var data = {
          name: task.name,
          fame: task.jobFame,
          instrument: (task.instrument == "noInstrument" ? "none" : task.instrument),
          wage: "$" + task.jobWage,
          experience: task.jobExperience,
          timeToComplete: secondsToMinuteSeconds(task.timeToComplete),
          flavor: task.jobFlavor,
          offerTime: secondsToMinuteSeconds(task.timeToExpiration)
        };

        $("#jobsContainer").append(Mustache.render($(template).html(), data));

        if (task.jobLevel >= 1)
          document.getElementById(task.name + "LevelOne").style.display = "block";

        if (task.jobLevel >= 2)
          document.getElementById(task.name + "LevelTwo").style.display = "block";

        if (task.jobLevel >= 3)
          document.getElementById(task.name + "LevelThree").style.display = "block";

        if (task.timeToExpiration < 60)
          document.getElementById(task.name + "JobOfferTime").style.color = "red";

        game.player.tasks[i].timeToExpiration--;
      }
      else {
        removeContract(context.taskName);
      }
    }
  }
}

function updateCharacterStats() {
  updateSkills();
  updateStats();
  updateAchievements();
}

function updateSkills() {
  document.getElementById('playerLevel').innerHTML = "( Level " + game.player.level + " )";
  document.getElementById('laptopLevel').innerHTML = game.player.skills.laptop.level;
  document.getElementById('vocalLevel').innerHTML = game.player.skills.vocal.level;
  document.getElementById('keyboardLevel').innerHTML = game.player.skills.keyboard.level;
  document.getElementById('guitarLevel').innerHTML = game.player.skills.guitar.level;
  document.getElementById('drumLevel').innerHTML = game.player.skills.drum.level;

  updateProgress(document.getElementById('laptopSkillProgress'), game.player.skills.laptop.xp, game.player.skills.laptop.toNextLevel);
  updateProgress(document.getElementById('vocalSkillProgress'), game.player.skills.vocal.xp, game.player.skills.vocal.toNextLevel);
  updateProgress(document.getElementById('keyboardSkillProgress'), game.player.skills.keyboard.xp, game.player.skills.keyboard.toNextLevel);
  updateProgress(document.getElementById('guitarSkillProgress'), game.player.skills.guitar.xp, game.player.skills.guitar.toNextLevel);
  updateProgress(document.getElementById('drumSkillProgress'), game.player.skills.drum.xp, game.player.skills.drum.toNextLevel);
}

function updateStats() {
  var wrapInPTag = function(text, htmlClass) {
    return "<p class='" + htmlClass + "'>" + text + "</p>";
  };

  var generalStats = document.getElementById("generalStats");
  generalStats.innerHTML = wrapInPTag("General Stats", "statHeading");
  generalStats.innerHTML += wrapInPTag("Time Played: " + secondsToDhms(game.player.stats.general.timePlayed), "statRow");
  generalStats.innerHTML += wrapInPTag("Lifetime Fame: " + game.player.stats.general.fameLifetime, "statRow");
  generalStats.innerHTML += wrapInPTag("Lifetime Money: $" + round(game.player.stats.general.moneyLifetime, 2), "statRow");
  generalStats.innerHTML += wrapInPTag("Tasks/Upgrades Completed: " + game.player.stats.general.tasksCompleted, "statRow");
  generalStats.innerHTML += wrapInPTag("Songs Created: " + game.player.stats.general.songsCreated, "statRow");

  var laptopStats = document.getElementById("laptopStats");
  laptopStats.innerHTML = wrapInPTag("Laptop Stats", "statHeading");
  laptopStats.innerHTML += wrapInPTag("Lifetime Clicks: " + game.player.stats.laptop.clicks, "statRow");
  laptopStats.innerHTML += wrapInPTag("Lifetime Beats: " + game.player.stats.laptop.beatsLifetime, "statRow");
  laptopStats.innerHTML += wrapInPTag("Lifetime Samples: " + game.player.stats.laptop.samplesLifetime, "statRow");
  laptopStats.innerHTML += wrapInPTag("Times Studied: " + game.player.stats.laptop.studiesCompleted, "statRow");
  laptopStats.innerHTML += wrapInPTag("Contracts Completed: " + game.player.stats.laptop.workCompleted, "statRow");
  laptopStats.innerHTML += wrapInPTag("Money Made From Contracts: $" + game.player.stats.laptop.workMoney, "statRow");
  laptopStats.innerHTML += wrapInPTag("Total Experience: " + game.player.stats.laptop.xpGained, "statRow");

  var vocalStats = document.getElementById("vocalStats");
  vocalStats.innerHTML = wrapInPTag("Vocals Stats", "statHeading");
  vocalStats.innerHTML += wrapInPTag("Lifetime Solves: " + game.player.stats.vocal.problemsSolved, "statRow");
  vocalStats.innerHTML += wrapInPTag("Lifetime Lyrics: " + game.player.stats.vocal.lyricsLifetime, "statRow");
  vocalStats.innerHTML += wrapInPTag("Lifetime Stanzas: " + game.player.stats.vocal.stanzasLifetime, "statRow");
  vocalStats.innerHTML += wrapInPTag("Times Studied: " + game.player.stats.vocal.studiesCompleted, "statRow");
  vocalStats.innerHTML += wrapInPTag("Contracts Completed: " + game.player.stats.vocal.workCompleted, "statRow");
  vocalStats.innerHTML += wrapInPTag("Money Made From Contracts: $" + game.player.stats.vocal.workMoney, "statRow");
  vocalStats.innerHTML += wrapInPTag("Total Experience: " + game.player.stats.vocal.xpGained, "statRow");

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
  updateAchievementProgress("fame", game.player.stats.general.fameLifetime);
  updateAchievementProgress("money", game.player.stats.general.moneyLifetime);
  updateAchievementProgress("beats", game.player.stats.laptop.beatsLifetime);
  updateAchievementProgress("samples", game.player.stats.laptop.samplesLifetime);
  updateAchievementProgress("lyrics", game.player.stats.vocal.lyricsLifetime);
  updateAchievementProgress("stanzas", game.player.stats.vocal.stanzasLifetime);
  updateAchievementProgress("notes", game.player.stats.keyboard.notesLifetime);
  updateAchievementProgress("measures", game.player.stats.keyboard.measuresLifetime);
  updateAchievementProgress("songs", game.player.stats.general.songsCreated);
}

function updateAchievementProgress(achievementId, value) {
  /*
    Update the progress bar of the given achievementId to the given value.
    No updates will occur if the player hasn't unlocked the given achievement,
    or if the maximum rank for the achievement has already been earned.

    If the passed in value is greater than the maximum value for the progress
    bar (ie. the user has met the achievement requirement), award the achievement
    to the player.
  */
  if (game.player.achievements[achievementId] !== undefined) {
    var level = game.player.achievements[achievementId].level;
    var progress = document.getElementById(achievementId + "AchievementProgress");

    if (game.achievements[achievementId].ranks[level] !== undefined) {
      progress.value = value;

      if (value >= progress.max)
        awardAchievement(achievementId);
    }
    else {
      progress.value = progress.max;
    }
  }
}

function updateCharacterResource(resource) {
  /*
    Used to update the player's health or energy bars.
  */
  var resourceProgress = document.getElementById(resource + "Progress");

  resourceProgress.value = game.player[resource].current;
  resourceProgress.max = game.player[resource].max;
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

function firstInstrumentPopUp() {
  /*
    The pop up that displays when loading a new game for the first time,
    allowing the player to choose their starting instrument.

    This pop up can not be exited out of, otherwise the player will soft block
    their game.
  */
  var populateFn = function() {
    var html = "";
    var makeButton = function(instrument, htmlClass, label) {
      var onClick = "";

      if (label == undefined)
        label = capitalize(instrument);

      // Guitar and Drums are not implemented yet
      if (instrument !== "guitar" && instrument !== "drum") {
        onClick = "onclick='selectInstrument(\"" + instrument + "\")' ";
      }

      return "<button class='" + htmlClass + "' " +
             onClick +
             "onmouseover='instrumentTooltip(this, \"" + instrument + "\")' " +
             "onmouseout='hideTooltip()'" +
             ">" + label + "</button>";
    };

    html += "<p class='popUpHeader'>Welcome To Idle Game!</p>";
    html += "<div class='popUpRow'>";
    html += "<p class='popUpText'>Idle Game is an incremental RPG where you as the player work towards your goal of becoming a famous musician! To achieve fame and fortune, you must hone your skills with various instruments.</p>"
    html += "</div>";
    html += "<div class='popUpRow'>";
    html += "<p class='popUpText'>Each instrument comes with its own mini-game, providing its own unique resources, progression path, and story. Select an instrument below to begin your jouney!</p>"
    html += "</div>";
    html += "<div class='popUpRow'>";
    html += makeButton("laptop", "popUpButton");
    html += makeButton("vocal", "popUpButton", "Vocals");
    html += makeButton("keyboard", "popUpButton");
    html += makeButton("guitar", "disabledPopUpButton");
    html += makeButton("drum", "disabledPopUpButton", "Drums");
    html += "</div>";

    document.getElementById("popUpClose").style.display = "none";
    document.getElementById("popUpContent").innerHTML = html;
  }

  openPopUp(populateFn);
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

function loadGamePopUp() {
  var populateFn = function() {
    var html = "";

    html += "<p class='popUpHeader'>Please enter save string.</p>";
    html += "<div class='popUpRow'>";
    html += "<input id='loadGameInput' value=''></input>";
    html += "</div>";
    html += "<div class='popUpRow'>";
    html += "<button class='popUpButton' onclick='importSave()'>Load</button>";
    html += "</div>";

    document.getElementById("popUpContent").innerHTML = html;
  };

  openPopUp(populateFn);
}

function manageJobsPopUp() {
  var populateFn = function() {
    var html = "";
    var playerJobs = game.player.jobs;

    html += "<p class='popUpHeader'>Manage Jobs</p>";
    html += "<div class='popUpRow'>";
    html += "<p class='popUpText'>Uncheck boxes below for any contract types you wish to auto-decline.</p>"
    html += "</div>";

    for (var instrument in game.jobs) {
      if (playerJobs[instrument].unlockedJobTypes.length > 0) {
        var title = instrument == "noInstrument" ? "Non-Instrument" : instrument;

        html += "<div class='popUpRow'>";
        html += "<p class='popUpSubHeader'>" + capitalize(title) + " Contracts</p>"
        html += "</div>";
        html += "<div class='popUpRow'>";
        html += "<div class='popUpSubRow'>";

        for (var job in game.jobs[instrument]) {
          if (playerJobs[instrument].unlockedJobTypes.indexOf(job) > -1) {
            var htmlChecked = "";

            if (playerJobs[instrument].filteredJobTypes.indexOf(job) == -1) {
              htmlChecked = "checked=''";
            }

            html += "<input id='" + instrument + job + "Checkbox' " +
                    "class='popUpCheckbox' " +
                    "type='checkbox' " +
                    htmlChecked +
                    "onClick='" + onclick + "'" +
                    "></input>";

            html += "<p class='popUpSubText'>" + job + "</p>"
          }
        }
        html += "</div></div>";
      }
    }

    html += "<div class='popUpRow'>";
    html += "<button class='popUpButton' onclick='applyJobFilters()'>Done</button>";
    html += "</div>";

    document.getElementById("popUpContent").innerHTML = html;
  }

  openPopUp(populateFn);
}

function changeNamePopUp() {
  var populateFn = function() {
    var html = "";

    html += "<p class='popUpHeader'>Choose A Stage Name</p>";
    html += "<div class='popUpRow'>";
    html += "<input id='stageNameInput' value='" + game.player.name + "'></input>";
    html += "</div>";
    html += "<div class='popUpRow'>";
    html += "<button class='popUpButton' onclick='updateCharacterName()'>OK</button>";
    html += "</div>";

    document.getElementById("popUpContent").innerHTML = html;
  };

  openPopUp(populateFn);
}

function awardAchievementPopUp(achievementId) {
  var popUp = document.getElementById("achievementPopUp");
  var achievement = game.achievements[achievementId];
  var rank = achievement.ranks[game.player.achievements[achievementId].level];

  if (rank !== undefined) {
    // TODO: Change image
    document.getElementById("achievementPopUpDescription").innerHTML = achievement[rank].description;
    document.getElementById("achievementPopUpRank").classList.add(rank + "Rank");
    popUp.classList.remove("achievementPopUpAnimation");
    void popUp.offsetWidth; // css magic to allow replay of the animation
    popUp.classList.add("achievementPopUpAnimation");
  }
}

function startInstrument(instrument) {
  // Enables event listeners and animations for respective instrument
  game.player.instruments.active = instrument;

  switch (instrument) {
    case "laptop":
      startLaptop();
      break;
    case "vocal":
      startVocals();
      break;
    case "keyboard":
      startKeyboard();
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
  tooltip.style.width = "200px";
  tooltip.style.visibility = "visible";
}

function hideTooltip() {
  document.getElementById('tooltip').style.visibility = "hidden";
}

function instrumentTooltip(obj, instrument) {
  var offsets = getOffsets(obj);
  var tooltipLeft = offsets.left - obj.offsetWidth - 15;
  var obj = document.getElementById('fameTooltip');
  var tooltip = document.getElementById('tooltip');
  var html;
  var text;

  switch (instrument) {
    case "laptop":
      text = "The instrument of a modern day DJ. Utilize your laptop to produce sick beats, and combine your beats together to form short samples. Legend has it, only the most skilled DJs will uncover the secrets of the DJ Society.";
      break;
    case "vocal":
      text = "A unique and versatile instrument - one everyone is born with. Sing lyrics that will make crowds overflow with emotion, and combine lyrics into poetic stanzas that tell a story.";
      break;
    case "keyboard":
      text = "A classic instrument, used by the world's greatest artists to produce beautiful music. Record each note diligently, and string together multiple notes to form measures. Be sure to stay in time, and listen to the careful ticking of the metronome.";
      break;
    case "guitar":
      text = "Coming Soon!";
      break;
    case "drum":
      text = "Coming Soon!";
      break;
    default:
      break;
  }

  html = "<div id='tooltipHeader'>" + text + "</div>";

  tooltip.innerHTML = html;
  tooltip.style.top = offsets.top + obj.offsetHeight + 30;
  tooltip.style.left = tooltipLeft;
  tooltip.style.width = "400px";
  tooltip.style.visibility = "visible";

  var tooltipHeader = document.getElementById('tooltipHeader');
  tooltipHeader.style.borderBottom = "none";
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

  if (activeTab !== undefined)
    activeTab.className = groupId;

  tab.className = groupId + "Active";
  tabContent.style.display = "block";

  if (groupId == "instrument") {
    stopLaptop();
    stopKeyboard();
    stopVocals();
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

function resourceCreatedAnimation(numResource, instrument) {
  var htmlObj = document.getElementById(instrument + "ResourceNumber");
  var colorMap = getColorFromRange(numResource, 1, 10);

  htmlObj.innerHTML = "+" + numResource;
  htmlObj.style.color = "rgb(" + colorMap.red + "," + colorMap.green + "," + colorMap.blue + ")";
  htmlObj.classList.remove("createdResourceAnimation");
  void htmlObj.offsetWidth; // css magic to allow replay of the animation
  htmlObj.classList.add("createdResourceAnimation");
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
  var data = {
    name: task.name,
    class: "invalidTask",
  };

  if ((task.checkFns == undefined || checkTask(task)) && (task.timeToComplete == undefined || game.player.activeTask == undefined))
    data.class = "validTask";

  return Mustache.render($("#taskButtonTemplate").html(), data);
}
