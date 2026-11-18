import { education, jobs } from "./experience";
import { getProject } from "./projects";
import { site } from "./site";

export type MatchCopy = {
  title: string;
  body: string;
  links?: { href: string; label: string }[];
};

const memoria = getProject("memoria");
const edufiable = getProject("edufiable");
const quests = getProject("quests");
const projectLink = (slug: string, title: string) => [{ href: `/projects/${slug}`, label: `Explore ${title}` }];

// These keys join the biography to the choreography. Changing copy never changes a rally.
export const matchStory = {
  bonus: { title: "Secret tie-break unlocked", body: "Four wins together earned us an encore!" },
  hello: { title: site.headline, body: `${site.role} in ${site.location}. Take a seat: this is a quick match to get to know me.` },
  approach: { title: site.tagline, body: "From the database to the interface, including the machine learning features in between." },
  tools: { title: "My day to day", body: `${site.dayToDay.join(", ")}.` },
  madeira: { title: "It started in Madeira", body: `${education[1].degree}, ${education[1].school}, ${education[1].period}.` },
  internship: { title: "First internship", body: `${jobs[2].period} at ${jobs[2].org}: ${jobs[2].note}.` },
  firstJob: { title: "First job", body: `${jobs[1].role} at ${jobs[1].org}, ${jobs[1].period}. ${jobs[1].note}.` },
  aveiro: { title: "Over to the mainland", body: `${education[0].degree}, ${education[0].school}, ${education[0].period}.` },
  research: { title: "Research at IT", body: `${jobs[0].role} at ${jobs[0].org}, ${jobs[0].period}.`, links: projectLink(edufiable.slug, edufiable.title) },
  memoria: { title: memoria.title, body: "My master's thesis: a personal photo app that finds a moment from a description.", links: projectLink(memoria.slug, memoria.title) },
  results: { title: "And it works", body: `${memoria.stats[2].value} people searched their own photo libraries: ${memoria.stats[0].value} study tasks found within 3 minutes, mean SUS score ${memoria.stats[1].value}.`, links: [{ href: "/projects/memoria#results", label: "Read the study results" }] },
  edufiable: { title: edufiable.title, body: "University diplomas as verifiable credentials. I built the academic-record import and the flow students use to claim a diploma into their wallet.", links: projectLink(edufiable.slug, edufiable.title) },
  quests: { title: quests.title, body: "A rewards platform for the students' association. I built the calendar, QR check-in, leaderboard and points history.", links: projectLink(quests.slug, quests.title) },
  kitswipe: { title: "KitSwipe", body: "A side project in progress: a swipe feed for football shirts that learns your taste." },
  now: { title: "Right now", body: `${site.intro} ${site.availability}.` },
  offCourt: { title: "A different kind of portfolio", body: "A little padel, a few projects, and the route from Madeira to Aveiro. One more point?" },
  contact: { title: "Let's talk", body: "Have a role or a project in mind? I'd like to hear about it.", links: [{ href: `mailto:${site.email}`, label: "Email me" }, { href: site.github, label: "GitHub" }, { href: site.linkedin, label: "LinkedIn" }, { href: site.cv, label: "Download CV" }] },
} satisfies Record<string, MatchCopy>;


export const crowdSigns = [memoria.title, edufiable.title, quests.title, matchStory.kitswipe.title];
