/*
  Contains all player data and functions for manipulating player data
  Authoritative source for all player information (ie. how many resources a player has)

  The player object should store all player-driven state changes and must be pure
  so player state can be stored properly.
*/

function Player() {
  this.name = "Michael Jackson";
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
    active: "laptop",
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
    oddJobs: {
      maxContracts: 5,
      numContracts: 0
    },
    laptop: {
      jobType: undefined,
      procMod: 1.0,
      moneyMod: 1.0,
      maxContracts: 3,
      numContracts: 0
    },
    keyboard: {
      jobType: undefined,
      procMod: 1.0,
      moneyMod: 1.0,
      maxContracts: 3,
      numContracts: 0
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
      oddJobsCompleted: 0
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
};

function addXp(skill, amount) {
  game.player.skills[skill].xp += amount;
  game.player.stats[skill].xpGained += amount;

  while (game.player.skills[skill].toNextLevel <= game.player.skills[skill].xp) {
    game.player.skills[skill].xp -= game.player.skills[skill].toNextLevel;
    game.player.skills[skill].level++;
    game.player.skills[skill].toNextLevel = Math.round(game.player.skills[skill].toNextLevel * game.player.skills[skill].nextLevelXpRatio);
    appendToOutputContainer("Your " + skill + " skill has reached level " + game.player.skills[skill].level + "!");
  }
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

function unlockAchievement(achievementId) {
  /*
    Add the given achievementId to the player object before initializing the
    achivement content. Once initialized, hide the lock icon and show the content.
  */
  game.player.achievements[achievementId] = 0;
  initAchievement(achievementId);
  showUiElement(achievementId + "AchievementLock", "none");
  showUiElement(achievementId + "ImgContainer", "block");
  showUiElement(achievementId + "ContentContainer", "block");
}

function initAchievement(achievementId) {
  /*
    Initialize the content for the given achievementId. Content populated
    (ie. description, flavor, goal amount) depends on the current rank of the
    achievement.

    If all ranks of the achievement have already been earned, update the
    description to communicate that to the player.
  */
  var achievement = game.achievements[achievementId];
  var rank = achievement.ranks[game.player.achievements[achievementId]];

  if (rank !== undefined) {
    var progress = document.getElementById(achievementId + "AchievementProgress");

    progress.max = achievement[rank].amount;
    document.getElementById(achievementId + "AchievementDescription").innerHTML = achievement[rank].description;
    document.getElementById(achievementId + "AchievementFlavor").innerHTML = achievement[rank].flavor;
  }
  else {
    var description = document.getElementById(achievementId + "AchievementDescription");
    description.innerHTML += " (All ranks completed!)";
  }
}

function awardAchievement(achievementId) {
  /*
    Award the player with the current rank of the given achievementId. Show the
    star for the appropriate rank (bronze, silver, gold or platinum) and
    increment the current rank by 1. Reinitialize the achievement to show the
    content for the new rank.
  */
  // TODO: Pop Up for Achievements
  var achievement = game.achievements[achievementId];
  var currentRank = achievement.ranks[game.player.achievements[achievementId]];

  if (currentRank !== undefined) {
    var starId = achievementId + capitalize(currentRank);

    showUiElement(starId, "block");
    game.player.achievements[achievementId] = game.player.achievements[achievementId] + 1;
    initAchievement(achievementId);
  }
}
