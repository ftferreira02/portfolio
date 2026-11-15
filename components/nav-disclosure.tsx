"use client";

import { useEffect, useRef } from "react";

/** Navigation that dismisses after a selection, Escape, or a click outside. */
export function NavDisclosure({ children, summary, className, summaryClassName }: {
  children: React.ReactNode;
  summary: React.ReactNode;
  className?: string;
  summaryClassName?: string;
}) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      const el = ref.current;
      if (el?.open && event.target instanceof Node && !el.contains(event.target)) el.open = false;
    };
    const escape = (event: KeyboardEvent) => {
      const el = ref.current;
      if (event.key === "Escape" && el?.open) {
        el.open = false;
        el.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, []);

  return (
    <details ref={ref} className={className} onClick={(event) => {
      if (event.target instanceof Element && event.target.closest("a[href]") && ref.current) {
        ref.current.open = false;
        // Keep keyboard focus on a visible control after the destination is selected.
        ref.current.querySelector("summary")?.focus({ preventScroll: true });
      }
    }}>
      <summary className={summaryClassName}>{summary}</summary>
      {children}
    </details>
  );
}
