import Link from "next/link";
import type { Project } from "@/content/projects";
import { projects } from "@/content/projects";
import { Stats } from "./stats";

/** Shared frame for a long-form project page: header, MDX body, next project. */
export function ProjectPage({ project, children }: { project: Project; children: React.ReactNode }) {
  const other = projects.find((p) => p.slug !== project.slug);
  return (
    <article>
      <header className="on-dark bg-surface text-on-surface">
        <div className="mx-auto max-w-6xl px-5 pb-14 pt-10 sm:px-6 md:pb-16">
          <Link href="/#work" className="text-sm text-on-surface-muted hover:text-white">
            All work
          </Link>
          <h1 className="mt-6 font-display text-[clamp(3rem,8vw,5.5rem)] font-semibold leading-none tracking-[-0.025em] text-white">
            {project.title}
          </h1>
          <p className="mt-3 text-on-surface-muted">{project.context}</p>
          <p className="mt-6 max-w-2xl text-lg">{project.summary}</p>
          <dl className="mt-8 grid max-w-3xl gap-x-10 gap-y-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-on-surface-muted">Role</dt>
              <dd className="mt-1">{project.role}</dd>
            </div>
            <div>
              <dt className="text-on-surface-muted">When</dt>
              <dd className="mt-1">{project.period}</dd>
            </div>
            <div>
              <dt className="text-on-surface-muted">Stack</dt>
              <dd className="mt-1">{project.stack.join(", ")}</dd>
            </div>
          </dl>
          {project.links?.length ? (
            <ul className="mt-8 flex flex-wrap gap-3">
              {project.links.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    rel="noopener noreferrer"
                    className="inline-block rounded-full bg-highlight px-4 py-2 text-sm font-bold text-[#22252e]"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6">
        <Stats stats={project.stats} />
        <div className="prose mt-4">{children}</div>
      </div>

      {other ? (
        <nav aria-label="Next project" className="border-t border-line">
          <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6">
            <p className="text-sm text-muted">Next project</p>
            <Link href={`/projects/${other.slug}`} className="mt-2 inline-block font-display text-4xl font-semibold hover:text-accent">
              {other.title}
            </Link>
          </div>
        </nav>
      ) : null}
    </article>
  );
}

/** Lets a diagram break out of the narrow text column. */
export function Wide({ children }: { children: React.ReactNode }) {
  return <div className="wide my-10 w-full max-w-[56rem]">{children}</div>;
}
