import { site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 py-5 text-sm text-muted sm:px-6">
        <p>
          {site.name}, {site.location}
        </p>
        <ul className="flex flex-wrap gap-5">
          <li>
            <a href={`mailto:${site.email}`} className="inline-flex min-h-11 items-center hover:text-text">
              Email
            </a>
          </li>
          <li>
            <a href={site.github} className="inline-flex min-h-11 items-center hover:text-text" rel="noopener noreferrer">
              GitHub
            </a>
          </li>
          <li>
            <a href={site.linkedin} className="inline-flex min-h-11 items-center hover:text-text" rel="noopener noreferrer">
              LinkedIn
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
