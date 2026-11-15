"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  dayCount,
  filterLabels,
  parse,
  photos,
  script,
  search,
  type FilterKey,
  type Filters,
  type Kind,
} from "@/lib/memoria-demo";

const scenes: Record<Kind, { from: string; to: string; art: React.ReactNode }> = {
  padel: {
    from: "#1849ed",
    to: "#3f6bff",
    art: (
      <>
        <rect x="14" y="20" width="72" height="60" fill="none" stroke="#fff" strokeWidth="3" />
        <line x1="14" y1="50" x2="86" y2="50" stroke="#fff" strokeWidth="3" />
        <line x1="50" y1="30" x2="50" y2="70" stroke="#fff" strokeWidth="2" />
        <circle cx="68" cy="34" r="6" fill="#f9e04b" />
      </>
    ),
  },
  beach: {
    from: "#7cc7f2",
    to: "#f6d58e",
    art: (
      <>
        <rect y="58" width="100" height="42" fill="#f3d08a" />
        <path d="M0 58c12-6 24 6 36 0s24 6 36 0 20 4 28 0v8H0z" fill="#2f8fd6" />
        <circle cx="74" cy="26" r="11" fill="#ffd34d" />
      </>
    ),
  },
  food: {
    from: "#ffb38a",
    to: "#ffd9a8",
    art: (
      <>
        <circle cx="50" cy="54" r="28" fill="#fff" />
        <circle cx="50" cy="54" r="19" fill="#e9573f" />
        <circle cx="44" cy="49" r="4" fill="#ffe08a" />
        <circle cx="56" cy="58" r="4" fill="#7ac36a" />
      </>
    ),
  },
  city: {
    from: "#c9d3ea",
    to: "#eef1f7",
    art: (
      <>
        <rect x="12" y="44" width="18" height="44" fill="#5c6376" />
        <rect x="34" y="28" width="22" height="60" fill="#22252e" />
        <rect x="60" y="50" width="26" height="38" fill="#7d86a0" />
        <rect x="40" y="36" width="4" height="4" fill="#f9c65d" />
        <rect x="47" y="46" width="4" height="4" fill="#f9c65d" />
      </>
    ),
  },
  hike: {
    from: "#a6dcae",
    to: "#e3f3d8",
    art: (
      <>
        <path d="M0 86 34 34l18 26 14-18 34 44z" fill="#3f8a55" />
        <path d="M34 34l8 12h-16z" fill="#fff" />
      </>
    ),
  },
};

