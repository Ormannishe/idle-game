// Contains all player data and functions for manipulating player data
// Authoritative source for all player information (ie. how many resources a player has)

class Player {
  constructor() {
    this.name = "Michael Jackson";
    this.resources = { fame: { current: 0,
                               lifetime: 0 },
                       money: { current: 0,
                                lifetime: 0 },
                       beats: { current: 0,
                                lifetime: 0 }.
                       samples: { current: 0,
                                  lifetime: 0 },
                       notes: {current: 0,
                               lifetime: 0,
                               passiveProgress: 0 },
                       measures: { current: 0,
                                   lifetime: 0 },
                       songs: [],
                       albums: []
                     };
    this.bonuses = { laptop: { multiplier: 1,
                               passiveProgress: 0,
                               subgenre: undefined,
                               unexploredSubgenres: ["trance", "house", "drumAndBass", "hardstyle", "electro", "industrial", "dubstep"]},
                     keyboard: { multiplier: 1,
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
  }

  addXp(s, n) {
    this.skills[s].xp += n;
    while (this.skills[s].toNextLevel <= this.skills[s].xp) {
      this.skills[s].xp = this.skills[s].xp - this.skills[s].toNextLevel;
      this.skills[s].level++;
      this.skills[s].toNextLevel = Math.round(this.skills[s].toNextLevel * this.skills[s].nextLevelXpRatio);
      appendToOutputContainer("Your " + s + " skill has reached level " + this.skills[s].level + "!");
    }
  }

  addResource(resource, amount) {
    var relevantSkill = game.resources[resource].instrument;

    if (amount == undefined)
      amount = 1;

    this.resources[resource].current += n;
    this.resources[resource].lifetime += n;

    if (relevantSkill !== undefined) {
      this.addXp(relevantSkill, (game.xpPerNote * n));

    }
  }

  addMoney(n) {
    this.resources.money.current += n;
    this.resources.money.lifetime += n;
  }

};
