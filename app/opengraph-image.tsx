import { ogImage } from "@/components/og-card";
import { site } from "@/content/site";

export const alt = `${site.name}, Software Engineer`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return ogImage({ title: `${site.headline}\n${site.tagline}`, subtitle: "Full-stack engineer in Aveiro, Portugal." });
}
