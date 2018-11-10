function Song(name, quality) {
  this.name = name;
  this.quality = quality;
  this.popularity = 0;
  this.moneyPerSec = 0;
  this.totalEarnings = 0;
};

function makeSong(songName) {
	if (game.player.samples >= game.samplesPerSong) {
	    var quality = game.player.laptopSkill;
	    var newSong = new Song(songName, quality);
	    
	    game.player.songs.push(newSong);
	    game.player.laptopXp += game.xpPerSong;
	  	levelUp();
	}
}

function adjustSongStats() {
	var songs = game.player.songs;

	songs.forEach(function(song) {
		var chance = Math.floor(Math.random() * 10);
		var maxPopularity = Math.pow(song.quality, 2) * 1000;

		if (song.quality > chance && song.popularity < maxPopularity) {
			song.popularity += song.quality - chance;
		}

		song.moneyPerSec = song.popularity / 1000;
		game.player.money += song.moneyPerSec;
		song.totalEarnings += song.moneyPerSec;
	});

	game.player.songs = songs;
}