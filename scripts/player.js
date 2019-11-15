/*
  Contains all player data and functions for manipulating player data
  Authoritative source for all player information (ie. how many resources a player has)

  The player object should store all player-driven state changes and must be pure
  so player state can be stored properly.
*/

function Player() {
  this.name = "Michael Jackson";
  this.health = {
    current: 10,
    max: 10
  };
  this.energy = {
    current: 100,
    max: 100
  };
  this.level = 1;
  this.triggers = [];
  this.tasks = [];
  this.completedTasks = [];
  this.activeTask = undefined;
  this.resources = {
    fame: {
      amount: 0
    },
    money: {
      amount: 0
    },
    beats: {
      amount: 0,
      bonusXp: 0
    },
    samples: {
      amount: 0,
      bonusXp: 0
    },
    lyrics: {
      amount: 0,
      bonusXp: 0
    },
    stanzas: {
      amount: 0,
      bonusXp: 0
    },
    notes: {
      amount: 0,
      bonusXp: 0
    },
    measures: {
      amount: 0,
      bonusXp: 0
    }
  };
  this.songs = [];
  this.albums = [];
  this.achievements = {};
  this.instruments = {
    active: undefined,
    laptop: {
      level: 1,
      currentTempo: "slow",
      reqClicksMod: 1.0,
      multiplier: 1,
      bonusMaxMultiplier: 0,
      passiveProgress: 0,
      currentProgress: 0,
      subgenre: undefined,
      unlockedSubgenres: [],
      dropActive: false
    },
    vocal: {
      problemAmplitude: 20,
      solutionAmplitude: 30,
      problemFrequency: 20,
      solutionFrequency: 30,
      problemFrames: 0,
      reqClicksMod: 1.0,
      multiplier: 1,
      bonusMaxMultiplier: 0,
      passiveProgress: 0,
      currentProgress: 0
    },
    keyboard: {
      currentNote: undefined,
      currentSong: undefined,
      reqClicksMod: 1.0,
      multiplier: 1,
      bonusMaxMultiplier: 0,
      passiveProgress: 0,
      currentProgress: 0
    }
  };
  this.studies = {
    laptop: {
      xpMod: 1.0,
      costMod: 1.0
    },
    keyboard: {
      xpMod: 1.0,
      costMod: 1.0
    }
  };
  this.jobs = {
    numContracts: 0,
    maxContracts: 5,
    laptop: {
      procMod: 1.0,
      moneyMod: 1.0,
      unlockedJobTypes: [],
      filteredJobTypes: []
    },
    vocal: {
      procMod: 1.0,
      moneyMod: 1.0,
      unlockedJobTypes: [],
      filteredJobTypes: []
    },
    keyboard: {
      procMod: 1.0,
      moneyMod: 1.0,
      unlockedJobTypes: [],
      filteredJobTypes: []
    },
    noInstrument: {
      procMod: 1.0,
      moneyMod: 1.0,
      unlockedJobTypes: ["oddJobs"],
      filteredJobTypes: []
    }
  };
  this.skills = {
    laptop: {
      xp: 0,
      level: 1,
      toNextLevel: 100,
      nextLevelXpRatio: 1.3
    },
    vocal: {
      xp: 0,
      level: 1,
      toNextLevel: 100,
      nextLevelXpRatio: 1.3
    },
    keyboard: {
      xp: 0,
      level: 1,
      toNextLevel: 100,
      nextLevelXpRatio: 1.3
    },
    guitar: {
      xp: 0,
      level: 1,
      toNextLevel: 100,
      nextLevelXpRatio: 1.3
    },
    drum: {
      xp: 0,
      level: 1,
      toNextLevel: 100,
      nextLevelXpRatio: 1.3
    }
  };
  this.stats = {
    general: {
      timePlayed: 0, // in seconds
      fameLifetime: 0,
      moneyLifetime: 0,
      tasksCompleted: 0,
      songsCreated: 0
    },
    laptop: {
      clicks: 0,
      beatsLifetime: 0,
      samplesLifetime: 0,
      studiesCompleted: 0,
      workCompleted: 0,
      workMoney: 0,
      xpGained: 0
    },
    vocal: {
      problemsSolved: 0,
      lyricsLifetime: 0,
      stanzasLifetime: 0,
      studiesCompleted: 0,
      workCompleted: 0,
      workMoney: 0,
      xpGained: 0
    },
    keyboard: {
      keyPresses: 0,
      notesLifetime: 0,
      measuresLifetime: 0,
      studiesCompleted: 0,
      workCompleted: 0,
      workMoney: 0,
      xpGained: 0
    }
  };
  this.options = {
    progressNumbers: false,
    compactAchievements: false
  }
};

function updateCharacterName(name) {
  if (name == undefined) {
    name = document.getElementById("stageNameInput").value;
    closePopUp();
  }

  if (name !== undefined && name !== "") {
    game.player.name = name;
    document.getElementById("stageName").innerHTML = game.player.name;
  }
}

function applyJobFilters() {
  /*
    To be called before closing the job management pop up.
    Updates the player's job filter lists in accordance with the checkboxes they
    have selected in the job management pop up.

    Closes the pop up box on completion.
  */
  var playerJobs = game.player.jobs;

  for (var instrument in game.jobs) {
    game.player.jobs[instrument].filteredJobTypes = [];

    for (var job in game.jobs[instrument]) {
      if (playerJobs[instrument].unlockedJobTypes.indexOf(job) > -1) {
        var checkbox = document.getElementById(instrument + job + "Checkbox");

        if (checkbox.checked == false) {
          game.player.jobs[instrument].filteredJobTypes.push(job);
        }
        else {
          var index = game.player.jobs[instrument].filteredJobTypes.indexOf(job);

          if (index > -1)
            game.player.jobs[instrument].filteredJobTypes.splice(index, 1);
        }
      }
    }
  }

  closePopUp();
}

