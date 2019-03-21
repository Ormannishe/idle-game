// Contains all game data and functions for manipulating top-level game data
// Authoritative source for game constants (ie. how much things cost)

function Game() {
  this.player = new Player();
  this.tasks = [];
  this.resources = { fame: {},
                     money: {},
                     beats: { instruments: ["laptop"],
                              resourcesPer: 30,
                              validResources: ["clicks"],
                              xpPer: 5 },
                     samples: { instruments: ["laptop"],
                               resourcesPer: 25,
                               validResources: ["beats"],
                               xpPer: 50 },
                     notes: { instruments: ["keyboard"],
                              resourcesPer: 50,
                              validResources: ["clicks"],
                              xpPer: 5 },
                     measures: { instruments: ["keyboard"],
                                 resourcesPer: 25,
                                 validResources: ["notes"],
                                 xpPer: 50 },
                     songs: { instruments: ["laptop", "keyboard"],
                              resourcesPer: 50,
                              validResources: ["samples", "measures"],
                              xpPer: 500 }
                    };
};

function addBeat(n) {
  if (n == undefined)
    n = 1;

  game.player.beats += n;
  game.player.lifetimeBeats += n;
  game.player.addXp("laptop", (game.xpPerBeat * n));

  updateView();
}

function addNote(n) {
  if (n == undefined)
    n = 1;

  game.player.notes += n;
  game.player.lifetimeNotes += n;
  game.player.addXp('keyboard', (game.xpPerNote * n));
  updateView();
}

function makeSample(numToMake) {
  var totalCost;

  if (numToMake == undefined)
    numToMake = 1;

  totalCost = (game.beatsPerSample * numToMake);

  if (game.player.beats >= totalCost) {
    game.player.beats -= totalCost;
    game.player.samples += numToMake;
    game.player.addXp('laptop', game.xpPerSample * numToMake);
  }

  updateView();
}

function makeMeasure(numToMake) {
  var totalCost;

  if (numToMake == undefined)
    numToMake = 1;

  totalCost = (game.notesPerMeasure * numToMake);

  if (game.player.notes >= totalCost) {
    game.player.notes -= totalCost;
    game.player.measures += numToMake;
    game.player.addXp('keyboard', game.xpPerMeasure * numToMake);
  }

  updateView();
}
