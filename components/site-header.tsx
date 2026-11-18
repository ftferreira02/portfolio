"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { site } from "@/content/site";
import { NavDisclosure } from "./nav-disclosure";
import { ThemeToggle } from "./theme-toggle";

// The bar only appears once the page has scrolled; at the very top the header sits on the page itself.
function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}
const isScrolled = () => window.scrollY > 8;

const nav = [
  { href: "/#work", label: "Projects" },
  { href: "/#experience", label: "Experience" },
  { href: "/#contact", label: "Contact" },
];

/** The site has two versions of the same story: the written portfolio and the padel match. This switches between them. */
function VersionSwitch({ onMatch, className = "" }: { onMatch: boolean; className?: string }) {
  const item = (active: boolean) =>
    `rounded-[7px] px-2.5 py-1.5 transition-colors ${active ? "bg-soft text-text" : "text-muted hover:text-text"}`;
  return (
    <div role="group" aria-label="Portfolio version" className={`items-center rounded-[10px] border border-line p-0.5 text-sm ${className}`}>
      <Link href="/" aria-current={onMatch ? undefined : "true"} className={item(!onMatch)}>
        Portfolio
      </Link>
      <Link href="/padel" aria-current={onMatch ? "true" : undefined} className={item(onMatch)}>
        Match
      </Link>
    </div>
  );
}

export function SiteHeader() {
  const scrolled = useSyncExternalStore(subscribe, isScrolled, () => false);
  const pathname = usePathname();
  // On the match the header carries only the way back and the CV; the court below is the page.
  const onMatch = pathname === "/padel";
  // The home page already opens with "Hi, I'm Francisco", so at the top only the mark shows; the name joins on scroll.
  const hideName = pathname === "/" && !scrolled;
  return (
    <header
      data-version={onMatch ? "match" : "portfolio"}
      className={`sticky top-0 z-40 border-b transition-[background-color,border-color] duration-200 ${
        scrolled
          ? "border-line bg-bg/90 backdrop-blur"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className={`mx-auto flex h-16 items-center justify-between gap-4 ${onMatch ? "max-w-[1704px] px-3" : "max-w-6xl px-5 sm:px-6"}`}>
        <Link href="/" aria-label={`${site.name}, home`} className="site-mark group flex min-w-0 items-center gap-2">
          {/* The site's mark: Madeira, an island over the Atlantic. */}
          <svg aria-hidden="true" viewBox="0 0 32 32" className="size-7 shrink-0">
            <path d="M4.5 19.5 11 9.5l3.6 4.6L19 7l8.5 12.5z" fill="var(--text)" stroke="var(--text)" strokeWidth="2" strokeLinejoin="round" />
            <path
              className="site-mark-wave"
              d="M3 25.5q3.25-3 6.5 0t6.5 0 6.5 0 6.5 0"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2.6"
              strokeLinecap="round"
            />
          </svg>
          <span
            className={`truncate font-display text-lg font-medium transition-opacity duration-200 sm:text-xl ${onMatch ? "hidden sm:inline" : ""} ${hideName ? "invisible opacity-0" : "opacity-100"}`}
          >
            {site.name}
          </span>
        </Link>
        <nav aria-label="Main" className="flex shrink-0 items-center gap-1 sm:gap-2">
          {onMatch ? (
            <>
              <VersionSwitch onMatch className="flex" />
              <a href={site.cv} className="rounded-md px-3 py-2 text-muted transition-colors hover:text-text">
                CV
              </a>
            </>
          ) : (
            <>
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
              <a
                href={site.cv}
                className="rounded-md px-3 py-2 text-muted transition-colors hover:text-text"
              >
                CV
              </a>
            </li>
          </ul>
          <VersionSwitch onMatch={false} className="ml-1 hidden sm:flex" />
          <NavDisclosure className="relative sm:hidden"
            summaryClassName="flex size-11 cursor-pointer list-none items-center justify-center rounded-[10px] border border-line [&::-webkit-details-marker]:hidden"
            summary={<>
              <span className="sr-only">Menu</span>
              <svg
                aria-hidden="true"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </>}>
            <ul className="absolute right-0 mt-2 w-44 rounded-xl border border-line bg-bg p-2 shadow-lg">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block rounded px-3 py-2.5 hover:bg-soft"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={site.cv}
                  className="block rounded px-3 py-2.5 hover:bg-soft"
                >
                  CV
                </a>
              </li>
              <li className="mt-1 border-t border-line pt-1">
                <Link href="/padel" className="block rounded px-3 py-2.5 hover:bg-soft">
                  Padel match
                </Link>
              </li>
            </ul>
          </NavDisclosure>
          <ThemeToggle className="ml-1" />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
