"use client";

import Link from "next/link";
import { useEffect, useRef, useState, ViewTransition } from "react";
import { matchStory, crowdSigns } from "@/content/padel";
import { site } from "@/content/site";
import { NavDisclosure } from "@/components/nav-disclosure";

export function PadelMatch() {
  const root = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    let dispose: (() => void) | undefined;
    const element = root.current;
    async function start() {
      try {
        const { mountMatch } = await import("@/lib/padel/engine");
        await document.fonts.ready;
        if (cancelled || !element) return;
        dispose = mountMatch(element, matchStory, {
          email: site.email,
          cv: site.cv,
          projectNames: crowdSigns,
          // Arriving from the Serve button on the home page plays the first serve.
          autoServe: new URLSearchParams(window.location.search).has("serve"),
          onError: () => { if (!cancelled) setStatus("error"); },
        });
        setStatus("ready");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }
    void start();
    return () => { cancelled = true; dispose?.(); };
  }, []);

  return (
    <div ref={root} className="padel-match" tabIndex={0} role="region" aria-label="Padel match portfolio" aria-busy={status === "loading"}>
      {/* The same frame as the still on the home page, so the court grows out of it. */}
      <ViewTransition name="padel-court">
      <div className="view" data-match="view">
        <canvas data-match="gl" aria-label="Animated padel match. Portfolio captions and playback controls follow." role="img" />
        <div className="match-loading" role="status" hidden={status === "ready"}>
          <p>{status === "error" ? "The 3D court isn't available on this device." : "Getting the court ready…"}</p>
          <Link href="/">Visit the full portfolio</Link>
        </div>
        <div className="commentary" data-match="commentary" aria-hidden="true" />
        <div className="punch" data-match="punch" aria-hidden="true" />
        <div className="bug" aria-label="Match score">
          <div className="bug-h"><span>The Portfolio Open</span><span data-match="chName">Hello</span></div>
          <div className="row"><i className="on" /><b>Ferreira / You</b><span className="pt" data-match="ptsA">0</span></div>
          <div className="row"><i /><b>Opponents</b><span className="pt" data-match="ptsB">0</span></div>
        </div>
        <div className="live" aria-hidden="true"><span>On court</span><b>FF Sports</b></div>
        <div className="wipe" data-match="callout" aria-hidden="true" />
        <div className="speed" data-match="speed" aria-hidden="true"><span data-match="speedL">Smash</span><b data-match="speedV">0</b></div>
        <div className="l3" data-match="card" aria-live="polite" aria-atomic="true" />
      </div>
      </ViewTransition>
      <dialog className="shot-choice" data-match="choice" hidden aria-labelledby="padel-choice-title" aria-describedby="padel-choice-situation">
        <button type="button" className="choice-close" data-match="choice-close">Back to match</button>
        <h2 id="padel-choice-title" data-match="choice-title" aria-live="polite" />
        <p id="padel-choice-situation" data-match="choice-situation" />
        <div className="choice-options" data-match="choice-options" />
        <p className="choice-note">You’re Francisco’s partner in yellow. Pick your shot. The portfolio continues, win or lose.</p>
      </dialog>
      <NavDisclosure className="result-details" summaryClassName="result-summary" summary={<span data-match="result-summary" role="status">Last point · Why?</span>}>
        <p className="choice-feedback" data-match="choice-feedback" hidden />
      </NavDisclosure>
      <fieldset className="bottom" disabled={status !== "ready"} aria-label="Match playback">
        <button className="back" data-match="back" type="button">Back</button>
        <button className="next" data-match="next" type="button">Serve</button>
        <div className="progress" data-match="progress" aria-hidden="true">{[0, 1, 2, 3].map((i) => <i key={i}><b /></i>)}</div>
        <div className="modes" role="group" aria-label="How the match advances">
          <button type="button" data-mode="click" aria-pressed="true">Click</button>
          <button type="button" data-mode="auto" aria-pressed="false">Auto</button>
        </div>
        <button className="back" data-match="sound" type="button" aria-pressed="false">Sound off</button>
        <NavDisclosure className="match-settings" summaryClassName="settings-summary" summary={<span data-match="motion-summary">Animation</span>}>
          <div className="motion-setting">
            <p data-match="motion-note" aria-live="polite">Match animation follows your system preference.</p>
            <button className="back" data-match="motion" type="button" disabled={status !== "ready"} aria-pressed="false">Enable match animation</button>
          </div>
        </NavDisclosure>
      </fieldset>
      <p className="hint"><span data-match="hint">Next, Space or → plays the next shot.</span></p>
    </div>
  );
}
