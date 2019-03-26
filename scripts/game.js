/*
  Contains all game data and functions for manipulating top-level game data
  Authoritative source for game constants (ie. how much things cost)
*/

function Game() {
  this.player = new Player();
  this.triggerFnSet = new Set();
  this.tasks = [];
  this.activeTask = undefined;
  this.resources = { fame: {},
                     money: {},
                     beats: { instrument: "laptop",
                              clicksPer: 30,
                              xpPer: 5 },
                     samples: { instrument: "laptop",
                               resourcesPer: 25,
                               requiredResource: "beats",
                               xpPer: 50 },
                     notes: { instrument: "keyboard",
                              clicksPer: 50,
                              xpPer: 5 },
                     measures: { instrument: "keyboard",
                                 resourcesPer: 25,
                                 requiredResource: "notes",
                                 xpPer: 50 }
                    };
  this.specialResources = { songs: { instruments: ["laptop", "keyboard"],
                                     resourcesPer: 50,
                                     validResources: ["samples", "measures"],
                                     xpPer: 500 }};
  this.instruments = { laptop: { level: 1,
                                 currentTempo: "slow",
                                 tempoSpeeds: { slowest: 25,
                                                slow: 15,
                                                fast: 10,
                                                fastest: 5 },
                                 dropActive: false },
                       keyboard: { currentNote: undefined,
                                   currentSong: undefined }
                     };
};
