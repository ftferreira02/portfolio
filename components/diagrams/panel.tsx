type PanelProps = {
  caption?: string;
  children: React.ReactNode;
  className?: string;
};

/** Dark rounded panel that every diagram sits on, in both themes. */
export function DiagramPanel({ caption, children, className = "" }: PanelProps) {
  return (
    <figure className={`on-dark rounded-3xl bg-surface p-5 text-on-surface sm:p-6 ${className}`}>
      <div className="diagram">{children}</div>
      {caption ? <figcaption className="mt-3 text-sm text-on-surface-muted">{caption}</figcaption> : null}
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
