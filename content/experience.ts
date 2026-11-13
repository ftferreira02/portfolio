export type Job = { role: string; org: string; period: string; place: string; note?: string };

export const jobs: Job[] = [
  {
    role: "Student Researcher (part-time)",
    org: "Instituto de Telecomunicações",
    period: "Mar – Jul 2026",
    place: "Aveiro",
    note: "Edufiable: academic-record import and OID4VCI claim flow",
  },
  {
    role: "Front-End Developer (part-time)",
    org: "KBAI Research",
    period: "Sep 2023 – Aug 2024",
    place: "Funchal",
    note: "Booking and payment web apps in ASP.NET Core and Blazor",
  },
  {
    role: "Front-End Developer Intern",
    org: "Expedita",
    period: "Jul – Aug 2023",
    place: "Funchal",
    note: "Mobile version of the KBAI Browser web app",
  },
];

export const education = [
  { degree: "MSc in Software Engineering", school: "University of Aveiro", period: "2024 – 2026" },
  { degree: "BSc in Software Engineering", school: "University of Madeira", period: "2020 – 2024" },
];

export type SideProject = { title: string; context: string; text: string; stack: string[] };

export const alsoBuilt: SideProject[] = [
  {
    title: "Booking and payment apps",
    context: "KBAI Research, for Expedita's Gestools",
    text: "Customer-facing booking and payment web apps configured per client brand, with sign-up, login, password recovery and vouchers on loyalty-program web services.",
    stack: ["ASP.NET Core", "C#", "Blazor"],
  },
  {
    title: "NEI gamification platform",
    context: "Informatics Students' Association, University of Aveiro",
    text: "Co-developed the frontend of a platform that rewards students for attending events: a calendar, leaderboards and badges. I chose the stack.",
    stack: ["React", "Vite", "TanStack Router", "Tailwind CSS", "Radix UI"],
  },
];
