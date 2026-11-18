import type { Metadata } from "next";
import { padelBody, padelDisplay } from "@/components/padel/fonts";
import { PadelMatch } from "@/components/padel/match";
import "./padel.css";

export const metadata: Metadata = {
  title: "The Portfolio Open",
  description: "Get to know Francisco Ferreira through a padel match: four points, a few projects, and the route from Madeira to Aveiro.",
  alternates: { canonical: "/padel" },
  openGraph: { title: "The Portfolio Open · Francisco Ferreira", url: "/padel", description: "A playful padel match and a few things about Francisco Ferreira." },
};

// The match takes the whole screen below the header. The header itself switches to its match form on this route:
// the Portfolio | Match switch and the CV, which are also the way out without JavaScript or WebGL.
export default function PadelPage() {
  return (
    <div className={`padel-page ${padelDisplay.variable} ${padelBody.variable}`}>
      <header className="sr-only">
        <h1>The Portfolio Open</h1>
        <p>A quick padel match and a few things about Francisco Ferreira. Choose your shots, or let Auto play the rallies between your decisions.</p>
      </header>
      <PadelMatch />
      <noscript>
        <style>{".padel-page .padel-match { display: none; }"}</style>
        <p className="padel-no-script">The match needs JavaScript. The portfolio and my CV are in the bar above.</p>
      </noscript>
    </div>
  );
}
