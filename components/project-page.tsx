import Link from "next/link";
import type { Project } from "@/content/projects";
import { projects } from "@/content/projects";
import { Contents } from "./contents";

const link = "underline underline-offset-4 hover:text-accent";

/** Shared frame for a long-form project page: header, MDX body, next project. */
export function ProjectPage({ project, children }: { project: Project; children: React.ReactNode }) {
  const other = projects.find((p) => p.slug !== project.slug);
  return (
    <article className="mx-auto max-w-6xl px-4 sm:px-6">
      <header className="pt-5 md:pt-11">
        <Link href="/#work" className="inline-flex min-h-11 items-center text-[0.95rem] text-muted underline-offset-4 hover:text-text hover:underline">
          All work
        </Link>
        <h1 className="mt-2 font-display text-[clamp(2.5rem,6vw,4.4rem)] leading-[1.04] font-medium tracking-[-0.02em]">
          {project.title}
        </h1>
        <p className="mt-2 text-muted tabular-nums">
          {project.context.replace(" · ", ", ")}, {project.period}
        </p>
        <p className="mt-6 max-w-[60ch] text-lg">{project.summary}</p>
        {project.stats.length ? (
          <dl className="mt-8 flex flex-wrap gap-x-12 gap-y-5">
            {project.stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse">
                <dt className="text-[0.92rem] text-muted">{s.label}</dt>
                <dd className="font-display text-[2.1rem] leading-tight font-medium tabular-nums">{s.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <p className="mt-7 max-w-[60ch] text-[0.9rem] text-muted">{project.stack.join(", ")}</p>
        {project.links?.length ? (
          <ul className="mt-1 flex flex-wrap gap-x-6 font-medium">
            {project.links.map((l) => (
              <li key={l.href}>
                <a href={l.href} rel="noopener noreferrer" className={`inline-flex min-h-11 items-center ${link}`}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </header>

      <div className="pb-20 xl:grid xl:grid-cols-[minmax(0,56rem)_1fr] xl:gap-14">
        <div className="prose">{children}</div>
        <div className="hidden pt-[4.6rem] xl:block">
          <Contents sections={project.sections} />
        </div>
      </div>

      {other ? (
        <nav aria-label="Next project" className="border-t border-line py-12">
          <p className="text-[0.95rem] text-muted">Next project</p>
          <Link
            href={`/projects/${other.slug}`}
            className="mt-1 inline-block font-display text-[clamp(1.9rem,4vw,2.6rem)] font-medium tracking-[-0.015em] hover:text-accent"
          >
            {other.title}
          </Link>
        </nav>
      ) : null}
    </article>
  );
}

/** Lets a diagram break out of the narrow text column. */
export function Wide({ children }: { children: React.ReactNode }) {
  return <div className="wide my-10 w-full max-w-[56rem]">{children}</div>;
}
