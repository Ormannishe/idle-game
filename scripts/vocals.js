var solutionRequestId;
var problemRequestId;
var step = 0; // controls animation speed

function startVocals() {
  var progress = document.getElementById('vocalBeatProgress');
  var requiredProgress = Math.ceil(game.resources.lyrics.clicksPer * game.player.instruments.vocal.reqClicksMod);

  document.addEventListener('keydown', vocalsKeyDownEvent);
  updateMultiplier(game.player.instruments.vocal.multiplier, "vocal");
  updateProgress(progress, game.player.instruments.vocal.currentProgress, requiredProgress, partial(addResource, "lyrics"));
  solutionRequestId = window.requestAnimationFrame(drawSolution);
  problemRequestId = window.requestAnimationFrame(drawProblem);
}

function stopVocals() {
  var resourceNumber = document.getElementById("vocalResourceNumber");

  document.removeEventListener('keydown', vocalsKeyDownEvent);
  resourceNumber.classList.remove("createdResourceAnimation");
  window.cancelAnimationFrame(solutionRequestId);
  window.cancelAnimationFrame(problemRequestId);
}

function vocalsKeyDownEvent(event) {
  switch (event.code) {
    case "ArrowLeft":
      adjustFrequency(-1);
      break;
    case "ArrowRight":
      adjustFrequency(1);
      break;
    case "ArrowUp":
      adjustAmplitude(1);
      break;
    case "ArrowDown":
      adjustAmplitude(-1);
      break;
    default:
      break;
  }
}

function adjustFrequency(amount) {
  var currFrequency = game.player.instruments.vocal.problemFrequency;
  var newFrequency = currFrequency + amount;

  if (newFrequency >= game.instruments.vocal.minFrequency &&
      newFrequency <= game.instruments.vocal.maxFrequency) {
        game.player.instruments.vocal.problemFrequency = newFrequency;
      }
}

function adjustAmplitude(amount) {
  var currAmplitude = game.player.instruments.vocal.problemAmplitude;
  var newAmplitude = currAmplitude + amount;

  if (newAmplitude >= game.instruments.vocal.minAmplitude &&
      newAmplitude <= game.instruments.vocal.maxAmplitude) {
        game.player.instruments.vocal.problemAmplitude = newAmplitude;
      }
}

function drawProblem() {
  var framesOnCurrSolution = game.player.instruments.vocal.problemFrames;
  var amplitude = game.player.instruments.vocal.problemAmplitude;
  var frequency = game.player.instruments.vocal.problemFrequency;
  var solutionAmplitude = game.player.instruments.vocal.solutionAmplitude;
  var solutionFrequency = game.player.instruments.vocal.solutionFrequency;
  var strokeColor = "rgb(255,50,50)";

  // If the problem has been solved, award vocalProgress every frame and set
  // the stroke color to green
  if (amplitude == solutionAmplitude && frequency == solutionFrequency) {
    var numLyrics;
    var progressAmount = 1;
    var requiredProgress = Math.ceil(game.resources.lyrics.clicksPer * game.player.instruments.vocal.reqClicksMod);
    var progressMultiplier = game.player.instruments.vocal.multiplier;
    var maxMultiplier = game.instruments.vocal.maxMultiplier + game.player.instruments.vocal.bonusMaxMultiplier;
    var progress = document.getElementById('vocalBeatProgress');

    strokeColor = "rgb(30,255,30)"
    numLyrics = updateProgress(progress, (progress.value + (progressAmount * progressMultiplier)), requiredProgress, partial(addResource, "lyrics"));
    game.player.instruments.vocal.currentProgress = progress.value;

    if (numLyrics > 0)
      resourceCreatedAnimation(numLyrics, "vocal");
  }

  draw("problemCanvas", amplitude, frequency, strokeColor);
  game.player.instruments.vocal.problemFrames++;

  // If the maximum number of frames to solve the problem has been exceeded,
  // change the problem. If the problem was solved, add to the multiplier.
  // Otherwise, reset the multiplier to 1.
  if (framesOnCurrSolution >= game.instruments.vocal.framesToSolve) {
    var baseAmplitude = game.instruments.vocal.minAmplitude;
    var maxAdditionalAmp = game.instruments.vocal.maxAmplitude - baseAmplitude;
    var baseFrequency = game.instruments.vocal.minFrequency;
    var maxAdditionalFreq = game.instruments.vocal.maxFrequency - baseFrequency;

    if (amplitude == solutionAmplitude && frequency == solutionFrequency) {
      game.player.stats.vocal.problemsSolved++;

      if (progressMultiplier < maxMultiplier)
        game.player.instruments.vocal.multiplier++;
    }
    else {
      game.player.instruments.vocal.multiplier = 1;
    }

    updateMultiplier(game.player.instruments.vocal.multiplier, "vocal");
    game.player.instruments.vocal.solutionAmplitude = Math.round((maxAdditionalAmp * Math.random()) + baseAmplitude);
    game.player.instruments.vocal.solutionFrequency = Math.round((maxAdditionalFreq * Math.random()) + baseFrequency);
    game.player.instruments.vocal.problemFrames = 0;
  }

  problemRequestId = window.requestAnimationFrame(drawProblem);
}

function drawSolution() {
  var amplitude = game.player.instruments.vocal.solutionAmplitude;
  var frequency = game.player.instruments.vocal.solutionFrequency;
  var strokeColor = "rgb(100,100,100)";

  draw("solutionCanvas", amplitude, frequency, strokeColor);
  solutionRequestId = window.requestAnimationFrame(drawSolution);
}

function draw(canvasId, amplitude, frequency, strokeColor) {
  var canvas = document.getElementById(canvasId);
  var context = canvas.getContext("2d");

  context.clearRect(0, 0, 500, 500);
  context.save();

  plotSine(context, step, 50, amplitude, frequency, strokeColor);
  context.restore();

  step -= 0.5;
}

function plotSine(ctx, xOffset, yOffset, amplitude, frequency, strokeColor) {
  var width = ctx.canvas.width;
  var height = ctx.canvas.height;
  var x = -4;
  var y = 0;

  ctx.beginPath();
  ctx.lineWidth = 2;
  ctx.strokeStyle = strokeColor;
  ctx.moveTo(x, 50);

  while (x < width) {
    y = height / 2 + amplitude * Math.sin((x + xOffset) / frequency);
    ctx.lineTo(x, y);
    x++;
  }
  ctx.stroke();
  ctx.save();
  ctx.restore();
}

/*
  Debug Functionality
*/

function solveVocal() {
  game.player.instruments.vocal.problemAmplitude = game.player.instruments.vocal.solutionAmplitude;
  game.player.instruments.vocal.problemFrequency = game.player.instruments.vocal.solutionFrequency;
}
