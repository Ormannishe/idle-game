function Game() {
  this.player = new Player();
  this.tasks = [];
  this.laptopMultiplier = 1;
  this.clicksPerBeat = 30;
  this.beatsPerSample = 25;
  this.samplesPerSong = 50;
  this.keyboardMultiplier = 1;
  this.clicksPerNote = 100;
  this.notesPerMeasure = 25;
  this.measuresPerSong = 50;
  this.xpPerBeat = 5;
  this.xpPerSample = 50;
  this.xpPerNote = 5;
  this.xpPerMeasure = 50;
  this.xpPerSong = 500;
};

function addMoney(n) {
  game.player.money += n;
  game.player.lifetimeMoney += n;
}

function addBeat(n) {
  if (n == undefined)
    n = 1;

  game.player.beats += n;
  game.player.lifetimeBeats += n;
  game.player.addXp("laptop", (game.xpPerBeat * n));
  updateView();
}

function addNote(n) {
  if (n == undefined)
    n = 1;

  game.player.notes += n;
  game.player.lifetimeNotes += n;
  game.player.addXp('keyboard', (game.xpPerNote * n));
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

function makeMeasure(numToMake) {
  var totalCost;

  if (numToMake == undefined)
    numToMake = 1;

  totalCost = (game.notesPerMeasure * numToMake);

  if (game.player.notes >= totalCost) {
    game.player.notes -= totalCost;
    game.player.measures += numToMake;
    game.player.addXp('keyboard', game.xpPerMeasure * numToMake);
  }

  updateView();
}
