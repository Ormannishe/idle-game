/*
  Contains all functionality for songs
*/

function Song(name, quality, popularity) {
  this.name = name;
  this.quality = quality;
  this.popularity = popularity;
  this.maxPopularity = Math.pow(quality, 2) * 100;
  this.moneyPerSec = 0;
  this.totalEarnings = 0;
};

function makeSong(songName, skills) {
  /*
  	Creates a new Song entity with the given name using the given list of skills.
    Calculates the popularity and quality of the song.

    Popularity: How many people are actively listening to your song. The starting
                popularity of a song is the size of the player's dedicated fanbase,
                which is assumed to be 20% of their fame.
                Popularity then increases over time at a rate proportional to the
                song's current Popularity and the song's Quality. The maximum
                popularity of a song is also dependant on it's Quality.

    Quality: How objectively good your song is, independent of how popular it is.
             Quality is equal to your average skill level with all instruments used
             to create the song, plus 10% per instrument used.
  */

  if (skills.length > 0) {
    var newSong;
    var quality = 0;
    var popularity = 0;

    skills.forEach(function(skill) {
      quality += game.player.skills[skill].level;
      addXp(skill, game.specialResources.songs.xpPer);
    })

    quality = Math.ceil((quality / skills.length) * (1 + (0.1 * skills.length)));
    popularity = Math.ceil(game.player.resources.fame / 5);
    newSong = new Song(songName, quality, popularity);
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
      addResource("money", song.moneyPerSec);
      song.totalEarnings += song.moneyPerSec;
    }
  });

  game.player.songs = songs;
}

function populateSongPopUp() {
  var songInstructions = "Creating a song requires a total of 50 of any of the below resources. Every song you create will be of a given quality, determined by your skill level with the instruments used. Songs recieve a bonus to their quality when created using multiple instruments.";
  var popUp = document.getElementById("popUpContent");

  // Populate Header and Instructions
  popUp.innerHTML += "<p class='popUpHeader'>Create A New Song</p>";
  popUp.innerHTML += "<div class='popUpRow'>" + "<p>Song Name:</p>" + "<input id='songNameInput'></input>" + "</div>";
  popUp.innerHTML += "<div id='songDetails'>" +
    "<p class='songDetails'>" + songInstructions + "</p>" +
    "</div>";

  // Populate resource sliders
  game.specialResources.songs.validResources.forEach(function(resource) {
    var numResource = game.player.resources[resource];

    if (numResource > 0) {
      var resourceRow = "<div class='popUpRow'>";

      resourceRow += "<p class='resourceLabel'>" + resource + "</p>";
      resourceRow += "<input id='" + resource + "Slider' class='popUpSlider' type='range' min='0' max='" +
        Math.min(game.specialResources.songs.resourcesPer, numResource) +
        "' value='0' oninput='modifyResourceAmount(\"" + resource + "\")'></input>";
      resourceRow += "<p id='" + resource + "SliderAmount' class='resourceAmount'>0</p>";
      resourceRow += "</div>";

      popUp.innerHTML += resourceRow;
    }
  });

  // Populate Total section
  popUp.innerHTML += "<div id='totalRow' class='popUpRow'>" +
    "<p id='totalLabel' class='resourceLabel'>Total</p>" +
    "<input id='totalSlider' class='popUpSlider' type='range' min='0' max='1' value='0'></input>" +
    "<p id='totalSliderAmount' class='resourceAmount'>0</p>" +
    "</div>";

  popUp.innerHTML += "<div class='popUpHeader'><button class='popUpButton'" +
    "onclick='validateInput()'" +
    ">Make New Song</button></div>";
}

function modifyResourceAmount(resource) {
  var slider = document.getElementById(resource + "Slider");
  var amount = document.getElementById(resource + "SliderAmount");
  var totalAmount = document.getElementById("totalSliderAmount");

  totalAmount.innerHTML = parseInt(totalAmount.innerHTML) + parseInt(slider.value) - parseInt(amount.innerHTML);
  amount.innerHTML = slider.value;
}

function validateInput() {
  // Validate the user entered information before creating a new song.
  var songNameInput = document.getElementById("songNameInput");
  var totalAmount = document.getElementById("totalSliderAmount");

  if (songNameInput.value == "") {
    songNameInput.classList.remove("backgroundColorError");
    void songNameInput.offsetWidth; // css magic to allow replay of the error animation
    songNameInput.classList.add("backgroundColorError");
  } else if (parseInt(totalAmount.innerHTML) !== game.specialResources.songs.resourcesPer) {
    totalAmount.classList.toggle("fontColorError");
    void totalAmount.offsetWidth; // css magic to allow replay of the error animation
    totalAmount.classList.add("fontColorError");
  }
  // Determine how many of each resource is to be used. Determine relevant instruments, make song
  else {
    var instrumentsUsed = [];

    game.specialResources.songs.validResources.forEach(function(resource) {
      if (game.player.resources[resource] > 0) {
        var amount = document.getElementById(resource + "SliderAmount").innerHTML;

        if (amount > 0) {
          removeResource(resource, amount);
          instrumentsUsed.push(game.resources[resource].instrument);
        }
      }
    });

    if (game.player.songs.length == 0) {
      var context = {
        taskId: "newSongTask",
        taskName: "Make New Song",
        description: "Creates a new song!",
        flavor: "Every song is a new opportunity. Unless you're Nickleback. Then it's kind of just the same every time.",
        repeatable: true
      };

      appendToOutputContainer(songNameInput.value + " will be remembered as the start of a legacy!");
      showUiElement("songsTab", "inline");
      removeTask("Make First Song");
      addTask(context);
    }

    makeSong(songNameInput.value, instrumentsUsed);
    closePopUp();
    updateView();
  }
}
