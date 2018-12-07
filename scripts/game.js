function Game() {
  this.player = new Player();
  this.tasks = [];
  this.beatMultiplier = 1;
  this.clicksPerBeat = 30;
  this.beatsPerSample = 25;
  this.samplesPerSong = 50;
  this.xpPerBeat = 5;
  this.xpPerSample = 25;
  this.xpPerSong = 250;
};

function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function makeBeat(n) {
  if (n == undefined)
    n = 1;

  game.player.addBeat(n);
  game.player.addXp('laptop', (game.xpPerBeat * n));
  updateView();
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
