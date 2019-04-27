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
  //loadGame();
  if (game == undefined) newGame();
  startInstrument(game.activeInstrument);
  startTicking();
  addCheatTask();
  updateView();
}

/* Debug Functionality */

function addCheatTask() {
  var context = {
    taskId: "cheatTask",
    taskName: "CHEAT!"
  };

  addTask(context);
}
