import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { padelHeroDisplay } from "@/components/padel/fonts";

/**
 * The hero's other half: a still of the padel court, styled like the broadcast it opens.
 * Pressing Serve goes to the match, where the same frame comes alive and the first serve is played.
 */
export function HeroCourt() {
  return (
    <Link href="/padel?serve=1" className={`hero-court ${padelHeroDisplay.variable}`} aria-label="Serve: get to know me over a padel match">
      <ViewTransition name="padel-court">
        <Image
          src="/padel/court-wide.webp"
          alt=""
          width={1600}
          height={1000}
          loading="eager"
          sizes="(min-width: 1024px) 23rem, 100vw"
          className="hero-court-img"
        />
      </ViewTransition>
      <span className="hero-court-bug" aria-hidden="true">The Portfolio Open</span>
      <span className="hero-court-caption" aria-hidden="true">
        <span className="hero-court-line">Or get to know me over a padel match</span>
        <span className="hero-court-serve">Serve</span>
      </span>
    </Link>
  );
}
