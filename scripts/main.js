// TODO: Add Achievements
// TODO: Make Albums and other cool resources

var game;

/* Initialization */

$(document).ready(function() {
  $(window).keydown(function(event) {
    if (event.keyCode == 13 || event.keyCode == 9) {
      event.preventDefault();
      return false;
    }
  });

  init();
});

function init() {
  // TODO: Check for a save
  game = new Game();
  startLaptop();
  startTicking();
  makeCheatTask();
  updateView();
  console.log("Initialized!");
}
