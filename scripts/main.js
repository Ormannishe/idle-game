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
  // TODO: Check for a save
  game = new Game();
  initTriggers();
  startLaptop();
  startTicking();
  makeCheatTask();
  updateView();
}
