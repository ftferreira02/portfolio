export type Stat = { value: string; label: string };

export type Project = {
  slug: "memoria" | "edufiable";
  title: string;
  context: string;
  period: string;
  summary: string;
  description: string;
  stats: Stat[];
  /** The h2 headings of the page, in order, for the "On this page" list. */
  sections: string[];
  stack: string[];
  linkLabel: string;
  links?: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    slug: "memoria",
    title: "MEMORIA",
    context: "Master's thesis · ACM LSC'26 system paper",
    period: "2025 – 2026",
    summary:
      "I turned a Lifelog Search Challenge system into a photo app for everyday use. Uploaded photos are grouped into Days and Trips, and you can find a moment by describing it: a local language model turns the sentence into filters you can see and edit.",
    description:
      "How I adapted a research lifelog retrieval system into a personal photo app: asynchronous ingestion, Days and Trips, face recognition and conversational hybrid search.",
    stats: [
      { value: "120/120", label: "study tasks found within 3 min" },
      { value: "91.5", label: "mean SUS score" },
      { value: "10", label: "people, own photo libraries" },
    ],
    sections: ["The problem", "What I built", "Results", "What I'd do next"],
    stack: ["Next.js", "Django", "Celery", "Redis", "PostgreSQL", "Milvus", "CLIP", "Ollama (Qwen)"],
    linkLabel: "How MEMORIA works",
    links: [{ label: "LSC'26 paper (ACM)", href: "https://doi.org/10.1145/3810984.3817065" }],
  },
  {
    slug: "edufiable",
    title: "Edufiable",
    context: "Instituto de Telecomunicações · BLOCKCHAIN.PT",
    period: "Mar – Jul 2026",
    summary:
      "Universities issue diplomas as W3C Verifiable Credentials on EBSI. I built the import that checks academic records before they become credentials, and the flow students use to claim one into their wallet.",
    description:
      "The academic-record batch import and OID4VCI credential-claim flow I built for Edufiable, a platform that issues diplomas as W3C Verifiable Credentials on EBSI.",
    stats: [],
    sections: ["The problem", "What I built", "What it changed"],
    stack: ["Next.js", "TypeScript", "Express", "Prisma", "PostgreSQL"],
    linkLabel: "More about Edufiable",
  },
];

export function getProject(slug: Project["slug"]): Project {
  const project = projects.find((p) => p.slug === slug);
  if (!project) throw new Error(`Unknown project: ${slug}`);
  return project;
}
