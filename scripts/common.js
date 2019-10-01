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
    the max. Returns the number iterations required for value to be less than max.
  */
  var numTriggers = 0;

  progress.max = max;

  while (value >= max) {
    numTriggers++;
    value = value - max;

    if (triggerFn !== undefined)
      triggerFn();
  }

  progress.value = value;
  return numTriggers;
}

function updateMultiplier(value, instrument) {
  if (value < 1)
    value = 1;

  var maxValue = game.instruments[instrument].maxMultiplier + game.player.instruments[instrument].bonusMaxMultiplier;
  var colorMap = getColorFromRange(value, 1, maxValue);
  var multiplierObj = document.getElementById(instrument + "Multiplier");

  multiplierObj.innerHTML = "x" + value;
  multiplierObj.style.fontSize = Math.round(15 + (15 * value / maxValue));
  multiplierObj.style.color = "rgb(" + colorMap.red + "," + colorMap.green + "," + colorMap.blue + ")";
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

function getColorFromRange(value, min, max) {
  /*
    Given a color range (min to max), map the given value to a color on the color
    wheel (where min = red, max = purple)

    There are 5 phases in the transition:
    1. Starting with red maxed out, gradually add green (Red to Yellow)
    2. Starting with red and green maxed out, gradually remove red (Yellow to Green)
    3. Starting with green maxed out, gradually add blue (Green to Teal)
    4. Starting with green and blue maxed out, gradually remove green (Teal to Blue)
    5. Starting with blue maxed out, gradually add red (Blue to Purple)

    Therefore, every 20% of the range is a color breakpoint
  */
  var minColor = 102; // 102 default makes colors more pastel
  var extraColor = 255 - minColor; // amount of additional color we can add
  var red = minColor;
  var green = minColor;
  var blue = minColor;
  var percentage = ((value - min) / max);

  if (percentage <= 0.2) { // gradually add green
    red = 255;
    green = (extraColor * percentage * 5) + minColor;
  }
  else if (percentage > 0.2 && percentage <= 0.4) { // gradually remove red
    red = (extraColor * (1 - (percentage - 0.2) * 5)) + minColor;
    green = 255;
  }
  else if (percentage > 0.4 && percentage <= 0.6) { // gradually add blue
    green = 255;
    blue = (extraColor * (percentage - 0.4) * 5) + minColor;
  }
  else if (percentage > 0.6 && percentage <= 0.8) { // gradually remove green
    green = (extraColor * (1 - (percentage - 0.6) * 5)) + minColor;
    blue = 255;
  }
  else if (percentage > 0.8 && percentage <= 1) { // gradually add red
    blue = 255;
    red = (extraColor * (percentage - 0.5) * 5) + minColor;
  }
  else if (percentage > 1) {
    blue = 255;
    red = 255;
  }

  return {
    red: red,
    green: green,
    blue: blue
  };
}
