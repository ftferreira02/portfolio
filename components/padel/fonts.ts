import { Barlow, Barlow_Condensed } from "next/font/google";

/** The broadcast typefaces of the padel match. */
export const padelDisplay = Barlow_Condensed({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-padel-display", display: "swap" });
export const padelBody = Barlow({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-padel-body", display: "swap" });
/** The home page only shows a few words in the match's typeface, so it loads a single weight. */
export const padelHeroDisplay = Barlow_Condensed({ subsets: ["latin"], weight: ["800"], variable: "--font-padel-display", display: "swap" });
