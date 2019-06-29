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
  this.achievements = [];
  this.instruments = {
    active: "laptop",
    laptop: {
      level: 1,
      currentTempo: "slow",
      reqClicksMod: 1.0,
      multiplier: 1,
      bonusMaxMultiplier: 0,
      passiveProgress: 0,
      subgenre: undefined,
      unexploredSubgenres: ["trance", "house", "drumAndBass", "hardstyle", "electro", "industrial", "dubstep"],
      dropActive: false
    },
    keyboard: {
      currentNote: undefined,
      currentSong: undefined,
      reqClicksMod: 1.0,
      multiplier: 1,
      bonusMaxMultiplier: 0,
      passiveProgress: 0
    },
  };
  this.studies = {
    laptop: {
      xpMod: 1.0
    }
  };
  this.jobs = {
    laptop: {
      procMod: 1.0,
      moneyMod: 1.0
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
    timePlayed: 0, // in seconds
    fame: {
      lifetime: 0
    },
    money: {
      lifetime: 0
    },
    beats: {
      lifetime: 0
    },
    samples: {
      lifetime: 0
    },
    notes: {
      lifetime: 0
    },
    measures: {
      lifetime: 0
    }
  };
};

function addXp(skill, amount) {
  game.player.skills[skill].xp += amount;
  while (game.player.skills[skill].toNextLevel <= game.player.skills[skill].xp) {
    game.player.skills[skill].xp -= game.player.skills[skill].toNextLevel;
    game.player.skills[skill].level++;
    game.player.skills[skill].toNextLevel = Math.round(game.player.skills[skill].toNextLevel * game.player.skills[skill].nextLevelXpRatio);
    appendToOutputContainer("Your " + skill + " skill has reached level " + game.player.skills[skill].level + "!");
  }
}

function addResource(resource, amount) {
  if (amount == undefined)
    amount = 1;

  var requiredResource = game.resources[resource].requiredResource;

  if (requiredResource !== undefined) {
    var totalCost = game.resources[resource].resourcesPer * amount;
    var currentAmount = game.player.resources[requiredResource].amount;

    if (totalCost <= currentAmount)
      removeResource(requiredResource, totalCost);
    else
      return;
  }

  game.player.resources[resource].amount += amount;
  game.player.stats[resource].lifetime += amount;

  var relevantSkill = game.resources[resource].instrument;

  if (relevantSkill !== undefined) {
    var xpAmount = (game.resources[resource].xpPer + game.player.resources[resource].bonusXp) * amount;
    addXp(relevantSkill, xpAmount);
  }

  updateView();
}

function removeResource(resource, amount) {
  if (amount == undefined)
    amount = 1;

  game.player.resources[resource].amount -= amount;
  updateView();
}
