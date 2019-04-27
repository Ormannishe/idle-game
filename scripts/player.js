/*
  Contains all player data and functions for manipulating player data
  Authoritative source for all player information (ie. how many resources a player has)
*/

function Player() {
  this.name = "Michael Jackson";
  this.triggers = new Set();
  this.tasks = [];
  this.activeTask = undefined;
  this.resources = {
    fame: 0,
    money: 0,
    beats: 0,
    samples: 0,
    notes: 0,
    measures: 0,
  };
  this.songs = [];
  this.albums = [];
  this.achievements = [];
  this.bonuses = {
    laptop: {
      reqClicksMod: 1.0,
      multiplier: 1,
      maxMultiplier: 10,
      passiveProgress: 0,
      subgenre: undefined,
      unexploredSubgenres: ["trance", "house", "drumAndBass", "hardstyle", "electro", "industrial", "dubstep"]
    },
    keyboard: {
      reqClicksMod: 1.0,
      multiplier: 1,
      maxMultiplier: 10,
      passiveProgress: 0
    },
    event: {
      oddJobs: {
        bonusChance: 0
      },
      djParty: {
        bonusChance: 0
      },
      djNightclub: {
        bonusChance: 0
      }
    },
  };
  this.skills = {
    laptop: {
      xp: 0,
      level: 1,
      toNextLevel: 100,
      nextLevelXpRatio: 1.2
    },
    vocal: {
      xp: 0,
      level: 1,
      toNextLevel: 100,
      nextLevelXpRatio: 1.2
    },
    keyboard: {
      xp: 0,
      level: 1,
      toNextLevel: 100,
      nextLevelXpRatio: 1.2
    },
    guitar: {
      xp: 0,
      level: 1,
      toNextLevel: 100,
      nextLevelXpRatio: 1.2
    },
    drum: {
      xp: 0,
      level: 1,
      toNextLevel: 100,
      nextLevelXpRatio: 1.2
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
    var currentAmount = game.player.resources[requiredResource];

    if (totalCost <= currentAmount)
      removeResource(requiredResource, totalCost);
    else
      return;
  }

  game.player.resources[resource] += amount;
  game.player.stats[resource].lifetime += amount;

  var relevantSkill = game.resources[resource].instrument;

  if (relevantSkill !== undefined)
    addXp(relevantSkill, (game.resources[resource].xpPer * amount));

  updateView();
}

function removeResource(resource, amount) {
  if (amount == undefined)
    amount = 1;

  game.player.resources[resource] -= amount;
  updateView();
}
