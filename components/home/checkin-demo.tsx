"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Quests@NEI's check-in at the door, played once when it scrolls into view: an organiser scans one student's QR code
 * after another, each scan logs the attendance and awards the points, and the leaderboard reorders. It starts on the
 * finished result, so it's never an empty board (before it plays, without JavaScript, or with reduced motion).
 * Example people and points; the flow is the real one.
 */

type Person = { id: string; name: string; points: number };
type Phase = { kind: "ready" } | { kind: "scan"; person: Person } | { kind: "ok"; person: Person };

const REWARD = 40;
const people: Person[] = [
  { id: "ana", name: "Ana M.", points: 140 },
  { id: "rui", name: "Rui S.", points: 120 },
  { id: "ines", name: "Inês C.", points: 110 },
  { id: "tiago", name: "Tiago F.", points: 90 },
];
/** The order they arrive at the door. Ana doesn't come, so she is overtaken. */
const queue = ["tiago", "ines", "rui"].map((id) => people.find((p) => p.id === id)!);

type Points = Record<string, number>;
const startPoints: Points = Object.fromEntries(people.map((p) => [p.id, p.points]));
const endPoints: Points = { ...startPoints, ...Object.fromEntries(queue.map((p) => [p.id, p.points + REWARD])) };

/** Highest first; equal points keep the starting order. */
const ranked = (points: Points) => [...people].sort((a, b) => points[b.id] - points[a.id]);
const ordinal = ["1st", "2nd", "3rd", "4th"];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const doneMessage = `Three scans, three attendances logged. ${ranked(endPoints)[0].name.split(" ")[0]} is the new first place.`;
const ROW = 40;

function hash(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

/** A drawing of a QR code, different for each person. Not a real code. */
function Code({ seed }: { seed: number }) {
  const N = 13;
  const inFinder = (x: number, y: number) => (x < 6 && y < 6) || (x > N - 7 && y < 6) || (x < 6 && y > N - 7);
  const cells = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!inFinder(x, y) && hash(seed * 53 + y * N + x) > 0.52) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" />);
  const finder = (x: number, y: number) => (
    <g key={`f-${x}-${y}`}>
      <rect x={x} y={y} width="5" height="5" />
      <rect x={x + 1} y={y + 1} width="3" height="3" className="fill-card" />
      <rect x={x + 2} y={y + 2} width="1" height="1" />
    </g>
  );
  return (
    <svg viewBox={`-1 -1 ${N + 2} ${N + 2}`} className="size-full fill-text" shapeRendering="crispEdges" aria-hidden="true">
      <rect x="-1" y="-1" width={N + 2} height={N + 2} className="fill-card" />
      {finder(0, 0)}
      {finder(N - 5, 0)}
      {finder(0, N - 5)}
      {cells}
    </svg>
  );
}

