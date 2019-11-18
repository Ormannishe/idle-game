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
  // addCheatTask();
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
