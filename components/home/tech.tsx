/** Plain technology labels keep project details readable and easy to scan. */
export function TechList({ items, className = "" }: { items: readonly string[]; className?: string }) {
  return <span className={className}>{items.join(", ")}</span>;
}
