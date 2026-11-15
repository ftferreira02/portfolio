"use client";

import { useEffect, useState } from "react";
import { slug } from "@/lib/slug";

/** "On this page": the sections of a project page, with the one being read marked. */
export function Contents({ sections }: { sections: string[] }) {
  const [current, setCurrent] = useState(slug(sections[0] ?? ""));

  useEffect(() => {
    const headings = sections.map((s) => document.getElementById(slug(s))).filter((h) => h !== null);
    // The section being read is the last heading that has passed the top third of the window.
    const update = () => {
      const line = window.innerHeight / 3;
      const passed = headings.filter((h) => h.getBoundingClientRect().top <= line);
      setCurrent((passed.at(-1) ?? headings[0])?.id ?? "");
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sections]);

  return (
    <nav aria-label="On this page" className="sticky top-24 hidden self-start xl:block">
      <p className="text-[0.85rem] text-muted">On this page</p>
      <ul className="mt-3 border-l border-line text-[0.95rem]">
        {sections.map((s) => {
          const id = slug(s);
          const on = id === current;
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={on ? "location" : undefined}
                className={`-ml-px flex min-h-11 items-center border-l-2 pl-4 ${
                  on ? "border-accent font-medium text-text" : "border-transparent text-muted hover:text-text"
                }`}
              >
                {s}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
