"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Region } from "@/content/experience";

export type Stop = {
  when: string;
  title: string;
  note?: string;
  place: Region;
  logo: string;
  org: string;
};

/** Experience and education next to a small, not-to-scale map; hovering an entry lights up where it happened. */
export function Route({ stops }: { stops: Stop[] }) {
  const [lit, setLit] = useState<Stop["place"] | null>(null);
  const [drawn, setDrawn] = useState(false);
  const map = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = map.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="grid items-start gap-5 md:grid-cols-[360px_1fr] md:gap-12">
      <figure
        ref={map}
        aria-hidden="true"
        className={`route-map m-0 max-w-[340px] md:sticky md:top-24 md:max-w-none ${drawn ? "is-drawn" : ""}`}
      >
        <svg viewBox="0 0 300 250" width="100%">
          <path
            className="land"
            d="M226 0L222 38L217 68L212 104L204 146L199 162L208 170L201 188L206 214L234 211L270 216L300 214V0Z"
          />
          <path
            className="land"
            d="M28 222c6-6 22-8 34-5 4 2 2 6-4 7-10 2-24 3-30-2z"
          />
          <path className="route" d="M48 219C80 150 150 80 214 70" />
          <circle
            className={`place ${lit === "madeira" ? "is-lit" : ""}`}
            cx="48"
            cy="219"
            r="5"
          />
          <circle
            className={`place ${lit === "aveiro" ? "is-lit" : ""}`}
            cx="214"
            cy="70"
            r="5"
          />
          <text className="m-label" x="44" y="242">
            Funchal, Madeira
          </text>
          <text className="m-label" x="204" y="60" textAnchor="end">
            Aveiro
          </text>
          <text className="m-sea" x="118" y="205">
            Atlantic
          </text>
          <text className="m-note" x="300" y="248" textAnchor="end">
            not to scale
          </text>
        </svg>
      </figure>
      <ul>
        {stops.map((s) => (
          <li
            key={s.title}
            onMouseEnter={() => setLit(s.place)}
            onMouseLeave={() => setLit(null)}
            className="grid gap-x-7 gap-y-1 py-3 sm:grid-cols-[170px_1fr]"
          >
            <span
              className={`text-meta tabular-nums ${lit === s.place ? "text-accent" : "text-muted"}`}
            >
              {s.when}
            </span>
            <span className="flex items-start gap-3">
              <Image
                src={s.logo}
                alt={`${s.org} logo`}
                width={36}
                height={36}
                className="size-9 shrink-0 rounded-lg border border-line bg-white object-contain"
              />
              <span>
                <b className="font-medium">{s.title}</b>
                {s.note ? (
                  <>
                    <br />
                    <span className="text-muted">{s.note}</span>
                  </>
                ) : null}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
