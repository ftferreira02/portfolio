import { Hero } from "@/components/hero";
import { ProjectFeature } from "@/components/project-feature";
import { MemoriaPipeline } from "@/components/diagrams/memoria-pipeline";
import { EdufiableOverview } from "@/components/diagrams/edufiable-overview";
import { getProject } from "@/content/projects";
import { alsoBuilt, education, jobs } from "@/content/experience";
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

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <Hero />

      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <section id="work" aria-labelledby="work-title" className="pt-20">
          <h2 id="work-title" className="font-display text-[clamp(2rem,4vw,2.9rem)] font-medium leading-tight tracking-[-0.015em]">
            Selected work
          </h2>
          <p className="mt-2 text-muted">Two projects, each taken from research to something people can use.</p>
          <ProjectFeature
            project={getProject("memoria")}
            visual={<MemoriaPipeline caption="How a photo moves through MEMORIA, simplified." />}
          />
          <ProjectFeature
            project={getProject("edufiable")}
            visual={<EdufiableOverview caption="Drawn from the project's docs. No product screenshots." />}
          />
        </section>

        <section aria-labelledby="also-title" className="pt-16">
          <h2 id="also-title" className="font-display text-[clamp(1.6rem,3vw,2.1rem)] font-medium tracking-[-0.01em]">
            Also built
          </h2>
          <ul className="mt-6 grid gap-6 md:grid-cols-2">
            {alsoBuilt.map((p) => (
              <li key={p.title} className="rounded-2xl border border-line p-6">
                <h3 className="text-lg font-bold">{p.title}</h3>
                <p className="text-sm text-muted">{p.context}</p>
                <p className="mt-3">{p.text}</p>
                <p className="mt-3 text-sm text-muted">{p.stack.join(" · ")}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="experience" aria-labelledby="exp-title" className="grid gap-10 py-20 md:grid-cols-[1fr_1.7fr]">
          <h2 id="exp-title" className="font-display text-[clamp(2rem,4vw,2.9rem)] font-medium leading-tight tracking-[-0.015em]">
            Where I&apos;ve worked
          </h2>
          <div>
            <ul>
              {jobs.map((job) => (
                <li key={job.org} className="flex flex-col gap-1 border-t border-line py-4 sm:flex-row sm:justify-between sm:gap-6">
                  <div>
                    <p>
                      <b>{job.role}</b>, {job.org}
                    </p>
                    {job.note ? <p className="text-sm text-muted">{job.note}</p> : null}
                  </div>
                  <p className="shrink-0 text-muted">{job.period}</p>
                </li>
              ))}
            </ul>
            <h3 className="mt-10 text-lg font-bold">Education</h3>
            <ul className="mt-2">
              {education.map((e) => (
                <li key={e.degree} className="flex flex-col gap-1 border-t border-line py-4 sm:flex-row sm:justify-between sm:gap-6">
                  <p>
                    <b>{e.degree}</b>, {e.school}
                  </p>
                  <p className="shrink-0 text-muted">{e.period}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      <section id="contact" aria-labelledby="contact-title" className="on-dark bg-[#1849ed] text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-8 px-5 py-16 sm:px-6">
          <div>
            <h2 id="contact-title" className="font-display text-[clamp(2rem,4vw,2.9rem)] font-medium leading-tight tracking-[-0.015em]">
              Have a role in mind?
            </h2>
            <p className="mt-2 text-white/85">
              Based in Aveiro, open to remote. The quickest way to reach me is email.
            </p>
          </div>
          <ul className="flex flex-wrap gap-2.5 font-bold">
            <li>
              <a href={site.cv} className="inline-block rounded-full bg-white px-5 py-2.5 text-[#1849ed] hover:bg-white/90">
                Download CV
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="inline-block rounded-full border-[1.5px] border-white px-5 py-2.5 hover:bg-white/10">
                Email
              </a>
            </li>
            <li>
              <a href={site.github} rel="noopener noreferrer" className="inline-block rounded-full border-[1.5px] border-white px-5 py-2.5 hover:bg-white/10">
                GitHub
              </a>
            </li>
            <li>
              <a href={site.linkedin} rel="noopener noreferrer" className="inline-block rounded-full border-[1.5px] border-white px-5 py-2.5 hover:bg-white/10">
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
