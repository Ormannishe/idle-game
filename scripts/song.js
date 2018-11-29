function Song(name, quality) {
  this.name = name;
  this.quality = quality;
  this.popularity = 0;
  this.maxPopularity = Math.pow(quality, 2) * 100;
  this.moneyPerSec = 0;
  this.totalEarnings = 0;
};

function makeSong(songName, skills) {
  /*
  	Creates a new Song entity with the given name using the given list of skills.
  	The popularity and revenue of a song increases as a function of it's quality.
  	It's quality is calculated below as such:

  	Song Quality = The average skill level of the skills involved, plus 1 for each skill,
  				   with a random modifier between 50% and 150% (rounded up)
  */

  if (game.player.samples >= game.samplesPerSong && skills.length > 0) {
    var quality = 0;
    var newSong;

    game.player.samples -= game.samplesPerSong;

    skills.forEach(function(skill) {
      quality += game.player.skills[skill].level;
      game.player.addXp(skill, game.xpPerSong);
    })

    quality = Math.ceil((quality / skills.length + skills.length) * (Math.random() + 0.5));
    newSong = new Song(songName, quality);
    game.player.songs.push(newSong);
  }
}

function adjustSongStats() {
  /*
  	Adjust all stats that are related to songs.

  	Song Popularity has a 10% chance to increase by a random amount up to it's quality.
  	(Higher quality songs increase in popularity faster)

  	Song Popularity has a 10% chance to decrease by a random amount up to (1 / quality) * 100.
  	(Higher quality songs decrease in popularity slower)

  	A modifier is then applied on top of the base 10% chances. A bonus of up to 50% can be applied to the gain chance or 
  	lose chance based on the song's current popularity and max popularity.

  	Song Revenue is always a fraction of it's popularity (TODO: fraction increases via different medias)
  */

  var songs = game.player.songs;

  songs.forEach(function(song) {
    var gainChance = 0.1;
    var loseChance = 0.1;
    var mod = (song.popularity - song.maxPopularity / 2) / song.maxPopularity;
    var maxLoss = 1 / song.quality * 100;
    var revenueMod = 50000;

    // Add chance modifiers
    if (mod < 0)
      gainChance += mod * -1;
    else
      loseChance += mod;

    // Calculate popularity gained
    if (gainChance > Math.random() && song.popularity < song.maxPopularity) {
      song.popularity += Math.ceil(song.quality * Math.random());
    }

    // Calculate popularity lost
    if (loseChance > Math.random() && song.popularity > maxLoss) {
      song.popularity -= Math.ceil(maxLoss * Math.random());
    }

    // Calculate new revenue stats and give player money
    if (revenueMod > 0) {
      song.moneyPerSec = song.popularity / revenueMod;
      game.player.addMoney(song.moneyPerSec);
      song.totalEarnings += song.moneyPerSec;
    }
  });

  game.player.songs = songs;
}