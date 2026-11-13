import Link from "next/link";
import { site } from "@/content/site";
import { ThemeToggle } from "./theme-toggle";

const nav = [
  { href: "/#work", label: "Work" },
  { href: "/#experience", label: "Experience" },
  { href: "/#contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-6">
        <Link href="/" className="font-display text-xl font-semibold">
          {site.name}
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          <ul className="hidden items-center gap-1 sm:flex">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="rounded-md px-3 py-2 text-muted transition-colors hover:text-text"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a href={site.cv} className="rounded-md px-3 py-2 text-muted transition-colors hover:text-text">
                CV
              </a>
            </li>
          </ul>
          <details className="relative sm:hidden">
            <summary className="flex size-10 cursor-pointer list-none items-center justify-center rounded-full border border-line [&::-webkit-details-marker]:hidden">
              <span className="sr-only">Menu</span>
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </summary>
            <ul className="absolute right-0 mt-2 w-44 rounded-xl border border-line bg-bg p-2 shadow-lg">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="block rounded-md px-3 py-2 hover:bg-soft">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href={site.cv} className="block rounded-md px-3 py-2 hover:bg-soft">
                  CV
                </a>
              </li>
            </ul>
          </details>
          <ThemeToggle className="ml-1" />
        </nav>
      </div>
    </header>
  );
}
