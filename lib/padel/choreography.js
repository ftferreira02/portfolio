// Shot timing and court positions from the approved animation prototype.
const choreography = [
  // Point 1: serve, return, volley into the corner
  { contentKey: "hello", pt: 0, who: "A1", type: "serve", at: [2.6, 7.4], z: 0.75, shot: "Serve",
    via: [{ p: [14.0, 2.9], z: 0, peak: 1.1 }], peak: 0.5 },
  { contentKey: "approach", pt: 0, who: "B1", type: "drive", bh: true, at: [17.5, 2.2], z: 0.9, shot: "Backhand return", peak: 1.1 },
  { contentKey: "tools", pt: 0, who: "A2", type: "volley", at: [8.2, 3.3], z: 1.25, shot: "Volley", chase: { B2: [18.3, 8.5] },
    win: [{ p: [15.6, 7.9], z: 0, peak: 0.3 }, { p: [17.4, 10], z: 0.5, peak: 0.3 }, { p: [20, 9.0], z: 0.25, peak: 0.15 }, { p: [19.2, 8.5], z: 0, peak: 0.1 }] },

  // Point 2: chiquita, deep volley, lob off the back glass, bajada de pared
  { contentKey: "madeira", pt: 1, who: "A1", type: "serve", at: [2.6, 2.6], z: 0.75, shot: "Serve",
    via: [{ p: [14.2, 7.1], z: 0, peak: 1.1 }], peak: 0.5 },
  { contentKey: "internship", pt: 1, who: "B2", type: "chiquita", at: [17.5, 7.7], z: 0.8, shot: "Chiquita", peak: 1.25 },
  { contentKey: "firstJob", pt: 1, who: "A2", type: "volley", bh: true, at: [8.4, 6.9], z: 0.6, shot: "Backhand volley",
    via: [{ p: [16.4, 2.6], z: 0, peak: 1.0 }, { p: [20, 1.8], z: 1.0, peak: 0.5 }], peak: 0.25 },
  { contentKey: "aveiro", pt: 1, who: "B1", type: "lob", bh: true, at: [17.8, 2.3], z: 0.8, shot: "Backhand off the glass",
    via: [{ p: [3.4, 4.2], z: 0, peak: 6.5 }, { p: [0, 3.9], z: 2.2, peak: 0.5 }], peak: 0.35, ms: 2700 },
  { contentKey: "research", pt: 1, who: "A1", type: "bajada", at: [2.5, 4.1], z: 2.3, shot: "Bajada de pared", chase: { B1: [18.6, 4.4], B2: [18.6, 6.4] },
    win: [{ p: [14.6, 5.2], z: 0, peak: 0.35 }, { p: [20, 5.5], z: 0.5, peak: 0.35 }, { p: [18.4, 5.4], z: 0, peak: 0.3 }] },

  // Point 3: lob, bandeja, contrapared, víbora
  { contentKey: "memoria", pt: 2, who: "A1", type: "serve", at: [2.6, 7.4], z: 0.75, shot: "Serve",
    via: [{ p: [14.0, 2.9], z: 0, peak: 1.1 }], peak: 0.5 },
  { contentKey: "results", pt: 2, who: "B1", type: "lob", at: [17.5, 2.2], z: 0.9, shot: "Lob", peak: 5 },
  { contentKey: "edufiable", pt: 2, who: "A1", type: "bandeja", at: [5.4, 6.6], z: 2.3, shot: "Bandeja",
    via: [{ p: [16.6, 2.5], z: 0, peak: 0.9, bend: -0.6 }, { p: [20, 1.9], z: 0.55, peak: 0.3 }], peak: 0.1 },
  { contentKey: "quests", pt: 2, who: "B1", type: "contra", at: [19.0, 2.0], z: 0.6, shot: "Contrapared",
    via: [{ p: [20, 2.2], z: 1.9, peak: 0.2 }], peak: 4.2 },
  { contentKey: "kitswipe", pt: 2, who: "A1", type: "vibora", at: [5.0, 3.4], z: 2.1, shot: "Víbora", chase: { B2: [18.5, 8.8] },
    win: [{ p: [16.0, 8.3], z: 0, peak: 0.5, bend: 0.9 }, { p: [17.5, 10], z: 0.55, peak: 0.3 }, { p: [20, 9.0], z: 0.3, peak: 0.15 }, { p: [19.1, 8.3], z: 0, peak: 0.1 }] },

  // Point 4: a short lob, and a smash out over the side wall
  { contentKey: "now", pt: 3, who: "A1", type: "serve", at: [2.6, 2.6], z: 0.75, shot: "Serve",
    via: [{ p: [14.2, 7.1], z: 0, peak: 1.1 }], peak: 0.5 },
  { contentKey: "offCourt", pt: 3, who: "B2", type: "lob", bh: true, at: [17.5, 7.7], z: 0.8, shot: "Backhand lob", peak: 4.6 },
  { contentKey: "contact", pt: 3, who: "A1", type: "smash", at: [7.2, 5.8], z: 3.1, shot: "Smash x3",
    win: [{ p: [13.6, 6.8], z: 0, peak: 0 }, { p: [18.4, 10.3], z: 3.9, peak: 1.8 }, { p: [20.8, 12.6], z: 1.2, peak: 1.2 }] },
];

