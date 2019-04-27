/*
  Common functions that are useful throughout the application
*/

function round(value, decimals) {
  // Rounds a value to the given number of decimal points
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function anonymize(fn, args) {
  /*
    Returns an anonymous function for deferred execution, which calls the passed
    in fn against a passed in list of args.
  */
  var returnFn = function() { return fn.apply(null, args)};

  return returnFn;
}

function showUiElement(elementId, styleType) {
  document.getElementById(elementId).style.display = styleType;
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

    if (typeof triggerFn === "function")
      triggerFn();
    else if (typeof triggerFn === "object")
      triggerFn.forEach(function(triggerFn) { triggerFn() });
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
