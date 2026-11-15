export type Region = "madeira" | "aveiro";
/** `since` (YYYY-MM) orders jobs and degrees together on the home page. */
export type Job = { role: string; org: string; logo: string; period: string; since: string; place: string; region: Region; partTime?: boolean; note?: string };

export const jobs: Job[] = [
  {
    role: "Student Researcher",
    org: "Instituto de Telecomunicações",
    logo: "/logos/it.webp",
    period: "Mar – Jul 2026",
    since: "2026-03",
    place: "Aveiro",
    region: "aveiro",
    partTime: true,
    note: "Edufiable: academic-record import and OID4VCI claim flow",
  },
  {
    role: "Front-End Developer",
    org: "KBAI Research",
    logo: "/logos/kbai.webp",
    period: "Sep 2023 – Aug 2024",
    since: "2023-09",
    place: "Funchal",
    region: "madeira",
    partTime: true,
    note: "Booking and payment web apps in ASP.NET Core and Blazor",
  },
  {
    role: "Front-End Developer Intern",
    org: "Expedita",
    logo: "/logos/expedita.webp",
    period: "Jul – Aug 2023",
    since: "2023-07",
    place: "Funchal",
    region: "madeira",
    note: "Mobile version of the KBAI Browser web app",
  },
];

export type Degree = { degree: string; school: string; logo: string; period: string; since: string; region: Region };

export const education: Degree[] = [
  { degree: "MSc in Software Engineering", school: "University of Aveiro", logo: "/logos/ua.webp", period: "2024 – 2026", since: "2024-09", region: "aveiro" },
  { degree: "BSc in Software Engineering", school: "University of Madeira", logo: "/logos/uma.webp", period: "2020 – 2024", since: "2020-09", region: "madeira" },
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