export function CheckinDemo() {
  const [points, setPoints] = useState<Points>(endPoints);
  const [phase, setPhase] = useState<Phase>({ kind: "ok", person: queue[queue.length - 1] });
  const [checked, setChecked] = useState(queue.length);
  const [message, setMessage] = useState(doneMessage);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(true);
  const [announcement, setAnnouncement] = useState("");
  const run = useRef(0);
  const box = useRef<HTMLDivElement>(null);

  const play = useCallback(async (byVisitor: boolean) => {
    const id = ++run.current;
    const wait = async (ms: number) => {
      await sleep(ms);
      if (run.current !== id) throw new Error("stopped");
    };

    setPlaying(true);
    setStarted(true);
    setFinished(false);
    setAnnouncement("");
    try {
      let now = startPoints;
      setPoints(now);
      setChecked(0);
      setPhase({ kind: "ready" });
      setMessage("The organiser opens the scanner on the activity page and picks the mode once.");
      await wait(1900);
      for (const [i, person] of queue.entries()) {
        const first = person.name.split(" ")[0];
        setPhase({ kind: "scan", person });
        setMessage(`${first} shows the QR code from their profile.`);
        await wait(1300);
        const before = ranked(now).indexOf(person);
        now = { ...now, [person.id]: now[person.id] + REWARD };
        const after = ranked(now).indexOf(person);
        setPoints(now);
        setChecked(i + 1);
        setPhase({ kind: "ok", person });
        setMessage(`Attendance logged, +${REWARD} points. ${first} goes from ${ordinal[before]} to ${ordinal[after]}.`);
        await wait(2100);
        if (i < queue.length - 1) {
          setPhase({ kind: "ready" });
          await wait(450);
        }
      }
      setMessage(doneMessage);
      setFinished(true);
      setPlaying(false);
      // Narrate only a run the visitor asked for, never the automatic one.
      if (byVisitor) setAnnouncement(`Check-in demo finished. ${doneMessage}`);
    } catch {
      /* paused */
    }
  }, []);

  // Invalidates the running sequence; its next wait() throws and it stops.
  const cancel = useCallback(() => {
    run.current++;
  }, []);

  const stop = useCallback(() => {
    run.current++;
    setPlaying(false);
  }, []);

  // Plays once, when it first comes into view.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) play(false);
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancel();
    };
  }, [play, cancel]);

  const order = ranked(points);
  const justScanned = phase.kind === "ok" ? phase.person.id : null;

  return (
    <div ref={box} className="min-w-0 rounded-[20px] border border-line bg-card p-3 tabular-nums">
      <div className="mb-3 flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium">Git workshop, at the door</span>
        <span className="text-muted">
          {checked} of {queue.length} checked in
        </span>
      </div>

      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-start gap-3 sm:gap-4">
        {/* The scanner */}
        <div className="scanner relative aspect-square overflow-hidden rounded-xl bg-soft">
          {phase.kind === "scan" ? (
            <>
              <div className="scan-code absolute inset-[16%] overflow-hidden rounded-md">
                <Code seed={people.indexOf(phase.person) + 1} />
              </div>
              <span className="scan-line" />
            </>
          ) : null}
          {phase.kind === "ok" ? (
            <div className="scan-ok absolute inset-0 flex flex-col items-center justify-center gap-0.5 p-2 text-center">
              <svg viewBox="0 0 24 24" className="mb-1 size-8 rounded-full bg-accent p-1.5 text-on-accent" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
              <span className="text-sm font-medium">{phase.person.name}</span>
              <span className="text-sm text-accent">+{REWARD} points</span>
            </div>
          ) : null}
          {phase.kind === "ready" ? <span className="absolute inset-0 flex items-center justify-center p-2 text-center text-sm text-muted">Ready to scan</span> : null}
          {/* Viewfinder corners */}
          {phase.kind !== "ok"
            ? ["top-2 left-2 border-t-2 border-l-2", "top-2 right-2 border-t-2 border-r-2", "bottom-2 left-2 border-b-2 border-l-2", "right-2 bottom-2 border-r-2 border-b-2"].map((c) => (
                <span key={c} className={`absolute size-4 rounded-[3px] border-muted ${c}`} />
              ))
            : null}
        </div>

        {/* The leaderboard: rows move to their new place when the points change. */}
        <div>
          <div className="relative" style={{ height: people.length * ROW }} aria-hidden="true">
            {people.map((p) => {
              const rank = order.indexOf(p);
              return (
                <div
                  key={p.id}
                  className={`board-row absolute inset-x-0 top-0 flex items-center gap-2 rounded-lg px-2 text-sm ${justScanned === p.id ? "bg-chip" : ""}`}
                  style={{ height: ROW - 4, transform: `translateY(${rank * ROW}px)`, zIndex: justScanned === p.id ? 1 : 0 }}
                >
                  <span className="w-4 shrink-0 text-muted">{rank + 1}</span>
                  <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
                  <span className={justScanned === p.id ? "font-medium text-accent" : "text-muted"}>{points[p.id]}</span>
                </div>
              );
            })}
          </div>
          <ol className="sr-only" aria-label="Leaderboard">
            {order.map((p) => (
              <li key={p.id}>
                {p.name}, {points[p.id]} points
              </li>
            ))}
          </ol>
        </div>
      </div>

      <p className="mt-3 min-h-[4.5em] text-meta sm:min-h-[3em]">{message}</p>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      <div className="mt-3 flex items-baseline justify-between gap-3 text-sm text-muted">
        <span>Example people and points, real flow: pick the mode once, then scan one student after another.</span>
        <button
          type="button"
          onClick={() => (playing ? stop() : play(true))}
          className="shrink-0 rounded-[10px] border border-line px-3 py-1 transition-colors hover:text-text"
        >
          {playing ? "Pause scanning" : finished ? (started ? "Scan again" : "Scan") : "Restart scanning"}
        </button>
      </div>
    </div>
  );
}
