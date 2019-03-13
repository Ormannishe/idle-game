var beatInterval;
var dropInterval;
var markerReverse = false;
var dropActive = false;
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
    The progress amount is then further altered by active sub-genre effects.

  	Green = multiplier amount (and adds to the multiplier)
  	Yellow = 1/2 multiplier amount (and removes from the multuplier)
  	Red = 0.2 (and resets the multiplier)
  */

  var progressAmount = 0;
  var progressMultiplier = 1;
  var maxMultiplier = 10;
  var progress = document.getElementById('laptopBeatProgress');
  var markerOffsets = getOffsets(document.querySelector('#marker'));
  var markerPoint = (markerOffsets.left + markerOffsets.right) / 2;
  var greenOffsets = getOffsets(document.getElementById('greenZone'));
  var leftYellowPoint = getOffsets(document.getElementById('leftYellowZone')).left;
  var rightYellowPoint = getOffsets(document.getElementById('rightYellowZone')).right;

  switch(game.activeLaptopSubgenre) {
    case "trance":
      maxMultiplier -= 10;
      break;
    case "drumAndBass":
      maxMultiplier += 20;
      break;
    case "house":
      if (tempo == 25)
        progressMultiplier *= 2;
      break;
    case "hardstyle":
      if (tempo == 5)
        progressMultiplier *=2;
    case "dubstep":
      if (dropActive == true)
        progressMultiplier *= 10;
    default:
      break;
  }

  if (maxMultiplier < 1)
    maxMultiplier = 1;

  // Determine how much to advance the progress bar
  if (greenOffsets.left <= markerPoint && markerPoint <= greenOffsets.right) {
    progressAmount = game.laptopMultiplier;

    if (game.laptopMultiplier < maxMultiplier)
      game.laptopMultiplier++;
    else
      game.laptopMultiplier = maxMultiplier;
  }
  else if (leftYellowPoint <= markerPoint && markerPoint <= rightYellowPoint) {
    progressAmount = Math.ceil(game.laptopMultiplier / 2);

    if (game.laptopMultiplier > 1)
      game.laptopMultiplier--;
  }
  else {
    if (game.activeLaptopSubgenre == "industrial")
      progressMultiplier *= 5;

    progressAmount = 0.2;
    game.laptopMultiplier = 1;
  }

  updateMultiplier(game.laptopMultiplier, "laptopMultiplier");
  updateProgress(progress, (progress.value + (progressAmount * progressMultiplier)), game.clicksPerBeat, addBeat);
}

/* Sub-genre functionality */

function setLaptopGenre(obj) {
  var progressContainer = document.getElementById("laptopBeatProgress");

  // Revert sub-genre specific effects
  if (game.activeLaptopSubgenre == "electro") {
    var greenZone = document.getElementById("greenZone");
    var leftYellowZone = document.getElementById("leftYellowZone");
    var rightYellowZone = document.getElementById("rightYellowZone");

    greenZone.style.width = "15%";
    leftYellowZone.style.width = "18%";
    rightYellowZone.style.width = "18%";
  }
  else if (game.activeLaptopSubgenre == "dubstep") {
    document.getElementById("dropProgressContainer").style.visibility = "hidden";
    clearInterval(dropInterval);
    dropActive = false;
    document.getElementById("laptop").style.boxShadow = "none";
  }
  else if (game.activeLaptopSubgenre == "drumAndBass") {
    updateMultiplier(Math.min(game.laptopMultiplier, 10), "laptopMultiplier");
  }

  // Apply glow and sub-genre specific effects, change the active sub-genre
  if (game.activeLaptopSubgenre == obj.id) {
    obj.style.boxShadow = "none";
    game.activeLaptopSubgenre = "nogenre";
    progressContainer.style.boxShadow = "none"
  }
  else {
    var glowColor = getComputedStyle(obj).borderColor;

    if (game.activeLaptopSubgenre !== "nogenre") {
      document.getElementById(game.activeLaptopSubgenre).style.boxShadow = "none";
    }

    progressContainer.style.boxShadow = "0px 0px 80px 1px " + glowColor;
    obj.style.boxShadow = "0px 0px 5px 2px " + glowColor;

    if (obj.id == "electro") {
      var greenZone = document.getElementById("greenZone");
      var leftYellowZone = document.getElementById("leftYellowZone");
      var rightYellowZone = document.getElementById("rightYellowZone");

      greenZone.style.width = "27%";
      leftYellowZone.style.width = "12%";
      rightYellowZone.style.width = "12%";
    }
    else if (obj.id == "dubstep") {
      document.getElementById("dropProgressContainer").style.visibility = "visible";
      dropInterval = setInterval(dropTick, 100);
    }

    game.activeLaptopSubgenre = obj.id;
  }
}

