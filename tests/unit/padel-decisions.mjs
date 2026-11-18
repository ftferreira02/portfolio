import test from "node:test";
import assert from "node:assert/strict";
import { shotDecisions, scoreAt } from "../../lib/padel/decisions.js";
import { choreography, tieBreak } from "../../lib/padel/choreography.js";

const decisions = choreography.flatMap((beat, index) => shotDecisions[beat.contentKey] ? [{ index, beat, decision: shotDecisions[beat.contentKey] }] : []);

test("each point has playable winning and losing choices with finite trajectories", () => {
  assert.equal(decisions.length, 4);
  for (const { beat, decision } of decisions) {
    assert(decision.options.some((option) => option.winner === "A"));
    assert(decision.options.some((option) => option.winner === "B"));
    assert.equal(new Set(decision.options.map((option) => option.id)).size, decision.options.length);
    for (const option of decision.options) {
      const path = option.patch.win ?? beat.win;
      assert(path.length >= 2);
      assert(option.explanation.length > 20);
      for (const point of path) assert([...point.p, point.z, point.peak ?? 0].every(Number.isFinite));
    }
  }
});

test("all 81 choice combinations score exactly four points and rewind cleanly", () => {
  let checked = 0;
  function visit(options) {
    if (options.length < decisions.length) {
      for (const option of decisions[options.length].decision.options) visit([...options, option]);
      return;
    }
    const beats = structuredClone(choreography);
    options.forEach((option, point) => Object.assign(beats[decisions[point].index], option.patch, { winner: option.winner }));
    const score = scoreAt(beats, beats.length);
    assert.equal(score.a, options.filter((option) => option.winner === "A").length);
    assert.equal(score.b, options.filter((option) => option.winner === "B").length);
    assert.equal(score.a + score.b, 4);
    decisions.forEach(({ index }, point) => {
      assert.equal(scoreAt(beats, index + 0.71).played, point);
      assert.equal(scoreAt(beats, index + 0.72).played, point + 1);
      assert.equal(scoreAt(beats, index).played, point);
    });
    assert.deepEqual(scoreAt(beats, 0), { a: 0, b: 0, played: 0, last: -1 });
    checked++;
  }
  visit([]);
  assert.equal(checked, 81);
});

test("default and every choice clear the 0.88 m net by ball radius plus 4 cm", async () => {
  const { sampleSegment } = await import("../../lib/padel/path.js");
  const timeline = [...choreography, ...tieBreak];
  for (let k = 0; k < timeline.length; k++) {
    const base = timeline[k];
    const options = [{ id: "default", patch: {} }, ...(shotDecisions[base.contentKey]?.options ?? [])];
    for (const option of options) {
      const b = { ...base, ...option.patch };
      const pts = [{ p: b.at, z: b.z }, ...(b.win ?? [...(b.via ?? []), { p: timeline[k + 1].at, z: timeline[k + 1].z, peak: b.peak }])];
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], c = pts[i];
        // The deliberate net fault stops on its own side; it never crosses.
        if ((a.p[0] - 10) * (c.p[0] - 10) >= 0) continue;
        let lo = 0, hi = 1;
        for (let n = 0; n < 50; n++) {
          const mid = (lo + hi) / 2;
          if ((sampleSegment(a, c, mid).x < 10) === (a.p[0] < 10)) lo = mid;
          else hi = mid;
        }
        const z = sampleSegment(a, c, (lo + hi) / 2).z;
        assert(z >= 0.88 + 0.105 + 0.04, `${b.contentKey}/${option.id}: centre ${z.toFixed(3)} m`);
      }
    }
  }
});

test('bonus score is derived from its timeline and disappears with the bonus', () => {
  const timeline = [...choreography, ...tieBreak];
  const last = timeline.length - 1;
  assert.equal(scoreAt(timeline, timeline.length).a, 5);
  assert.equal(scoreAt(timeline, last).a, 4);
  assert.equal(scoreAt(timeline, last + 0.72).a, 5);
  assert.equal(scoreAt(choreography, 16).played, 4);
  assert.deepEqual(scoreAt(timeline, 0), {a: 0, b: 0, played: 0, last: -1});
});

test('the tie-break ends in its own decision, with a winning and a losing finish', () => {
  const finals = tieBreak.filter((beat) => shotDecisions[beat.contentKey]);
  assert.equal(finals.length, 1);
  assert.equal(tieBreak.at(-1), finals[0]);
  assert(tieBreak.slice(0, -1).every((beat) => !beat.win));
  const options = shotDecisions[finals[0].contentKey].options;
  assert(options.some((option) => option.winner === "A") && options.some((option) => option.winner === "B"));
  for (const winner of ["A", "B"]) {
    const timeline = [...choreography, ...structuredClone(tieBreak)];
    timeline.at(-1).winner = winner;
    assert.equal(scoreAt(timeline, timeline.length)[winner === "A" ? "a" : "b"], winner === "A" ? 5 : 1);
  }
});

test('the off-court recovery leaves and re-enters through the fence gap', () => {
  const outside = tieBreak.filter((beat) => beat.at[1] > 10);
  assert.equal(outside.length, 1);
  const gap = ([x]) => x > 5.2 && x < 6.4; // the fence gap nearest the near-side baseline
  for (const beat of tieBreak.filter((beat) => beat.run)) for (const route of Object.values(beat.run)) assert(route.every(gap));
});
