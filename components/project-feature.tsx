import Link from "next/link";
import type { Project } from "@/content/projects";
import { Stats } from "./stats";

export function ProjectFeature({ project, visual }: { project: Project; visual: React.ReactNode }) {
  return (
    <article className="grid items-center gap-10 border-b border-line py-12 md:grid-cols-2 md:gap-12">
      <div>
        <h3 className="font-display text-[clamp(2.4rem,4.5vw,3rem)] font-semibold leading-none tracking-[-0.02em]">
          {project.title}
        </h3>
        <p className="mt-2 text-[0.95rem] text-muted">{project.context}</p>
        <p className="mt-4 max-w-[34rem]">{project.summary}</p>
        <Stats stats={project.stats} />
        <Link href={`/projects/${project.slug}`} className="link-underline mt-6 inline-block font-bold">
          {project.linkLabel}
        </Link>
      </div>
      <div>{visual}</div>
    </article>
  );
}
