import type { ReactNode } from "react";

/*
 * The phone versions of the diagrams: the same nodes as the SVG, as real text stacked top to bottom.
 * Steps that happen one after another are joined by an arrow; steps that happen side by side sit in a row.
 */

export function PhoneStack({ children }: { children: ReactNode }) {
  return <ol role="list" className="list-none text-sm leading-relaxed">{children}</ol>;
}

export function PhoneStep({ children, first = false }: { children: ReactNode; first?: boolean }) {
  return (
    <li>
      {first ? null : (
        <div aria-hidden="true" className="py-1 text-center text-muted">
          ↓
        </div>
      )}
      {children}
    </li>
  );
}

export function PhoneBox({
  title,
  lines = [],
  accent = false,
  children,
}: {
  title: string;
  lines?: readonly string[];
  accent?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className={`h-full rounded-lg border px-3 py-2.5 ${accent ? "border-accent bg-chip" : "border-line bg-bg"}`}>
      <p className="font-medium text-text">{title}</p>
      {lines.map((line) => (
        <p key={line} className="text-[13px] text-muted">
          {line}
        </p>
      ))}
      {children}
    </div>
  );
}

/** Nodes that run in parallel, side by side. An item can span the row with `className="col-span-2"`. */
export function PhoneBranches({ children }: { children: ReactNode }) {
  return <ul role="list" className="grid list-none grid-cols-2 gap-2">{children}</ul>;
}
