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

export type SideProject = {
  title: string;
  context: string;
  text: string;
  stack: string[];
  /** Shown next to the title, e.g. for work that isn't finished. */
  status?: string;
  /** A page of its own, when there is one. */
  href?: string;
  linkLabel?: string;
};

export const alsoBuilt: SideProject[] = [
  {
    title: "KitSwipe",
    status: "In progress",
    context: "Personal project, mobile and web app",
    text: "A swipe feed for football shirts: save or pass, then rank and share your top five as an image. The For you feed learns your taste from what you save and pass (club, league, colours, kit type, era) and mixes in exploration picks. Community rankings run on Supabase with anonymous sign-in, ordered by the Wilson lower bound so a few votes can't top the board.",
    stack: ["Expo", "React Native", "TypeScript", "Expo Router", "Reanimated", "Supabase", "PostgreSQL"],
  },
  {
    title: "Booking and payment apps",
    context: "KBAI Research, for Expedita's Gestools",
    text: "Booking and payment web apps for Expedita's Gestools, run from one codebase for several client brands, each with its own theme, settings and deployment. I built the customer account area on the loyalty programme's web services: sign-up, login with JWT sessions, password recovery, profile editing, and pages for past reservations and vouchers. I also worked on the booking steps (location, duration, tariff, extras) in a site available in four languages, and on a Microsoft Teams app where staff manage services, seasons, tariffs and bookings.",
    stack: ["ASP.NET Core", "C#", "Razor Pages", "Blazor", "Microsoft Teams"],
  },
];
