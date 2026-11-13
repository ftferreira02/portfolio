import { ImageResponse } from "next/og";
import { OgCard } from "@/components/og-card";
import { getProject } from "@/content/projects";

const project = getProject("memoria");

export const alt = `${project.title}, a project by Francisco Ferreira`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(<OgCard title={project.title} subtitle={project.context} />, size);
}
