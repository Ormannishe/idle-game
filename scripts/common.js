/*
  Common functions that are useful throughout the application
*/

function round(value, decimals) {
  // Rounds a value to the given number of decimal points
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function capitalize(s) {
  // Capitalized the first letter in a given string and returns it
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function partial() {
  /*
    Takes a function, fn, and fewer than the normal arguments to fn, and returns
    a function that takes a variable number of additional args. When called, the
    returned function calls fn with args + additional args.
  */
  var fn = arguments[0];
  var args = Object.values(arguments).slice(1);
  var returnFn = function () {
    if (arguments.length > 0)
      args = args.concat(Object.values(arguments));

    return fn.apply(null, args);
  };

  return returnFn;
}

function showUiElement(elementId, displayType) {
  document.getElementById(elementId).style.display = displayType;
  uiData[elementId] = displayType;
}

function updateProgress(progress, value, max, triggerFn) {
  /*
    Sets the value and max of the given progress bar to the given value/max.
    If value is larger than max, value = value - max. If trigger function(s) are
    defined, execute them. This process is repeated until the value is less than
    the max.
  */
  progress.max = max;

  while (value >= max) {
    value = value - max;

    if (triggerFn !== undefined)
      triggerFn();
  }

  progress.value = value;
}

function updateMultiplier(multiplier, elementId) {
  /*
    Update the multiplier of the given elementId, applying style effects
    scaling with the value of the multiplier
  */
  if (multiplier < 1)
    multiplier = 1;

  var colorAndFontShift = Math.min(10, multiplier);
  var multDiv = document.getElementById(elementId);
  var r = 250 - (colorAndFontShift - 1) * 30;
  var g = 250 - Math.abs(colorAndFontShift - 5) * 30;
  var b = (colorAndFontShift - 5) * 50;

  multDiv.innerHTML = "x" + multiplier;
  multDiv.style.fontSize = 15 + colorAndFontShift;
  multDiv.style.color = "rgb(" + r + "," + g + "," + b + ")";
}

function getJobChance(instrument, jobType) {
  var jobAttributes = game.jobs[instrument][jobType];
  var playerAttributes = game.player.jobs[instrument];
  var occurrenceRate = Math.round((jobAttributes.baseOccurrenceRate - game.player.resources.fame.amount / 10) * playerAttributes.procMod);

  return Math.max(occurrenceRate, 1);
}

function getValidJobLocation(instrument, jobType, taskPrefix) {
  if (taskPrefix == undefined)
    taskPrefix = "";

  var validLocations = game.jobs[instrument][jobType].locations.filter(function(job) {
    if (getContext(taskPrefix + job) == undefined)
      return job;
  });

  return validLocations[Math.floor(Math.random() * validLocations.length)];
}

function secondsToDhms(seconds) {
  var d = Math.floor(seconds / (3600*24));
  var h = Math.floor(seconds % (3600*24) / 3600);
  var m = Math.floor(seconds % 3600 / 60);
  var s = Math.floor(seconds % 60);

  var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
  var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  return dDisplay + hDisplay + mDisplay + sDisplay;
}