function dropTick() {
  if (dropActive == true) {
    var dropProgress = document.getElementById("theDropProgress");
    dropProgress.value = dropProgress.value - 5;

    if (dropProgress.value <= 0) {
      dropActive = false;
      document.getElementById("laptop").style.boxShadow = "none";
    }
  }
  else {
    var dropProgress = document.getElementById("theDropProgress");
    dropProgress.value = dropProgress.value + 1;

    if (dropProgress.value >= dropProgress.max) {
      var laptopContainer = document.getElementById("laptop");
      var glowColor = getComputedStyle(document.getElementById("dubstep")).borderColor;

      dropActive = true;
      laptopContainer.style.boxShadow = "inset 0px 0px 150px 1px " + glowColor;
    }
  }
}

function getTooltipInfo(subgenre) {
  switch(subgenre) {
    case "trance":
      return {"genre": "Trance",
              "tooltip": "Reduces the maximum combo by 10 (but not lower than 1). Generates 2x passive beat progress."};
      break;
    case "house":
      return {"genre": "House",
              "tooltip": "Clicking generates 2x beat progress when using the slowest tempo."};
      break;
    case "drumAndBass":
      return {"genre": "Drum and Bass",
              "tooltip": "Increases the maximum combo by 20."};
      break;
    case "hardstyle":
      return {"genre": "Hardstyle",
              "tooltip": "Clicking generates 2x beat progress when using the fastest tempo."};
      break;
    case "electro":
      return {"genre": "Electro",
              "tooltip": "Increases the size of the green zone and reduces the size of the yellow zones."};
      break;
    case "industrial":
      return {"genre": "Industrial",
              "tooltip": "Clicking in the red zones generates 5x more beat progress."};
      break;
    case "dubstep":
      return {"genre": "Dubstep",
              "tooltip": "Every 50 seconds, enter The Drop. When The Drop occurs, clicking generates 10x beat progress for 10 seconds."};
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
  tooltip.style.display = "inline";

  var tooltipHeader = document.getElementById('tooltipHeader');
  tooltipHeader.style.borderBottom = "none";
}

function hideGenreTooltip() {
  document.getElementById('tooltip').style.width = "200px";
  hideTooltip();
}

function populateGenrePopUp(taskName) {
  var popUp = document.getElementById("popUpContent");

  popUp.innerHTML += "<p id='popUpGenreHeader'>Select A Sub-Genre To Explore</p>";

  game.unlearnedLaptopSubgenres.forEach(function (genre) {
    var genreRow = "<div class='genreRow'>";
    var tooltipInfo = getTooltipInfo(genre);

    if (tooltipInfo !== undefined) {
      genreRow += "<button class='popUpGenreButton' onclick='selectGenre(\"" + genre + "\")'>" + tooltipInfo.genre + "</button>";
      genreRow += "<p class='popUpGenreText'>" + tooltipInfo.tooltip + "</p>";
    }

    genreRow += "</div>"
    popUp.innerHTML += genreRow;
  });
}

function selectGenre(subgenre) {
  var task = getTask("Explore A Sub-Genre");
  var htmlObj = document.getElementById(subgenre);
  var index = game.unlearnedLaptopSubgenres.indexOf(subgenre);

  htmlObj.style.display = "inline";
  setLaptopGenre(htmlObj);
  appendToOutputContainer("Your music is definitely leaning into the " + subgenre + " genre. Further exploring the genre will help you develop as a musician.");
  task.finishFn(task);
  game.unlearnedLaptopSubgenres.splice(index, 1);
  closePopUp();
  updateView();
}