function Scene({ kind, id }: { kind: Kind; id: number }) {
  const s = scenes[kind];
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
      <defs>
        <linearGradient id={`demo-g${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={s.from} />
          <stop offset="1" stopColor={s.to} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#demo-g${id})`} />
      {s.art}
    </svg>
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// The first scripted search, already applied: what the page shows before the demo starts, without JavaScript,
// and for people who have asked for reduced motion.
const firstSearch = script[0].text;
const firstFilters = parse(firstSearch);

export function MemoriaDemo() {
  const [text, setText] = useState(firstSearch);
  const [filters, setFilters] = useState<Filters>(firstFilters);
  const [removing, setRemoving] = useState<FilterKey | null>(null);
  const [playing, setPlaying] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const run = useRef(0);
  const visible = useRef(true);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const control = useRef<HTMLButtonElement>(null);
  const focusAfterRemove = useRef<FilterKey | "input" | null>(null);

  const keys = Object.keys(filters) as FilterKey[];
  const hits = keys.length ? search(filters) : photos;
  const hitIds = new Set(hits.map((p) => p.id));
  const order = keys.length ? [...hits, ...photos.filter((p) => !hitIds.has(p.id))] : photos;
  const days = dayCount(hits);

  /* ---- Rearranging tiles: compare layout positions before and after each change (FLIP) ---- */
  const tiles = useRef(new Map<number, HTMLDivElement>());
  const last = useRef(new Map<number, { x: number; y: number }>());
  const orderKey = order.map((p) => p.id).join(",");
  useLayoutEffect(() => {
    const animate = !prefersReducedMotion();
    tiles.current.forEach((el, id) => {
      // offsetLeft/Top are layout positions: scrolling and in-flight slides don't affect them.
      const now = { x: el.offsetLeft, y: el.offsetTop };
      const before = last.current.get(id);
      if (before && animate && (before.x !== now.x || before.y !== now.y)) {
        el.animate([{ translate: `${before.x - now.x}px ${before.y - now.y}px` }, { translate: "0 0" }], {
          duration: 550,
          easing: "cubic-bezier(.2,.7,.2,1)",
        });
      }
      last.current.set(id, now);
    });
  }, [orderKey]);
  useEffect(() => {
    const remeasure = () => tiles.current.forEach((el, id) => last.current.set(id, { x: el.offsetLeft, y: el.offsetTop }));
    window.addEventListener("resize", remeasure);
    return () => window.removeEventListener("resize", remeasure);
  }, []);

  /* ---- Pause while off screen or in a background tab ---- */
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let onScreen = true;
    const update = () => (visible.current = onScreen && document.visibilityState === "visible");
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      update();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  /* ---- The demo: type a search, then take the filters off one at a time ---- */
  const play = useCallback(async () => {
    const id = ++run.current;
    const wait = async (ms: number) => {
      await sleep(ms);
      while (run.current === id && !visible.current) await sleep(250);
      if (run.current !== id) throw new Error("stopped");
    };
    setPlaying(true);
    setAnnouncement("");
    try {
      for (let round = 0; ; round = (round + 1) % script.length) {
        const { text: target, peel } = script[round];
        setFilters({});
        setRemoving(null);
        setText("");
        await wait(700);
        for (let i = 1; i <= target.length; i++) {
          setText(target.slice(0, i));
          await wait(45);
        }
        await wait(350);
        let current = parse(target);
        setFilters(current);
        await wait(2200);
        for (const key of peel) {
          setRemoving(key);
          await wait(900);
          current = { ...current };
          delete current[key];
          setRemoving(null);
          setFilters(current);
          await wait(1900);
        }
        await wait(1200);
      }
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
    setRemoving(null);
  }, []);

  // Start the first time the demo comes into view, so visitors see it from the beginning.
  useEffect(() => {
    const el = box.current;
    if (!el || prefersReducedMotion()) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        play();
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancel();
    };
  }, [play, cancel]);

  // Keep the end of a typed query in view on narrow screens.
  useEffect(() => {
    const el = input.current;
    if (el && playing) el.scrollLeft = el.scrollWidth;
  }, [text, playing]);

  // After a filter is removed, move focus to a neighbouring filter (or the search box) instead of losing it.
  useEffect(() => {
    const target = focusAfterRemove.current;
    if (!target) return;
    focusAfterRemove.current = null;
    const next = target === "input" ? input.current : box.current?.querySelector<HTMLElement>(`[data-remove="${target}"]`);
    next?.focus();
  }, [filters]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    stop();
    const next = parse(text);
    setFilters(next);
    const n = Object.keys(next).length ? search(next).length : photos.length;
    setAnnouncement(`${n} ${n === 1 ? "photo" : "photos"} found.`);
  }

  function remove(key: FilterKey) {
    stop();
    const i = keys.indexOf(key);
    const rest = keys.filter((k) => k !== key);
    focusAfterRemove.current = rest[i] ?? rest[i - 1] ?? "input";
    const next = { ...filters };
    delete next[key];
    setFilters(next);
    const n = rest.length ? search(next).length : photos.length;
    setAnnouncement(`${filterLabels[key]} filter removed. ${n} ${n === 1 ? "photo" : "photos"}.`);
  }

  // Any focus inside the demo hands control to the visitor, except on the play/pause button itself.
  function onFocusCapture(e: React.FocusEvent) {
    if (playing && e.target !== control.current) stop();
  }

  return (
    <div ref={box} onFocusCapture={onFocusCapture} className="w-full rounded-[22px] border border-line bg-card p-3.5">
      <form
        role="search"
        aria-label="MEMORIA demo"
        onSubmit={submit}
        className="flex items-center gap-2.5 rounded-lg border-[1.5px] border-line bg-bg py-1 pr-1 pl-3 focus-within:border-accent"
      >
        <label htmlFor="demo-q" className="sr-only">
          Describe a moment
        </label>
        <input
          ref={input}
          id="demo-q"
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoComplete="off"
          placeholder="Describe a moment…"
          className="min-w-0 flex-1 bg-transparent py-2 font-display text-lg outline-none placeholder:text-muted"
        />
        <button type="submit" className="rounded bg-soft px-3.5 py-2 font-medium hover:bg-line">
          Find
        </button>
      </form>

      {/* Two rows reserved (three on phones) so the grid below doesn't jump as filters come and go. */}
      <div className="mt-3.5 mb-2.5 flex min-h-[100px] flex-wrap content-start items-center gap-1.5 text-sm text-muted sm:min-h-[66px]">
        {keys.length ? (
          <>
            <span>I understood:</span>
            {keys.map((k) => (
              <span key={k} className={`demo-chip ${removing === k ? "is-removing" : ""}`}>
                {filterLabels[k]} <b>{String(filters[k])}</b>
                <button type="button" data-remove={k} onClick={() => remove(k)} aria-label={`Remove ${filterLabels[k]} filter`}>
                  ×
                </button>
              </span>
            ))}
          </>
        ) : (
          <span>Describe a moment and I&apos;ll show you what I understood.</span>
        )}
      </div>

      <div className="relative grid grid-cols-6 gap-[5px] sm:grid-cols-8" aria-hidden="true">
        {order.map((p) => (
          <div
            key={p.id}
            ref={(el) => {
              if (el) tiles.current.set(p.id, el);
              else tiles.current.delete(p.id);
            }}
            className={`demo-tile ${keys.length ? (hitIds.has(p.id) ? "is-hit" : "is-out") : ""}`}
          >
            <Scene kind={p.kind} id={p.id} />
          </div>
        ))}
      </div>

      <p className="mt-3 min-h-[3em] text-[0.92rem] text-muted tabular-nums">
        {keys.length === 0 ? (
          <>
            <strong className="font-semibold text-text">All {photos.length} photos</strong>, no filters.
          </>
        ) : hits.length ? (
          <>
            <strong className="font-semibold text-text">
              {hits.length} {hits.length === 1 ? "photo" : "photos"}
            </strong>{" "}
            across {days} {days === 1 ? "day" : "days"}. Remove a filter if I got something wrong.
          </>
        ) : (
          "Nothing matches all of that. Try removing a filter: that's exactly why they're editable."
        )}
      </p>
      {/* Announced only after the visitor does something, never during the automatic demo. */}
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>

      <div className="mt-2.5 flex items-baseline justify-between gap-3 text-[0.85rem] text-muted">
        <span>A toy version of MEMORIA, the photo search from my master&apos;s thesis.</span>
        <button
          ref={control}
          type="button"
          onClick={() => (playing ? stop() : play())}
          className="shrink-0 rounded-full border border-line px-3 py-0.5 hover:text-text"
        >
          {playing ? "Pause" : "Play demo"}
        </button>
      </div>
    </div>
  );
}
