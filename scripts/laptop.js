/*
	Contains all functionality that is specific to the laptop instrument
	ie. Animations, event handlers, etc.
*/

var beatInterval;
var dropInterval;
var markerReverse = false;

function startLaptop() {
  /*
    Restore the state of the laptop instrument
  */
  var tempo = game.player.instruments.laptop.currentTempo;
  var subgenre = game.player.instruments.laptop.subgenre;
  var progress = document.getElementById('laptopBeatProgress');
  var requiredProgress = Math.ceil(game.resources.beats.clicksPer * game.player.instruments.laptop.reqClicksMod);

  document.getElementById(tempo + "Tempo").checked = true;
  beatInterval = setInterval(animateBeat, game.instruments.laptop.tempoSpeeds[tempo]);
  updateMultiplier(game.player.instruments.laptop.multiplier, "laptop");
  updateProgress(progress, game.player.instruments.laptop.currentProgress, requiredProgress, partial(addResource, "beats"));

  if (subgenre !== undefined) {
    clearLaptopGenre();
    setLaptopGenre(subgenre);
  }
}

function stopLaptop() {
  /*
    Disables animations and event handlers for the laptop
  */
  var resourceNumber = document.getElementById("laptopResourceNumber");

  resourceNumber.classList.remove("createdResourceAnimation");
  clearInterval(beatInterval);
  clearInterval(dropInterval);
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

function adjustTempo(tempo) {
  game.player.instruments.laptop.currentTempo = tempo;
  stopLaptop();
  startLaptop();
}

function clickBeat() {
  /*
  	Advances the progress bar if the user has clicked the 'Make Beat' button.
  	Amount of progress is determined by how well the user lined up the marker with the different 'tiers' of zones.
    The progress amount is then further altered by active sub-genre effects.

  	Green = multiplier amount (and adds to the multiplier)
  	Yellow = 1/2 multiplier amount (and removes from the multuplier)
  	Red = 0.2 (and resets the multiplier)
  */

  var numBeats;
  var progressAmount = 0;
  var requiredProgress = Math.ceil(game.resources.beats.clicksPer * game.player.instruments.laptop.reqClicksMod);
  var progressMultiplier = 1;
  var maxMultiplier = game.instruments.laptop.maxMultiplier + game.player.instruments.laptop.bonusMaxMultiplier;
  var progress = document.getElementById('laptopBeatProgress');
  var markerOffsets = getOffsets(document.querySelector('#marker'));
  var markerPoint = (markerOffsets.left + markerOffsets.right) / 2;
  var greenOffsets = getOffsets(document.getElementById('greenZone'));
  var leftYellowPoint = getOffsets(document.getElementById('leftYellowZone')).left;
  var rightYellowPoint = getOffsets(document.getElementById('rightYellowZone')).right;

  switch (game.player.instruments.laptop.subgenre) {
    case "house":
      if (game.player.instruments.laptop.currentTempo == "slowest")
        progressMultiplier *= 2;
      break;
    case "hardstyle":
      if (game.player.instruments.laptop.currentTempo == "fastest")
        progressMultiplier *= 2;
    case "dubstep":
      if (game.player.instruments.laptop.dropActive == true)
        progressMultiplier *= 10;
    default:
      break;
  }

  if (maxMultiplier < 1)
    maxMultiplier = 1;

  // Determine how much to advance the progress bar
  if (greenOffsets.left <= markerPoint && markerPoint <= greenOffsets.right) {
    progressAmount = game.player.instruments.laptop.multiplier * 5;

    if (game.player.instruments.laptop.multiplier < maxMultiplier)
      game.player.instruments.laptop.multiplier++;
    else
      game.player.instruments.laptop.multiplier = maxMultiplier;
  } else if (leftYellowPoint <= markerPoint && markerPoint <= rightYellowPoint) {
    progressAmount = Math.ceil(game.player.instruments.laptop.multiplier / 2) * 5;

    if (game.player.instruments.laptop.multiplier > 1)
      game.player.instruments.laptop.multiplier--;
  } else {
    if (game.player.instruments.laptop.subgenre == "industrial")
      progressMultiplier *= 5;

    progressAmount = 1;
    game.player.instruments.laptop.multiplier = 1;
  }

  updateMultiplier(game.player.instruments.laptop.multiplier, "laptop");
  numBeats = updateProgress(progress, (progress.value + (progressAmount * progressMultiplier)), requiredProgress, partial(addResource, "beats"));
  game.player.instruments.laptop.currentProgress = progress.value;
  game.player.stats.laptop.clicks++;

  if (numBeats > 0)
    resourceCreatedAnimation(numBeats, "laptop");
}

/* Sub-genre functionality */

function clearLaptopGenre() {
  /*
    Revert all sub-genre specific effects
  */
  var activeSubgenre = game.player.instruments.laptop.subgenre;

  // Revert sub-genre specific effects
  if (activeSubgenre == "electro") {
    var greenZone = document.getElementById("greenZone");
    var leftYellowZone = document.getElementById("leftYellowZone");
    var rightYellowZone = document.getElementById("rightYellowZone");

    greenZone.style.width = "15%";
    leftYellowZone.style.width = "18%";
    rightYellowZone.style.width = "18%";
  } else if (activeSubgenre == "dubstep") {
    document.getElementById("dropProgressContainer").style.visibility = "hidden";
    clearInterval(dropInterval);
    game.player.instruments.laptop.dropActive = false;
    document.getElementById("laptopContent").style.boxShadow = "none";
  } else if (activeSubgenre == "drumAndBass") {
    game.player.instruments.laptop.bonusMaxMultiplier -= 20;
    game.player.instruments.laptop.multiplier = Math.min(game.player.instruments.laptop.multiplier, game.instruments.laptop.maxMultiplier + game.player.instruments.laptop.bonusMaxMultiplier);
    updateMultiplier(game.player.instruments.laptop.multiplier, "laptop");
  } else if (activeSubgenre == "trance") {
    game.player.instruments.laptop.bonusMaxMultiplier += 10;
    game.player.instruments.laptop.passiveProgress--;
  }

  if (activeSubgenre !== undefined) {
    var subgenreObj = document.getElementById(activeSubgenre);
    var progressContainer = document.getElementById("laptopBeatProgress");

    subgenreObj.style.boxShadow = "none";
    progressContainer.style.boxShadow = "none"
    game.player.instruments.laptop.subgenre = undefined;
  }
}

function setLaptopGenre(subgenreId) {
  var activeSubgenre = game.player.instruments.laptop.subgenre;

  // Disable the currently active subgenre
  clearLaptopGenre();

  if (subgenreId !== activeSubgenre) {
    var subgenreObj = document.getElementById(subgenreId);
    var progressContainer = document.getElementById("laptopBeatProgress");
    var glowColor = getComputedStyle(subgenreObj).borderColor;

    // Apply glow
    progressContainer.style.boxShadow = "0px 0px 80px 1px " + glowColor;
    subgenreObj.style.boxShadow = "0px 0px 5px 2px " + glowColor;

    // Apply sub-genre specific effects
    if (subgenreId == "electro") {
      var greenZone = document.getElementById("greenZone");
      var leftYellowZone = document.getElementById("leftYellowZone");
      var rightYellowZone = document.getElementById("rightYellowZone");

      greenZone.style.width = "27%";
      leftYellowZone.style.width = "12%";
      rightYellowZone.style.width = "12%";
    } else if (subgenreId == "dubstep") {
      document.getElementById("dropProgressContainer").style.visibility = "visible";
      dropInterval = setInterval(dropTick, 100);
    } else if (subgenreId == "drumAndBass") {
      game.player.instruments.laptop.bonusMaxMultiplier += 20;
    } else if (subgenreId == "trance") {
      game.player.instruments.laptop.bonusMaxMultiplier -= 10;
      game.player.instruments.laptop.multiplier = Math.min(game.player.instruments.laptop.multiplier, game.instruments.laptop.maxMultiplier + game.player.instruments.laptop.bonusMaxMultiplier);
      game.player.instruments.laptop.passiveProgress++;
      updateMultiplier(game.player.instruments.laptop.multiplier, "laptop");
    }

    // Update active sub-genre
    game.player.instruments.laptop.subgenre = subgenreId;
  }
}

function dropTick() {
  if (game.player.instruments.laptop.dropActive == true) {
    var dropProgress = document.getElementById("theDropProgress");
    dropProgress.value = dropProgress.value - 5;

    if (dropProgress.value <= 0) {
      game.player.instruments.laptop.dropActive = false;
      document.getElementById("laptopContent").style.boxShadow = "none";
    }
  } else {
    var dropProgress = document.getElementById("theDropProgress");
    dropProgress.value = dropProgress.value + 1;

    if (dropProgress.value >= dropProgress.max) {
      var laptopContainer = document.getElementById("laptopContent");
      var glowColor = getComputedStyle(document.getElementById("dubstep")).borderColor;

      game.player.instruments.laptop.dropActive = true;
      laptopContainer.style.boxShadow = "inset 0px 0px 150px 1px " + glowColor;
    }
  }
}

function getTooltipInfo(subgenre) {
  switch (subgenre) {
    case "trance":
      return {
        "genre": "Trance",
        "tooltip": "Reduces the maximum combo by 10 (but not lower than 1). Generates a small amount of passive beat progress."
      };
      break;
    case "house":
      return {
        "genre": "House",
        "tooltip": "Clicking generates 2x beat progress when using the slowest tempo."
      };
      break;
    case "drumAndBass":
      return {
        "genre": "Drum and Bass",
        "tooltip": "Increases the maximum combo by 20."
      };
      break;
    case "hardstyle":
      return {
        "genre": "Hardstyle",
        "tooltip": "Clicking generates 2x beat progress when using the fastest tempo."
      };
      break;
    case "electro":
      return {
        "genre": "Electro",
        "tooltip": "Increases the size of the green zone and reduces the size of the yellow zones."
      };
      break;
    case "industrial":
      return {
        "genre": "Industrial",
        "tooltip": "Clicking in the red zones generates 5x more beat progress."
      };
      break;
    case "dubstep":
      return {
        "genre": "Dubstep",
        "tooltip": "Every 50 seconds, enter The Drop. When The Drop occurs, clicking generates 10x beat progress for 10 seconds."
      };
      break;
    default:
      break;
  }
}

function genreTooltip(obj) {
  var tooltip = document.getElementById('tooltip');
  var tooltipInfo = getTooltipInfo(obj.id);
  var offsets = getOffsets(obj);
  var html = "<div id='tooltipHeader'>";

  if (tooltipInfo !== undefined)
    html += "Subgenre: " + tooltipInfo.genre + "<br><br>" + tooltipInfo.tooltip;

  html += "</div>";

  tooltip.innerHTML = html;
  tooltip.style.left = offsets.left - (obj.offsetWidth * 10);
  tooltip.style.top = offsets.top + obj.offsetHeight + 5;
  tooltip.style.width = "300px";
  tooltip.style.visibility = "visible";

  var tooltipHeader = document.getElementById('tooltipHeader');
  tooltipHeader.style.borderBottom = "none";
}

function hideGenreTooltip() {
  document.getElementById('tooltip').style.width = "200px";
  hideTooltip();
}

function populateGenrePopUp(taskName) {
  var popUp = document.getElementById("popUpContent");
  var unexploredSubgenres = game.instruments.laptop.subgenres.filter(function(genre) {
    if (game.player.instruments.laptop.unlockedSubgenres.indexOf(genre) == -1)
      return genre;
  });

  popUp.innerHTML += "<p class='popUpHeader'>Select A Sub-Genre To Explore</p>";

  unexploredSubgenres.forEach(function(genre) {
    var genreRow = "<div class='popUpRow'>";
    var tooltipInfo = getTooltipInfo(genre);

    if (tooltipInfo !== undefined) {
      var onclick = "onclick='selectGenre(\"" + genre + "\", \"" + taskName + "\")'";
      genreRow += "<button class='popUpButton'" + onclick + ">" + tooltipInfo.genre + "</button>";
      genreRow += "<p class='popUpGenreText'>" + tooltipInfo.tooltip + "</p>";
    }

    genreRow += "</div>"
    popUp.innerHTML += genreRow;
  });
}

function selectGenre(subgenre, taskName) {
  var task = getTask(taskName);
  var htmlObj = document.getElementById(subgenre);

  showUiElement(subgenre, "inline");
  setLaptopGenre(subgenre);
  appendToOutputContainer("Your music is definitely leaning into the " + subgenre + " genre. Further exploring the genre will help you develop as a musician.");
  finishTask(task);
  game.player.instruments.laptop.unlockedSubgenres.push(subgenre);
  closePopUp();
  updateView();
}
