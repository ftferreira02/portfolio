import type { Metadata } from "next";
import { ProjectPage } from "@/components/project-page";
import { getProject } from "@/content/projects";
import Body from "@/content/projects/quests.mdx";

const project = getProject("quests");

export const metadata: Metadata = {
  title: project.title,
  description: project.description,
  alternates: { canonical: `/projects/${project.slug}` },
  openGraph: { url: `/projects/${project.slug}`, title: project.title, description: project.description },
};

export default function Page() {
  return (
    <ProjectPage project={project}>
      <Body />
    </ProjectPage>
  );
}
