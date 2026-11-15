type PanelProps = {
  caption?: string;
  children: React.ReactNode;
  className?: string;
};

/** The card every diagram sits on. */
export function DiagramPanel({ caption, children, className = "" }: PanelProps) {
  return (
    <figure className={`rounded-2xl border border-line bg-card p-4 sm:p-6 ${className}`}>
      <div className="diagram">{children}</div>
      {caption ? <figcaption className="mt-3 text-[0.92rem] text-muted">{caption}</figcaption> : null}
    </figure>
  );
}

export function Arrowhead({ id }: { id: string }) {
  return (
    <defs>
      <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0L10 5L0 10z" className="d-arrow" />
      </marker>
    </defs>
  );
}
