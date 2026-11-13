import { site } from "@/content/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-muted sm:px-6">
        <p>
          {site.name}, {site.location}.
        </p>
        <ul className="flex flex-wrap gap-5">
          <li>
            <a href={`mailto:${site.email}`} className="hover:text-text">
              Email
            </a>
          </li>
          <li>
            <a href={site.github} className="hover:text-text" rel="noopener noreferrer">
              GitHub
            </a>
          </li>
          <li>
            <a href={site.linkedin} className="hover:text-text" rel="noopener noreferrer">
              LinkedIn
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
