/*
  Contains all player data and functions for manipulating player data
  Authoritative source for all player information (ie. how many resources a player has)
*/

class Player {
  constructor() {
    this.name = "Michael Jackson";
    this.resources = { fame: 0,
                       money: 0,
                       beats: 0,
                       samples: 0,
                       notes: 0,
                       measures: 0,
                     };
    this.bonuses = { laptop: { multiplier: 1,
                               maxMultiplier: 10,
                               passiveProgress: 0,
                               subgenre: undefined,
                               unexploredSubgenres: ["trance", "house", "drumAndBass", "hardstyle", "electro", "industrial", "dubstep"]},
                     keyboard: { multiplier: 1,
                                 maxMultiplier: 10,
                                 passiveProgress: 0 }
                   };
    this.skills = { laptop: { xp: 0,
                              level: 1,
                              toNextLevel: 100,
                              nextLevelXpRatio: 1.2 },
                    vocal: { xp: 0,
                             level: 1,
                             toNextLevel: 100,
                             nextLevelXpRatio: 1.2 },
                    keyboard: { xp: 0,
                                level: 1,
                                toNextLevel: 100,
                                nextLevelXpRatio: 1.2 },
                    guitar: { xp: 0,
                              level: 1,
                              toNextLevel: 100,
                              nextLevelXpRatio: 1.2 },
                    drum: { xp: 0,
                            level: 1,
                            toNextLevel: 100,
                            nextLevelXpRatio: 1.2 }
                    };
    this.stats = { timePlayed: 0, // in seconds
                   fame: {lifetime: 0},
                   money: {lifetime: 0},
                   beats: {lifetime: 0},
                   samples: {lifetime: 0},
                   notes: {lifetime: 0},
                   measures: {lifetime: 0}
                 };
    this.songs = [];
    this.albums = [];
    this.achievements = [];
  }

  addXp(skill, amount) {
    this.skills[skill].xp += amount;
    while (this.skills[skill].toNextLevel <= this.skills[skill].xp) {
      this.skills[skill].xp = this.skills[skill].xp - this.skills[skill].toNextLevel;
      this.skills[skill].level++;
      this.skills[skill].toNextLevel = Math.round(this.skills[skill].toNextLevel * this.skills[skill].nextLevelXpRatio);
      appendToOutputContainer("Your " + skill + " skill has reached level " + this.skills[skill].level + "!");
    }
  }

  addResource(resource, amount) {
    if (amount == undefined)
      amount = 1;

    var requiredResource = game.resources[resource].requiredResource;

    if (requiredResource !== undefined) {
      var totalCost = game.resources[resource].resourcesPer * amount;
      var currentAmount = this.resources[requiredResource];

      if (totalCost <= currentAmount)
        this.removeResource(requiredResource, totalCost);
      else
        return;
    }

    this.resources[resource] += amount;
    this.stats[resource].lifetime += amount;

    var relevantSkill = game.resources[resource].instrument;

    if (relevantSkill !== undefined)
      this.addXp(relevantSkill, (game.resources[resource].xpPer * amount));

    updateView();
  }

  removeResource(resource, amount) {
    if (amount == undefined)
      amount = 1;

    this.resources[resource] -= amount;
    updateView();
  }
};
