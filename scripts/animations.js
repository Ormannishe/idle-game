var beatInterval;
var tickInterval;
var markerReverse = false;

function toggleItemTab(evt, tab) {
  var tabContent, activeTabs;

  // Hide all tabcontent
  tabContent = document.getElementsByClassName("tabcontent");

  for (var i = 0; i < tabContent.length; i++) {
    tabContent[i].style.display = "none";
  }

  // Set the active tab to non-active
  activeTabs = document.getElementsByClassName("active-tab")

  for (var i = 0; i < activeTabs.length; i++) {
    activeTabs[i].className = "tab";
  }

  // Show the new tab content, and make the new tab 'active'
  document.getElementById(tab).style.display = "block";
  evt.currentTarget.className = "active-tab";
}

function toggleInstrument(evt, instrument) {
  // TODO: This function can probably be combined with toggleItemTab and made generic
  var instrumentContent, activeInstrument;

  // Hide all instrumentContent
  instrumentContent = document.getElementsByClassName("instrumentContent");

  for (var i = 0; i < instrumentContent.length; i++) {
    instrumentContent[i].style.display = "none";
  }

  // Set the active instrument to non-active
  activeInstrument = document.getElementsByClassName("activeInstrument")

  for (var i = 0; i < activeInstrument.length; i++) {
    activeInstrument[i].className = "instrument";
  }

  // Show the new instrument content, and make the new instrument 'active'
  document.getElementById(instrument).style.display = "block";
  evt.currentTarget.className = "activeInstrument";
}

function animateBeat() {
  /*
    Animate the moving marker for the laptop minigame by altering the 'left' css attribute of the 'marker' element.
    When we've exceeded a maximum 'left' value, reverse the direction of movement.
  */

  var marker = document.getElementById("marker");
  var left = parseFloat(marker.style.left);

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
  clearInterval(beatInterval);
  beatInterval = setInterval(animateBeat, n);
}

function naturalTick() {
  if (activeTask != undefined) {
    var progress = document.getElementById('taskProgress');
    updateProgress(progress, progress.value + 1, progress.max, taskCompleteFn);
  }

  adjustSongStats();
  updateView();
}

function startAnimations() {
  beatInterval = setInterval(animateBeat, 15);
  tickInterval = setInterval(naturalTick, 1000);
}
