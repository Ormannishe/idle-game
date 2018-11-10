class Player {

  constructor() {
    this.name = "Michael Jackson";
    this.instruments = ["Laptop"];
    this.money = 0;
    this.lifetimeMoney = 0;
    this.beats = 0;
    this.lifetimeBeats = 0;
    this.samples = 0;
    this.lifetimeSamples = 0;
    this.songs = [];
    this.albums = [];
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
    }
  }

  addBeat(n) {
    this.beats += n;
    this.lifetimeBeats += n;
  }

  addMoney(n) {
    this.money += n;
    this.lifetimeMoney += n;
  }

  addXp(skill, n) {
    this.skills[skill].xp += n;
    if (this.skills[skill].toNextLevel <= this.skills[skill].xp) {
      this.skills[skill].xp = this.skills[skill].xp - this.skills[skill].toNextLevel;
      this.skills[skill].level++;
      this.skills[skill].toNextLevel = Math.round(this.skills[skill].toNextLevel * this.skills[skill].nextLevelXpRatio);
    }
  }
};
