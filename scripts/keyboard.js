/*
	Contains all functionality that is specific to the keyboard instrument
	ie. Animations, event handlers, etc.
*/

// TODO: Add support for songs with chords
// TODO: Add mute button
// TODO: Add lightbox for buying new instrument

// Maps keyboard keys to piano notes
var keyToKeyMap = {
  // White Keys
  "Tab": "C3",
  "KeyQ": "D3",
  "KeyW": "E3",
  "KeyE": "F3",
  "KeyR": "G3",
  "KeyT": "A3",
  "KeyY": "B3",
  "KeyU": "C4",
  "KeyI": "D4",
  "KeyO": "E4",
  "KeyP": "F4",
  "BracketLeft": "G4",
  "BracketRight": "A4",
  "Backslash": "B4",
  "Enter": "C5",
  // Black Keys
  "Digit1": "Db3",
  "Digit2": "Eb3",
  "Digit4": "Gb3",
  "Digit5": "Ab3",
  "Digit6": "Bb3",
  "Digit8": "Db4",
  "Digit9": "Eb4",
  "Minus": "Gb4",
  "Equal": "Ab4",
  "Backspace": "Bb4"
};

function initKeyboardTriggers() {
  // Populate triggers list with initial triggers for the laptop
  addTrigger(firstNoteTrigger);
}

function startKeyboard() {
  var progress = document.getElementById('keyboardBeatProgress');
  var requiredProgress = Math.ceil(game.resources.notes.clicksPer * game.player.instruments.keyboard.reqClicksMod);

  document.addEventListener('keydown', keyboardKeyDownEvent);
  document.addEventListener('keyup', keyboardKeyUpEvent);
  updateMultiplier(game.player.instruments.keyboard.multiplier, "keyboard");
  updateProgress(progress, game.player.instruments.keyboard.currentProgress, game.resources.notes.clicksPer, partial(addResource, "notes"));


  if (game.player.instruments.keyboard.currentSong == undefined)
    playKeyboardSong();
  else
    document.getElementById(game.player.instruments.keyboard.currentNote + "Key").style.backgroundColor = "grey";
}

function stopKeyboard() {
  /*
    Disables animations and event handlers for the keyboard
  */
  var htmlObj = document.getElementById("keyboardResourceNumber");

  htmlObj.classList.remove("createdResourceAnimation");
  document.removeEventListener('keydown', keyboardKeyDownEvent);
  document.removeEventListener('keyup', keyboardKeyUpEvent);
}

function keyboardKeyDownEvent(event) {
  /*
    Advances the progress bar if the user has pressed a keyboard key.
    Amount of progress is determined by whether or not the correct keys were pressed.

    Correct Key = multiplier amount (and adds to the multiplier)
    Incorrect Key = 0.5 (and resets the multiplier)

    Also highlights whatever key is pressed and plays the associated keyboard sound.
  */
  var notePlayed = keyToKeyMap[event.code];

  if (notePlayed !== undefined && event.repeat == false) {
    var numNotes;
    var maxMultiplier = game.instruments.keyboard.maxMultiplier + game.player.instruments.keyboard.bonusMaxMultiplier
    var progressAmount = 0;
    var requiredProgress = Math.ceil(game.resources.notes.clicksPer * game.player.instruments.keyboard.reqClicksMod);
    var progress = document.getElementById('keyboardBeatProgress');
    var audio = new Audio("resources/audio/Piano.mf." + notePlayed + ".mp3");
    var keyboardKey = document.getElementById(notePlayed + "Key");

    // For Debug functionality
    if (makingSong == true)
      songMaker.push(notePlayed);

    if (keyboardKey.className == "whiteKey")
      keyboardKey.style.backgroundColor = "#dddddd";
    else if (keyboardKey.className == "blackKey")
      keyboardKey.style.backgroundColor = "#333333";

    audio.play()

    if (notePlayed == game.player.instruments.keyboard.currentNote) {
      progressAmount = game.player.instruments.keyboard.multiplier * 2;

      if (game.player.instruments.keyboard.multiplier < maxMultiplier)
        game.player.instruments.keyboard.multiplier++;
      else
        game.player.instruments.keyboard.multiplier = maxMultiplier;

      playKeyboardSong();
    } else {
      progressAmount = 1;
      game.player.instruments.keyboard.multiplier = 1;
    }

    updateMultiplier(game.player.instruments.keyboard.multiplier, "keyboard");
    numNotes = updateProgress(progress, (progress.value + progressAmount), game.resources.notes.clicksPer, partial(addResource, "notes"));
    game.player.instruments.keyboard.currentProgress = progress.value;
    game.player.stats.keyboard.keyPresses++;

    if (numNotes > 0)
      resourceCreatedAnimation(numNotes, "keyboard");
  }
}

