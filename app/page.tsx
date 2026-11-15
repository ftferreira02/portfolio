import Link from "next/link";
import { CopyEmail } from "@/components/copy-email";
import { HeroShell } from "@/components/home/hero-shell";
import { ImportDemo } from "@/components/home/import-demo";
import { MemoriaDemo } from "@/components/home/memoria-demo";
import { Route, type Stop } from "@/components/home/route";
import { TechList, TechProvider, TechScope } from "@/components/home/tech";
import { alsoBuilt, education, jobs } from "@/content/experience";
import { getProject } from "@/content/projects";
import { site } from "@/content/site";

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.role,
  url: site.url,
  email: `mailto:${site.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Aveiro", addressCountry: "PT" },
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "University of Aveiro" },
    { "@type": "CollegeOrUniversity", name: "University of Madeira" },
  ],
  sameAs: [site.github, site.linkedin],
};

const memoria = getProject("memoria");
const edufiable = getProject("edufiable");
const memoriaUses = [...memoria.stack, "Python"];

const [found, sus, people] = memoria.stats;

/** Jobs and degrees together, newest first, each placed on the map. */
const stops: Stop[] = [
  ...jobs.map((j) => ({
    since: j.since,
    when: j.period,
    title: `${j.role}, ${j.org}`,
    logo: j.logo,
    org: j.org,
    note: `${j.partTime ? "Part-time, " : ""}${j.place}.${j.note ? ` ${j.note}.` : ""}`,
    place: j.region,
  })),
  ...education.map((e) => ({ since: e.since, when: e.period, title: `${e.degree}, ${e.school}`, logo: e.logo, org: e.school, place: e.region })),
]
  .sort((x, y) => y.since.localeCompare(x.since));

const h2 = "font-display text-[clamp(1.7rem,3.4vw,2.4rem)] font-medium tracking-[-0.015em]";
const h3 = "font-display text-[1.9rem] font-semibold tracking-[-0.015em]";

export default function Home() {
  return (
    <TechProvider scopes={[memoriaUses, edufiable.stack, ...alsoBuilt.map((p) => p.stack)]}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />

      {/* Hero: who I am, over a field that reacts to the pointer */}
      <HeroShell>
        <h1 className="font-display text-[clamp(2.2rem,4.2vw,3.3rem)] leading-[1.04] font-medium tracking-[-0.02em]">
          {site.headline}
          <span className="block text-muted [text-wrap:wrap]">{site.tagline}</span>
        </h1>
        <p className="mt-5 max-w-[42ch] text-lg text-muted">{site.intro}</p>
        <div className="mt-9 flex flex-wrap items-center gap-x-7 gap-y-3 font-medium">
          <a href="#contact" className="btn-primary">
            Get in touch
          </a>
          <a href={site.cv} className="underline underline-offset-4 hover:text-accent">
            Download CV
          </a>
        </div>
        <p className="mt-7 flex items-baseline gap-2.5 text-[0.95rem] text-muted before:size-2 before:shrink-0 before:translate-y-[-1px] before:rounded-full before:bg-accent before:content-['']">
          {site.availability}
        </p>
      </HeroShell>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Work */}
        <section id="work" aria-labelledby="work-title" className="pt-[88px]">
          <h2 id="work-title" className={h2}>
            Things I&apos;ve built
          </h2>

          <TechScope uses={memoriaUses} className="grid items-start gap-6 pt-5 pb-12 lg:grid-cols-2 lg:gap-12">
            <div>
              <h3 className={h3}>{memoria.title}</h3>
              <p className="mt-0.5 mb-3.5 text-[0.95rem] text-muted tabular-nums">
                {memoria.context.replace(" · ", ", ")}, {memoria.period}
              </p>
              <p className="max-w-[58ch]">{memoria.summary}</p>
              <p className="my-[18px] max-w-[58ch] font-display text-xl leading-snug tabular-nums">
                I tested it with <b className="font-semibold">{people.value} people</b> on their own photo libraries. They
                completed <b className="font-semibold">{found.value.replace("/", " of ")}</b> search tasks within three
                minutes and gave it a mean score of <b className="font-semibold">{sus.value}</b> on the System Usability Scale.
              </p>
              <TechList items={memoria.stack} className="block text-[0.9rem] text-muted" />
              <div className="mt-3.5 flex flex-wrap gap-x-6 gap-y-2 font-medium">
                <Link href={`/projects/${memoria.slug}`} className="underline underline-offset-4 hover:text-accent">
                  {memoria.linkLabel}
                </Link>
                {memoria.links?.map((l) => (
                  <a key={l.href} href={l.href} rel="noopener noreferrer" className="underline underline-offset-4 hover:text-accent">
                    {l.label}
                  </a>
                ))}
              </div>
            </div>
            <MemoriaDemo />
          </TechScope>

          <TechScope uses={edufiable.stack} className="grid items-start gap-6 py-12 lg:grid-cols-2 lg:gap-12">
            <div>
              <h3 className={h3}>{edufiable.title}</h3>
              <p className="mt-0.5 mb-3.5 text-[0.95rem] text-muted tabular-nums">
                {edufiable.context.replace(" · ", ", ")}, {edufiable.period}
              </p>
              <p className="max-w-[58ch]">{edufiable.summary}</p>
              <TechList items={edufiable.stack} className="mt-3.5 block text-[0.9rem] text-muted" />
              <div className="mt-3.5 font-medium">
                <Link href={`/projects/${edufiable.slug}`} className="underline underline-offset-4 hover:text-accent">
                  {edufiable.linkLabel}
                </Link>
              </div>
            </div>
            <ImportDemo />
          </TechScope>

          <div className="grid gap-7 pt-4 md:grid-cols-2 md:gap-10">
            {alsoBuilt.map((p) => (
              <TechScope key={p.title} uses={p.stack}>
                <h3 className="text-[1.1rem] font-bold">{p.title}</h3>
                <p className="mt-0.5 mb-2 text-[0.92rem] text-muted">{p.context}</p>
                <p>{p.text}</p>
                <TechList items={p.stack} className="mt-2 block text-[0.9rem] text-muted" />
              </TechScope>
            ))}
          </div>
        </section>

        {/* Experience and education */}
        <section id="experience" aria-labelledby="exp-title" className="pt-[88px]">
          <h2 id="exp-title" className={h2}>
            How I got here
          </h2>
          <p className="mt-2 mb-9 max-w-[60ch] text-muted">
            A degree and my first jobs in Madeira, then over to the mainland for the master&apos;s in Aveiro.
          </p>
          <Route stops={stops} />
        </section>

        {/* Contact */}
        <section id="contact" aria-labelledby="contact-title" className="pt-24 pb-16">
          <h2 id="contact-title" className="font-display text-[clamp(2rem,5vw,3.4rem)] leading-[1.05] font-medium tracking-[-0.02em]">
            Let&apos;s talk.
          </h2>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a href={`mailto:${site.email}`} className="font-display text-[clamp(1.1rem,3.4vw,1.6rem)] break-all underline underline-offset-4 hover:text-accent">
              {site.email}
            </a>
            <CopyEmail email={site.email} />
          </div>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 font-medium">
            <a href={site.cv} className="underline underline-offset-4 hover:text-accent">
              Download CV
            </a>
          </div>
        </section>
      </div>
    </TechProvider>
  );
}
