export const site = {
  name: "Francisco Ferreira",
  role: "Software Engineer",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://ftferreira.vercel.app",
  headline: "Hi, I'm Francisco",
  // Non-breaking spaces keep "end to end" on one line.
  tagline: "I build web apps end to end",
  intro: "MSc in Software Engineering, University of Aveiro.",
  availability: "Available for full-time roles",
  description:
    "Full-stack software engineer in Aveiro, Portugal. I build web products end to end, including ML features.",
  location: "Aveiro, Portugal",
  dayToDay: ["Next.js", "TypeScript", "Django", "Python"],
  email: "tomasfreitas4054@gmail.com",
  github: "https://github.com/ftferreira02",
  linkedin: "https://www.linkedin.com/in/ftferreira02",
  cv: "/cv.pdf",
} as const;