function removeCharacterResource(resource, amount) {
  /*
    Character resources are resources that belong specifically to the character.
    ie. Health and Energy
  */
  var resourceProgress = document.getElementById(resource + "Progress");

  game.player[resource].current -= amount;
  updateCharacterResource(resource);
}

function addResource(resource, amount) {
  var instrument = game.resources[resource].instrument;
  var requiredResource = game.resources[resource].requiredResource;

  if (amount == undefined)
    amount = 1;

  if (requiredResource !== undefined) {
    var totalCost = game.resources[resource].resourcesPer * amount;
    var currentAmount = game.player.resources[requiredResource].amount;

    if (totalCost <= currentAmount)
      removeResource(requiredResource, totalCost);
    else
      return;
  }

  game.player.resources[resource].amount += amount;

  if (instrument !== undefined)
    game.player.stats[instrument][resource + "Lifetime"] += amount;
  else
    game.player.stats.general[resource + "Lifetime"] += amount;

  if (instrument !== undefined) {
    var xpAmount = (game.resources[resource].xpPer + game.player.resources[resource].bonusXp) * amount;
    addXp(instrument, xpAmount);
  }

  updateView();
}

function removeResource(resource, amount) {
  if (amount == undefined)
    amount = 1;

  game.player.resources[resource].amount -= amount;
  updateView();
}

function addXp(skill, amount) {
  if (skill !== "noInstrument") {
    if (amount == undefined)
      amount = 1;

    game.player.skills[skill].xp += amount;
    game.player.stats[skill].xpGained += amount;

    while (game.player.skills[skill].toNextLevel <= game.player.skills[skill].xp) {
      game.player.skills[skill].xp -= game.player.skills[skill].toNextLevel;
      game.player.skills[skill].level++;
      game.player.level++;
      game.player.skills[skill].toNextLevel = Math.round(game.player.skills[skill].toNextLevel * game.player.skills[skill].nextLevelXpRatio);
      appendToOutputContainer("Your " + skill + " skill has reached level " + game.player.skills[skill].level + "!");
    }
  }
}

/*
  ---- Achievements -----
*/

function initAchievements() {
  /*
    Initializes all of the achievements in the game object by creating the HTML
    objects to be appended to the achievementContent container.

    Hidden achievements are not inialized unless they have already been earned,
    and are to be inialized when they are unlocked.
  */
  for (var key in game.achievements) {
    var achievement = game.achievements[key];

    if (game.player.achievements[key] !== undefined || !achievement.hidden)
      initAchievement(key);
  };
}

function initAchievement(achievementId) {
  /*
    Initialize the content for the given achievementId and creates an HTML
    object based on the achievement Mustache Template. Once created, the object
    is appended to the achievementContent container.
  */
  var template = "#achievementTemplate";
  var rank = game.achievements[achievementId].ranks[0];
  var data = {
    name: achievementId,
    amount: game.achievements[achievementId][rank].amount,
    description: game.achievements[achievementId][rank].description,
    flavor: game.achievements[achievementId][rank].flavor
  };

  if (game.player.options.compactAchievements == true) {
    template = "#smallAchievementTemplate";
  }

  $("#achievementContent").append(Mustache.render($(template).html(), data));

  if (game.player.achievements[achievementId] !== undefined)
    updateAchievement(achievementId, game.player.achievements[achievementId].level);
}

function unlockAchievement(achievementId) {
  /*
    Add the given achievementId to the player object before hiding the lock icon
    and showing the achievement content.

    If the achievement is a hidden achievement, it needs to be initialized
  */
  if (game.achievements[achievementId].hidden)
    initAchievement(achievementId);

  game.player.achievements[achievementId] = {level: 0};
  showUiElement(achievementId + "AchievementLock", "none");
  showUiElement(achievementId + "ImgContainer", "block");
  showUiElement(achievementId + "ContentContainer", "block");
}

function awardAchievement(achievementId) {
  /*
    Award the player with the current rank star for the given achievementId and
    trigger the achievement animation.
    Increase the player's achievement level and show the content for the next
    rank (if available).
  */
  var achievement = game.achievements[achievementId];
  var level = game.player.achievements[achievementId].level;
  var rank = achievement.ranks[level];

  if (rank !== undefined) {
    var starId = achievementId + capitalize(rank);

    showUiElement(starId, "block");
    awardAchievementPopUp(achievementId);
    game.player.achievements[achievementId].level = level + 1;
    updateAchievement(achievementId, level + 1);
  }
}

function updateAchievement(achievementId, level) {
  /*
    Update the content for the given achievementId to reflect the rank
    associated with the given level (ie. description, flavor, goal amount).

    If all ranks of the achievement have already been earned, update the
    description to communicate that to the player.
  */
  var achievement = game.achievements[achievementId];
  var rank = achievement.ranks[level];
  var progress = document.getElementById(achievementId + "AchievementProgress");

  if (rank !== undefined) {
    progress.max = achievement[rank].amount;
    document.getElementById(achievementId + "AchievementDescription").innerHTML = achievement[rank].description;

    if (game.player.options.compactAchievements !== true)
      document.getElementById(achievementId + "AchievementFlavor").innerHTML = achievement[rank].flavor;
  }
  else {
    var description = document.getElementById(achievementId + "AchievementDescription");
    var prevRank = achievement.ranks[level - 1];

    description.innerHTML = achievement[prevRank].description + " (All ranks completed!)";
    progress.value = progress.max;
  }
}
