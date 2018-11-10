function Game() {
  this.player = new Player();
  this.tasks = ["test", "longTask"];
  this.clicksPerBeat = 10;
  this.beatsPerSample = 10;
  this.samplesPerSong = 10;
  this.xpPerBeat = 10;
  this.xpPerSample = 50;
  this.laptopXpToNextLevel = 100;
  this.vocalXpToNextLevel = 100;
  this.keyboardXpToNextLevel = 100;
  this.guitarXpToNextLevel = 100;
  this.drumXpToNextLevel = 100;
  this.nextLevelXpRatio = 1.2;
};

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
    game.player.addXp('laptop', game.xpPerBeat * numToMake);
  }

  updateView();
}

function makeSong(songName) {
  if (game.player.samples >= game.samplesPerSong) {
    // TODO: Calculate this based on skill level
    var quality = 10;
    var newSong = new Song(songName, quality);

    game.player.songs.push(newSong);
  }

}
