class Player {

  constructor() {
    this.name = "Michael Jackson";
    this.instruments = ["Laptop"];
    this.fame = 0;
    this.money = 0;
    this.lifetimeMoney = 0;
    this.passiveBeatProgress = 0;
    this.beats = 0;
    this.lifetimeBeats = 0;
    this.samples = 0;
    this.lifetimeSamples = 0;
    this.notes = 0;
    this.lifetimeNotes = 0;
    this.measures = 0;
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

  addXp(skill, n) {
    this.skills[skill].xp += n;
    while (this.skills[skill].toNextLevel <= this.skills[skill].xp) {
      this.skills[skill].xp = this.skills[skill].xp - this.skills[skill].toNextLevel;
      this.skills[skill].level++;
      this.skills[skill].toNextLevel = Math.round(this.skills[skill].toNextLevel * this.skills[skill].nextLevelXpRatio);
      appendToOutputContainer("Your " + skill + " skill has reached level " + this.skills[skill].level + "!");
    }
  }
};
