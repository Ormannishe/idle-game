function Game() {
  this.player = new Player();
  this.tasks = ["test", "longTask"];
  this.clicksPerBeat = 10;
  this.beatsPerSample = 10;
  this.samplesPerSong = 10;
  this.xpPerBeat = 10;
  this.xpPerSample = 50;
  this.xpPerSong = 250;
  this.laptopXpToNextLevel = 100;
  this.vocalXpToNextLevel = 100;
  this.keyboardXpToNextLevel = 100;
  this.guitarXpToNextLevel = 100;
  this.drumXpToNextLevel = 100;
  this.nextLevelXpRatio = 1.2;
};

function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function makeBeat() {
  game.player.beats++;
  game.player.lifetimeBeats++;
  game.player.laptopXp += game.xpPerBeat;
  levelUp();
}

function makeSample(numToMake) {
  var totalCost;

  if (numToMake == undefined)
    numToMake = 1;

  totalCost = (game.beatsPerSample * numToMake);

  if (game.player.beats >= totalCost) {
    game.player.beats -= totalCost;
    game.player.samples += numToMake;
    game.player.laptopXp += (game.xpPerSample * numToMake);

    levelUp();
  }

  updateView();
}

function levelUp() {
  while (game.laptopXpToNextLevel <= game.player.laptopXp) {
    game.player.laptopXp = game.player.laptopXp - game.laptopXpToNextLevel;
    game.player.laptopSkill++;
    game.laptopXpToNextLevel = Math.round(game.laptopXpToNextLevel * game.nextLevelXpRatio);
    appendToOutputContainer("Your Laptop level has raised to " + game.player.laptopSkill + "!");
  }
}