function keyboardKeyUpEvent(event) {
  /*
    Returns the pressed keys to their original colors.
  */
  var notePlayed = keyToKeyMap[event.code];

  if (notePlayed !== undefined && notePlayed != game.player.instruments.keyboard.currentNote) {
    var keyboardKey = document.getElementById(notePlayed + "Key");

    if (keyboardKey.className == "whiteKey") {
      keyboardKey.style.backgroundColor = "white";
    } else if (keyboardKey.className == "blackKey") {
      keyboardKey.style.backgroundColor = "black";
    }
  }
}

function pickRandomSong() {
  return keyboardSongs[Math.floor(Math.random() * keyboardSongs.length)];
}

function playKeyboardSong() {
  /*
    Selects the next key in the song to be pressed and highlights it on the keyboard.
    If no song is currently active, selects a new one at random.
  */
  if (game.player.instruments.keyboard.currentSong == undefined || game.player.instruments.keyboard.currentSong.length == 0) {
    game.player.instruments.keyboard.currentSong = pickRandomSong();
  }

  game.player.instruments.keyboard.currentNote = game.player.instruments.keyboard.currentSong[0];
  document.getElementById(game.player.instruments.keyboard.currentNote + "Key").style.backgroundColor = "grey";
  game.player.instruments.keyboard.currentSong = game.player.instruments.keyboard.currentSong.slice(1);
}

function nextSong() {
  var keyboardKey = document.getElementById(game.player.instruments.keyboard.currentNote + "Key");

  if (keyboardKey.className == "whiteKey") {
    keyboardKey.style.backgroundColor = "white";
  } else if (keyboardKey.className == "blackKey") {
    keyboardKey.style.backgroundColor = "black";
  }

  game.player.instruments.keyboard.currentSong = undefined;
  playKeyboardSong();
}

/*
  Keyboard Songs - use the debug tooling to add new songs
*/

var keyboardSongs = [
  // Mary Had A Little Lamb
  ["E4", "D4", "C4", "D4", "E4", "E4", "E4", "D4", "D4",
    "D4", "E4", "G4", "G4", "E4", "D4", "C4", "D4", "E4",
    "E4", "E4", "E4", "D4", "D4", "E4", "D4", "C4"
  ],
  // Zelda Theme
  ["Bb3", "F3", "Bb3", "Bb3", "C4", "D4", "Eb4", "F4", "F4",
    "F4", "Gb4", "Ab4", "Bb4", "Bb4", "Bb4", "Ab4", "Gb4",
    "Ab4", "Gb4", "F4", "F4", "Eb4", "Eb4", "F4", "Gb4", "F4",
    "Eb4", "Db4", "Db4", "Eb4", "F4", "Eb4", "Db4", "C4",
    "C4", "D4", "E4", "G4", "F4", "F3"
  ],
  // Song Of Time
  ["A3", "D3", "F3", "A3", "D3", "F3", "A3", "C4", "B3",
    "G3", "F3", "G3", "A3", "D3", "C3", "E3", "D3"
  ],
  // Song of Storms
  ["D3", "F3", "D4", "D3", "F3", "D4", "E4", "F4", "E4",
    "F4", "E4", "C4", "A3", "A3", "D3", "F3", "G3", "A3",
    "A3", "D3", "F3", "G3", "E3", "D3", "F3", "D4", "D3",
    "F3", "D4", "E4", "F4", "E4", "F4", "E4", "C4", "A3",
    "A3", "D3", "F3", "G3", "A3", "A3", "D3"
  ],
  // Harry Potter
  ["B3", "E4", "G4", "Gb4", "E4", "B4", "A4", "Gb4", "E4",
    "G4", "Gb4", "Eb4", "E4", "B3"
  ],
  // Fur Elise
  ["E4", "Eb4", "E4", "Eb4", "E4", "B3", "D4", "C4", "A3",
    "C3", "E3", "A3", "B3", "E3", "Ab3", "B3", "C4", "E3",
    "E4", "Eb4", "E4", "Eb4", "E4", "B3", "D4", "C4", "A3",
    "C3", "E3", "A3", "B3", "E3", "C4", "B3", "A3"
  ],
  // Swan Lake
  ["Gb4", "B3", "Db4", "D4", "E4", "Gb4", "D4", "Gb4", "D4",
    "Gb4", "B3", "D4", "B3", "G3", "D4", "B3", "E4", "D4",
    "Db4", "Gb4", "B3", "Db4", "D4", "E4", "Gb4", "D4", "Gb4",
    "D4", "Gb4", "B3", "D4", "B3", "G3", "D4", "B3"
  ]
];

/*
  Debug Functionality
*/

var makingSong; // Debug - used as a flag to capture user input
var songMaker; // Debug - used to print user input

function startSongMaker() {
  makingSong = true;
  songMaker = [];
}

function stopSongMaker() {
  makingSong = false;
  console.log(songMaker);
}
