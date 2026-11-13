import type { Stat } from "@/content/projects";

export function Stats({ stats }: { stats: Stat[] }) {
  return (
    <dl className="mt-6 flex flex-wrap gap-2.5">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`flex flex-col-reverse rounded-xl px-3.5 py-2.5 text-sm leading-snug ${
            s.highlight ? "bg-highlight text-[#22252e]" : "bg-soft text-text"
          }`}
        >
          <dt>{s.label}</dt>
          <dd className="font-display text-[1.6rem] font-semibold leading-tight">{s.value}</dd>
        </div>
      ))}
    </dl>
  );
}
