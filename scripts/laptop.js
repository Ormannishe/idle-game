var beatInterval;
var markerReverse = false;
var tempo = 15; // Starting tempo

function startLaptop() {
  beatInterval = setInterval(animateBeat, tempo);
}

function stopLaptop() {
  clearInterval(beatInterval);
}

function animateBeat() {
  /*
    Animate the moving marker for the laptop minigame by altering the 'left' css attribute of the 'marker' element.
    When we've exceeded a maximum 'left' value, reverse the direction of movement.
  */

  var marker = document.getElementById("marker");
  var left = parseFloat(marker.style.left);

  // If the left attribute is not defined, start at the beginning of the animation
  if (isNaN(left)) {
    marker.style.left = "2%";
    return;
  }

  if (markerReverse)
    left -= 1;
  else
    left += 1;

  if (left >= 94)
    markerReverse = true;
  else if (left <= 1)
    markerReverse = false;

  marker.style.left = left + "%";
}

function adjustTempo(n) {
  tempo = n;
  stopLaptop();
  startLaptop();
}

function clickBeat() {
  /*
  	Advances the progress bar if the user has clicked the 'Make Beat' button.
  	Amount of progress is determined by how well the user lined up the marker with the different 'tiers' of zones.

  	Green = multiplier amount (and adds to the multiplier)
  	Yellow = 1/2 multiplier amount (and removes from the multuplier)
  	Red = 0.2 (and resets the multiplier)
  */

  var progressAmount = 0;
  var progress = document.getElementById('laptopBeatProgress');
  var markerOffsets = getOffsets(document.querySelector('#marker'));
  var markerPoint = (markerOffsets.left + markerOffsets.right) / 2;
  var greenOffsets = getOffsets(document.getElementById('greenZone'));
  var leftYellowPoint = getOffsets(document.getElementById('leftYellowZone')).left;
  var rightYellowPoint = getOffsets(document.getElementById('rightYellowZone')).right;

  // Determine how much to advance the progress bar
  if (greenOffsets.left <= markerPoint && markerPoint <= greenOffsets.right) {
    progressAmount = game.laptopMultiplier;

    if (game.laptopMultiplier < 10)
      game.laptopMultiplier++;
  }
  else if (leftYellowPoint <= markerPoint && markerPoint <= rightYellowPoint) {
    progressAmount = Math.ceil(game.laptopMultiplier / 2);

    if (game.laptopMultiplier > 1)
      game.laptopMultiplier--;
  }
  else {
    progressAmount = 0.2;
    game.laptopMultiplier = 1;
  }

  updateMultiplier(game.laptopMultiplier, "laptopMultiplier");
  updateProgress(progress, (progress.value + progressAmount), game.clicksPerBeat, addBeat);
}
