// Outcomes describe these particular staged rallies, rather than universal
// rules about which padel shot wins. Every branch keeps the same story beats.
export const shotDecisions = {
  tools: {
    title: "A low ball at the net",
    situation: "You're close to the net and the ball is low. Both opponents are deep. How do you finish?",
    options: [
      { id: "volley", label: "Volley", hint: "A compact punch into the open corner.", winner: "A", explanation: "The compact volley stays low and finds the corner before the defenders can recover.", patch: { type: "volley", shot: "Cross-court volley" } },
      { id: "chiquita", label: "Soft angle", hint: "Take the pace off and make them run forward.", winner: "A", explanation: "The soft angle drops short. Both defenders are too deep to reach the second bounce.", patch: { type: "chiquita", shot: "Soft angled volley", win: [{ p: [11.4, 1.3], z: 0, peak: 0.6 }, { p: [12.1, 0.6], z: 0, peak: 0.2 }], chase: { B1: [13.2, 1.5] } } },
      { id: "drive", label: "Full drive", hint: "Take a big swing at the low ball.", winner: "B", explanation: "The big swing catches the low ball too late and drives it into the net. A shorter swing would leave more margin.", patch: { type: "drive", shot: "Drive into the net", win: [{ p: [9.95, 3.9], z: 0.75, net: true }, { p: [9.6, 4.0], z: 0 }, { p: [9.3, 4.1], z: 0, peak: 0.1 }], chase: {} } },
    ],
  },
  research: {
    title: "The glass gives you a high ball",
    situation: "You've let the ball come off the back glass. It's high, but you're still near your baseline.",
    options: [
      { id: "bajada", label: "Bajada", hint: "Drive down from the high rebound.", winner: "A", explanation: "You wait for the rebound and hit down through the gap. The ball stays too low for the defenders.", patch: { type: "bajada", shot: "Bajada de pared" } },
      { id: "lob", label: "High lob", hint: "Lift it over the opponents and into the back court.", winner: "A", explanation: "The deep lob sends the opponents backwards. In this rally they misjudge the rebound and miss the second bounce.", patch: { type: "lob", shot: "Deep defensive lob", win: [{ p: [16.6, 4.4], z: 0, peak: 5.8 }, { p: [20, 4.8], z: 1.2, peak: 0.5 }, { p: [18.7, 5.0], z: 0, peak: 0.2 }], chase: { B1: [18.4, 3.8], B2: [18.6, 6.3] } } },
      { id: "smash", label: "Flat smash", hint: "Try to finish with power from the baseline.", winner: "B", explanation: "From this far back, the flat smash reaches the opponents' glass before bouncing. The point goes to them.", patch: { type: "smash", shot: "Smash long", win: [{ p: [20, 5.4], z: 1.3, peak: 0.4 }, { p: [19.0, 5.5], z: 0 }], chase: {} } },
    ],
  },
  kitswipe: {
    title: "An overhead from deep in court",
    situation: "The lob has pushed you back. The ball is at shoulder height, with space in the opponents' back corner.",
    options: [
      { id: "vibora", label: "Víbora", hint: "Add sidespin and attack the side glass.", winner: "A", explanation: "The víbora skids into the side glass and dies in the corner. The defender can't reach it.", patch: { type: "vibora", shot: "Víbora" } },
      { id: "bandeja", label: "Bandeja", hint: "Keep it controlled and deep into the corner.", winner: "A", explanation: "The controlled bandeja lands deep and stays low after the glass. This time the defender's recovery comes too late.", patch: { type: "bandeja", shot: "Bandeja to the corner", win: [{ p: [17.2, 8.0], z: 0, peak: 0.7 }, { p: [20, 8.5], z: 0.6, peak: 0.3 }, { p: [18.8, 8.7], z: 0, peak: 0.2 }], chase: { B2: [18.4, 7.8] } } },
      { id: "smash", label: "Power smash", hint: "Go for a flat winner from this deep position.", winner: "B", explanation: "The deep position leaves too little downward angle. The smash hits the back glass without a bounce.", patch: { type: "smash", shot: "Smash into the back glass", win: [{ p: [20, 7.8], z: 1.7, peak: 0.4 }, { p: [19.1, 8.0], z: 0 }], chase: {} } },
    ],
  },
  contact: {
    title: "A short lob. Your chance.",
    situation: "You're forward in court with a high ball and both opponents deep. Pick your last shot.",
    options: [
      { id: "smash", label: "Smash x3", hint: "Hit down hard and send it over the side wall.", winner: "A", explanation: "From this forward position, the smash has enough angle to bounce up and leave the court. Point won.", patch: { type: "smash", shot: "Smash x3" } },
      { id: "bandeja", label: "Bandeja", hint: "Place a controlled ball into the empty corner.", winner: "A", explanation: "You trade power for placement. The bandeja stays low in the open corner and beats the recovering defender.", patch: { type: "bandeja", shot: "Placed bandeja", win: [{ p: [16.7, 2.0], z: 0, peak: 0.3 }, { p: [20, 1.4], z: 0.6, peak: 0.4 }, { p: [18.6, 1.2], z: 0, peak: 0.2 }], chase: { B1: [18.2, 2.1] } } },
      { id: "vibora", label: "Sharp víbora", hint: "Cut hard across the ball towards the side glass.", winner: "B", explanation: "The cut goes too wide and reaches the side glass before bouncing. Point lost, but you've still reached the end of the story.", patch: { type: "vibora", shot: "Víbora wide", win: [{ p: [16.8, 10], z: 1.6, peak: 0.2 }, { p: [17.2, 9.2], z: 0 }], chase: {} } },
    ],
  },
  tiebreak: {
    title: "The crowd is on its feet",
    situation: "We survived the smash from outside the court. Their lob is short, you're at the net and both opponents are pinned to the back glass.",
    options: [
      { id: "smash", label: "Smash x4", hint: "Hit down so hard it bounces out over their back wall.", winner: "A", explanation: "From right on top of the net, the flat smash bounces high enough to clear the 4 m back wall. Into the crowd. Point won.", patch: { type: "smash", shot: "Smash x4" } },
      { id: "vibora", label: "Víbora", hint: "Cut it into the side glass where nobody is.", winner: "A", explanation: "The víbora skids off the side glass and dies in the open corner while both defenders are still deep.", patch: { type: "vibora", shot: "Víbora into the corner", win: [{ p: [16.6, 8.6], z: 0, peak: 0.4, bend: 0.6 }, { p: [17.6, 10], z: 0.6, peak: 0.3 }, { p: [19.0, 9.2], z: 0.2, peak: 0.1 }, { p: [18.6, 8.8], z: 0, peak: 0.1 }], chase: { B2: [18.4, 8.6] } } },
      { id: "flat", label: "Flat bomb", hint: "Pure power, straight at the back glass.", winner: "B", explanation: "Too flat: it reaches the back glass before bouncing, which is out in padel. A heartbreaking end to the rally of the match.", patch: { type: "smash", shot: "Smash into the back glass", win: [{ p: [20, 4.8], z: 1.6, peak: 0.3 }, { p: [19.0, 4.9], z: 0 }], chase: {} } },
    ],
  },
};

// Scoring is derived from the timeline, so rewinding never awards a point twice.
export function scoreAt(beats, time, resolveAt = 0.72) {
  const score = { a: 0, b: 0, played: 0, last: -1 };
  beats.forEach((beat, index) => {
    if (!beat.win || time < index + resolveAt) return;
    score[beat.winner === "B" ? "b" : "a"]++;
    score.played++;
    score.last = index;
  });
  return score;
}
