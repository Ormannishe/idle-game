function Game() {
  this.player = new Player();
  this.tasks = [];
  this.clicksPerBeat = 30;
  this.beatsPerSample = 10;
  this.samplesPerSong = 10;
  this.xpPerBeat = 10;
  this.xpPerSample = 50;
  this.xpPerSong = 250;
};

function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function makeBeat() {
  game.player.addBeat(1);
  game.player.addXp('laptop', game.xpPerBeat);
}

function makeSample(numToMake) {
  var totalCost;

  if (numToMake == undefined)
    numToMake = 1;

  totalCost = (game.beatsPerSample * numToMake);

  if (game.player.beats >= totalCost) {
    game.player.beats -= totalCost;
    game.player.samples += numToMake;
    game.player.addXp('laptop', game.xpPerSample * numToMake);
  }

  updateView();
}