export { choreography };

// The secret tie-break: a rally in the style of Agustín Tapia's highlight reels. The opponents
// smash the ball out over the side wall, Francisco sprints out through the fence gap and lobs it
// back in from outside the court. `run` sends a player through the gap instead of the glass.
const DOOR_IN = [5.8, 9.3], DOOR_OUT = [5.8, 10.7];
export const tieBreak = [
  { who: "A1", type: "serve", at: [2.6, 7.4], z: 0.75, shot: "Serve",
    via: [{ p: [14.0, 2.9], z: 0, peak: 1.1 }], peak: 0.5 },
  { who: "B1", type: "drive", bh: true, at: [17.5, 2.2], z: 0.9, shot: "Backhand return", peak: 1.1 },
  { who: "A2", type: "volley", at: [8.2, 3.3], z: 1.25, shot: "Deep volley",
    via: [{ p: [15.8, 7.0], z: 0, peak: 0.9 }], peak: 0.3 },
  { who: "B2", type: "lob", at: [17.6, 7.8], z: 0.8, shot: "Lob", ms: 2400,
    via: [{ p: [3.8, 6.0], z: 0, peak: 5.6 }, { p: [0, 6.3], z: 2.0, peak: 0.5 }], peak: 0.4 },
  { who: "A1", type: "lob", at: [2.4, 6.4], z: 1.6, shot: "Lob off the back glass", ms: 2300, peak: 3.8 },
  { who: "B1", type: "smash", at: [12.8, 3.4], z: 3.1, shot: "Smash x3", ms: 2300, run: { A1: [DOOR_IN, DOOR_OUT] },
    via: [{ p: [5.6, 7.9], z: 0, peak: 0 }, { p: [3.6, 12.0], z: 0, peak: 4.4 }], peak: 0.5 },
  { who: "A1", type: "lob", at: [2.8, 11.7], z: 0.8, shot: "Lob from outside the court", ms: 2700, run: { A1: [DOOR_OUT, DOOR_IN] },
    via: [{ p: [15.6, 7.2], z: 0, peak: 7 }], peak: 0.8 },
  { who: "B2", type: "lob", bh: true, at: [18.4, 8.0], z: 1.0, shot: "Scrambled lob", peak: 4.6 },
  { contentKey: "tiebreak", who: "A2", type: "smash", at: [7.0, 3.6], z: 3.1, shot: "Smash x4", chase: { B1: [18.9, 3.4], B2: [18.9, 6.6] },
    win: [{ p: [14.2, 4.4], z: 0, peak: 0 }, { p: [22.9, 6.0], z: 0, peak: 6.5 }] },
].map((beat) => ({ contentKey: "bonus", ...beat, pt: 4 }));

export const commentary = {
  serve: "Serve away. The Portfolio Open is in business.",
  drive: "A drive through the court — no time for a coffee.",
  volley: "Volley! Quick hands at the net.",
  chiquita: "Chiquita… a little touch, a long run.",
  lob: "Lob over the top… eyes on the sky!",
  bandeja: "Bandeja! Keeping a lid on this rally.",
  vibora: "Víbora! That one has teeth.",
  bajada: "Bajada off the back glass… here it comes!",
  contra: "Contrapared! The glass joins the team.",
  smash: "Smash! Special delivery, express pace.",
  beats: {
    hello: "Serve away. The Portfolio Open is in business.",
    madeira: "Fresh serve, fresh start. From the island to the baseline.",
    memoria: "Serve down the middle. Time to show what we built.",
    now: "One more serve. Let's finish this together, partner.",
    approach: "Backhand return. The opponents have read the brief.",
    firstJob: "Backhand volley, deep into the corner. No room to relax.",
    aveiro: "Lob off the back glass. Plenty of time to think… maybe.",
    offCourt: "A short backhand lob. That is an invitation!",
  },
  bonus: [
    "Bonus serve! Four points earned us an encore.",
    "Tie-break return. Nobody wants this partnership to end.",
    "Deep volley. Make them work for it.",
    "Lob over the top… all the way to the back glass.",
    "Off the glass and up into the lights. Brave.",
    "Smash x3! That's leaving the court… surely that's over?",
    "He's OUT of the court! Through the gap and lobbing from the crowd!",
    "It's back in! They can only scramble it up…",
    "This is it. Finish it, partner.",
  ],
  won: ["Point to us. Partnership material!", "We take it off the glass. That's a useful rebound.", "Our point. Another project delivered.", "Four for four! Partner, we've unlocked an encore.", "Out of the court, out of the building! Five together, partner!"],
  lost: ["Their point. We'll call that market research.", "The glass wins this round. We keep learning.", "Their point. That one needs another iteration.", "They take the last point. Thanks for sticking with us.", "After all that, they take it. That rally deserved a trophy anyway."],
};
