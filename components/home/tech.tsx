"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

/**
 * Tech names work like the demo's filters: click one and everything on the page that didn't use it fades.
 * Each <TechScope> declares the technologies it covers; <TechList> renders clickable names.
 */

type TechState = {
  active: string | null;
  choose: (t: string, from: HTMLButtonElement, revealId?: string) => void;
  clear: () => void;
};
const TechContext = createContext<TechState | null>(null);

function useTech() {
  const ctx = useContext(TechContext);
  if (!ctx) throw new Error("Tech components must be inside <TechProvider>");
  return ctx;
}

export function TechProvider({ scopes, children }: { scopes: string[][]; children: React.ReactNode }) {
  const [active, setActive] = useState<string | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const count = (t: string) => scopes.filter((s) => s.includes(t)).length;

  function choose(t: string, from: HTMLButtonElement, revealId?: string) {
    if (active === t) return clear();
    opener.current = from;
    setActive(t);
    if (revealId) {
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      document.getElementById(revealId)?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    }
  }

  // Clearing returns focus to the name that started it, so keyboard users don't land on a hidden button.
  function clear() {
    setActive(null);
    opener.current?.focus({ preventScroll: true });
  }

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setActive(null);
      opener.current?.focus({ preventScroll: true });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  const n = active ? count(active) : 0;
  const message = active
    ? `${active}: ${n ? `used in ${n} ${n === 1 ? "project" : "projects"}` : "not in these projects"}${active === "Python" ? ", via Django" : ""}`
    : "";

  return (
    <TechContext.Provider value={{ active, choose, clear }}>
      {children}
      <span id="tech-hint" className="sr-only">
        Fades the projects that don&apos;t use it.
      </span>
      {/* Always mounted, so screen readers hear the first change too. */}
      <span className="sr-only" aria-live="polite">
        {message}
      </span>
      {/* Room at the bottom of the page so the bar never covers the last links. */}
      {active ? <div aria-hidden="true" className="h-20" /> : null}
      <div
        className="tech-bar fixed bottom-5 left-1/2 z-50 flex max-w-[calc(100vw-32px)] -translate-x-1/2 items-center gap-3.5 rounded-full bg-text py-2.5 pr-3 pl-[18px] text-[0.92rem] text-bg shadow-[0_8px_30px_rgba(0,0,0,0.18)] tabular-nums"
        hidden={!active}
      >
        <span aria-hidden="true" className="truncate">
          {message}
        </span>
        <button type="button" onClick={clear} className="rounded-full bg-bg px-3 py-1 font-medium text-text">
          Clear
        </button>
      </div>
    </TechContext.Provider>
  );
}

export function TechScope({ uses, className = "", children }: { uses: string[]; className?: string; children: React.ReactNode }) {
  const { active } = useTech();
  const dim = active !== null && !uses.includes(active);
  return <div className={`tech-scope ${dim ? "is-dim" : ""} ${className}`}>{children}</div>;
}

/** `revealId`: scroll to this section when a name is chosen here (for lists that sit above the projects). */
export function TechList({ items, className = "", revealId }: { items: readonly string[]; className?: string; revealId?: string }) {
  const { active, choose } = useTech();
  return (
    <span className={className}>
      {items.map((t, i) => (
        <span key={t}>
          {i > 0 ? ", " : null}
          <button
            type="button"
            aria-pressed={active === t}
            aria-describedby="tech-hint"
            onClick={(e) => choose(t, e.currentTarget, revealId)}
            className={`tech ${active === t ? "is-on" : ""}`}
          >
            {t}
          </button>
        </span>
      ))}
    </span>
  );
}
