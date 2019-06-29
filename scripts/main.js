/*
  Initializes the game state and holds the game object
*/

$(document).ready(function() {
  $(window).keydown(function(event) {
    if (event.keyCode == 13 || event.keyCode == 9) {
      event.preventDefault();
      return false;
    }
  });

  init();
});

var game;

function init() {
  loadGame();
  if (game == undefined) newGame();
  startInstrument(game.player.instruments.active);
  startTicking();
  //addNewGameTask();
  //addCheatTask();
  updateView();
}

/* Debug Functionality */

function addCheatTask() {
  var cheatTask = getContext("CHEAT");

  if (cheatTask == undefined) {
    var context = {
      taskId: "cheatTask",
      taskName: "CHEAT"
    };

    addTask(context);
  }
}

function addNewGameTask() {
  var newGameTask = getContext("New Game");

  if (newGameTask == undefined) {
    var context = {
      taskId: "newGameTask",
      taskName: "New Game"
    };

    addTask(context);
  }
}
