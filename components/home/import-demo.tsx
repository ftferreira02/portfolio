"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Edufiable's academic-record import, played once when it scrolls into view: a file with an in-file duplicate is
 * blocked at review, the corrected file goes through. It starts on the finished result, so it's never an empty
 * table (before it plays, without JavaScript, or with reduced motion). Example data; the rules are the real ones.
 */

type Check = "wait" | "valid" | "update" | "error" | "created" | "updated";
type Row = { tax: string; diploma: string; date: string; check: Check };

const fileA: Omit<Row, "check">[] = [
  { tax: "···104", diploma: "MSc Informatics", date: "2026-07-20" },
  { tax: "···381", diploma: "BSc Informatics", date: "2025-07-18" },
  { tax: "···552", diploma: "MSc Software Eng.", date: "2026-07-20" },
  { tax: "···381", diploma: "BSc Informatics", date: "2025-07-18" },
  { tax: "···927", diploma: "MSc Data Science", date: "2026-07-22" },
];
const reviewA: Check[] = ["valid", "valid", "update", "error", "valid"];
const fileB = fileA.filter((_, i) => i !== 3);
const reviewB: Check[] = ["valid", "valid", "update", "valid"];

const badges: Record<Check, [string, string]> = {
  wait: ["text-muted", "…"],
  valid: ["badge-valid", "valid"],
  update: ["badge-update", "will update"],
  error: ["badge-error", "duplicate in file"],
  created: ["badge-done", "created"],
  updated: ["badge-done", "updated"],
};

const steps = ["Upload", "Review", "Import"];
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const doneMessage = "Batch completed: 3 created, 1 updated. Existing records were updated, not duplicated.";
const doneRows: Row[] = fileB.map((r, i) => ({ ...r, check: reviewB[i] === "update" ? "updated" : "created" }));
/** The table always has room for the longest file, so the page below doesn't move while rows come and go. */
const maxRows = fileA.length;

export function ImportDemo() {
  const [file, setFile] = useState("records-fixed.csv");
  const [rows, setRows] = useState<Row[]>(doneRows);
  const [step, setStep] = useState(3);
  const [message, setMessage] = useState(doneMessage);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const run = useRef(0);
  const box = useRef<HTMLDivElement>(null);

  const play = useCallback(async (byVisitor: boolean) => {
    const id = ++run.current;
    const wait = async (ms: number) => {
      await sleep(ms);
      if (run.current !== id) throw new Error("stopped");
    };
    const setCheck = (i: number, check: Check) =>
      setRows((r) => r.map((row, j) => (j === i ? { ...row, check } : row)));

    async function upload(name: string, data: Omit<Row, "check">[]) {
      setFile(name);
      setRows([]);
      setMessage("");
      setStep(0);
      await wait(500);
      for (const row of data) {
        setRows((r) => [...r, { ...row, check: "wait" }]);
        await wait(260);
      }
    }
    async function review(checks: Check[]) {
      setStep(1);
      await wait(600);
      for (let i = 0; i < checks.length; i++) {
        setCheck(i, checks[i]);
        await wait(420);
      }
    }

    setPlaying(true);
    setStarted(true);
    setAnnouncement("");
    try {
      await upload("records.csv", fileA);
      await review(reviewA);
      setMessage("Row 4 repeats row 2, so the import is blocked and nothing is written.");
      await wait(3200);
      setMessage("The admin fixes the file and tries again…");
      await wait(1600);
      await upload("records-fixed.csv", fileB);
      await review(reviewB);
      setStep(2);
      await wait(700);
      for (let i = 0; i < reviewB.length; i++) {
        setCheck(i, reviewB[i] === "update" ? "updated" : "created");
        await wait(300);
      }
      setStep(3);
      setMessage(doneMessage);
      setPlaying(false);
      // Narrate only a run the visitor asked for, never the automatic one.
      if (byVisitor) setAnnouncement(`Import demo finished. ${doneMessage}`);
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

  const finished = step === 3;

  return (
    <div ref={box} className="min-w-0 rounded-[20px] border border-line bg-card p-3 tabular-nums">
      <ol className="mb-3 flex gap-1.5 text-sm" aria-label="Import steps">
        {steps.map((s, i) => (
          <li
            key={s}
            className={`flex-1 rounded-lg px-1 py-1.5 text-center transition-colors ${
              i < step ? "bg-chip text-text" : i === step ? "bg-text text-bg" : "bg-soft text-muted"
            }`}
          >
            {i + 1}. {s}
          </li>
        ))}
      </ol>
      <div className="mb-1.5 flex justify-between text-sm text-muted">
        <span className="font-medium text-text">{file}</span>
        <span>{rows.length ? `${rows.length} rows` : ""}</span>
      </div>
      <table className="w-full table-fixed border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left text-muted">
            <th scope="col" className="w-[26%] px-1.5 py-1 font-medium sm:w-[22%]">Tax no.</th>
            <th scope="col" className="px-1.5 py-1 font-medium">Diploma</th>
            <th scope="col" className="hidden w-[22%] px-1.5 py-1 font-medium sm:table-cell">Date</th>
            <th scope="col" className="w-[32%] px-1.5 py-1 font-medium sm:w-[26%]">Check</th>
          </tr>
        </thead>
        <tbody>
          {[...rows, ...Array.from({ length: maxRows - rows.length }, () => null)].map((row, i) =>
            row === null ? (
              // Same cells as a real row (date hidden on phones), so the columns don't shift.
              <tr key={`empty-${i}`} aria-hidden="true">
                <td className="px-1.5 py-1.5" />
                <td className="px-1.5 py-1.5" />
                <td className="hidden px-1.5 py-1.5 sm:table-cell" />
                <td className="px-1.5 py-1.5">
                  <span className="badge invisible">·</span>
                </td>
              </tr>
            ) : (
            <tr key={`${file}-${i}`} className={`import-row ${row.check === "error" ? "is-dup" : ""}`}>
              <td className="truncate px-1.5 py-1.5">{row.tax}</td>
              <td className="truncate px-1.5 py-1.5">{row.diploma}</td>
              <td className="hidden truncate px-1.5 py-1.5 sm:table-cell">{row.date}</td>
              <td className="px-1.5 py-1.5">
                <span className={`badge ${badges[row.check][0]}`}>{badges[row.check][1]}</span>
              </td>
            </tr>
            ),
          )}
        </tbody>
      </table>
      <p className="mt-3 min-h-[4.5em] text-meta sm:min-h-[3em]">{message}</p>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      <div className="mt-3 flex items-baseline justify-between gap-3 text-sm text-muted">
        <span>Example data, real rules: duplicates in a file block the import; existing records are updated.</span>
        <button
          type="button"
          onClick={() => (playing ? stop() : play(true))}
          className="shrink-0 rounded-[10px] border border-line px-3 py-1 transition-colors hover:text-text"
        >
          {playing ? "Pause" : finished ? (started ? "Play again" : "Play") : "Restart"}
        </button>
      </div>
    </div>
  );
}
