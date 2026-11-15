"use client";

import { useEffect, useRef, useState } from "react";

export function CopyEmail({ email }: { email: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(email);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    timer.current = setTimeout(() => setStatus("idle"), 2400);
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        aria-label="Copy email address"
        className="rounded-full border border-line px-3.5 py-1.5 text-sm font-medium hover:bg-soft"
      >
        {status === "copied" ? "Copied" : "Copy"}
      </button>
      <span aria-live="polite" className={status === "failed" ? "text-sm text-muted" : "sr-only"}>
        {status === "copied" ? "Email address copied." : status === "failed" ? "Couldn't copy. Select the address instead." : ""}
      </span>
    </>
  );
}
