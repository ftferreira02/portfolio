/**
 * Data and rules for the small MEMORIA demo on the home page. The real system uses a local language model and
 * CLIP; this is a deliberately tiny, rule-based stand-in so the idea can be shown without a backend.
 */

export type Kind = "padel" | "beach" | "food" | "city" | "hike";
export type Place = "Aveiro" | "Madeira" | "Porto";
export type Who = "friends" | "alone";
export type Season = "summer" | "winter" | "spring" | "autumn";

export type Photo = { id: number; kind: Kind; place: Place; year: number; month: number; who: Who };

export type Filters = Partial<{ what: Kind; where: Place; who: Who; season: Season; year: number }>;
export type FilterKey = keyof Filters;

/** 24 hand-placed photos, so that removing each filter in the demo visibly widens the result. */
const rows: [Kind, Place, number, number, Who][] = [
  ["city", "Porto", 2025, 5, "friends"],
  ["padel", "Aveiro", 2026, 7, "friends"],
  ["food", "Aveiro", 2025, 3, "friends"],
  ["beach", "Madeira", 2024, 8, "friends"],
  ["hike", "Madeira", 2025, 4, "alone"],
  ["padel", "Porto", 2026, 3, "friends"],
  ["food", "Madeira", 2025, 8, "alone"],
  ["beach", "Porto", 2024, 6, "friends"],
  ["padel", "Aveiro", 2025, 7, "friends"],
  ["city", "Aveiro", 2024, 11, "alone"],
  ["beach", "Madeira", 2024, 7, "alone"],
  ["food", "Porto", 2024, 12, "friends"],
  ["hike", "Porto", 2026, 2, "alone"],
  ["padel", "Aveiro", 2026, 8, "friends"],
  ["city", "Aveiro", 2025, 6, "friends"],
  ["beach", "Madeira", 2025, 8, "friends"],
  ["food", "Aveiro", 2026, 10, "alone"],
  ["padel", "Porto", 2025, 2, "alone"],
  ["hike", "Madeira", 2024, 9, "friends"],
  ["city", "Porto", 2026, 9, "friends"],
  ["beach", "Aveiro", 2026, 7, "friends"],
  ["padel", "Aveiro", 2026, 10, "friends"],
  ["food", "Madeira", 2024, 1, "friends"],
  ["hike", "Madeira", 2026, 5, "friends"],
];

export const photos: Photo[] = rows.map(([kind, place, year, month, who], id) => ({ id, kind, place, year, month, who }));

const kindWords: Record<Kind, string[]> = {
  padel: ["padel"],
  beach: ["beach", "sea", "swim", "swimming"],
  food: ["dinner", "lunch", "food", "eat", "restaurant"],
  city: ["city", "street", "night out"],
  hike: ["hike", "hiking", "mountain", "trail"],
};
const seasonMonths: Record<Season, number[]> = {
  summer: [6, 7, 8],
  winter: [12, 1, 2],
  spring: [3, 4, 5],
  autumn: [9, 10, 11],
};
const places: Place[] = ["Aveiro", "Madeira", "Porto"];

/** The demo's "now". Fixed so the page renders the same everywhere. */
const currentYear = 2026;

/** True when `phrase` appears as whole words, so "sea" doesn't match "research" or "eat" match "great". */
function has(text: string, phrase: string): boolean {
  return new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(text);
}

export function parse(text: string): Filters {
  const t = text.toLowerCase();
  const f: Filters = {};
  for (const kind of Object.keys(kindWords) as Kind[]) {
    if (kindWords[kind].some((w) => has(t, w))) f.what = kind;
  }
  for (const place of places) if (has(t, place.toLowerCase())) f.where = place;
  if (/\bwith (friends|my friends|the team|people)\b/.test(t)) f.who = "friends";
  if (/\balone\b|\bby myself\b|\bsolo\b/.test(t)) f.who = "alone";
  for (const season of Object.keys(seasonMonths) as Season[]) if (has(t, season)) f.season = season;
  if (has(t, "fall")) f.season = "autumn";
  const year = t.match(/\b(202[4-6])\b/);
  if (year) f.year = Number(year[1]);
  if (/\blast (summer|winter|spring|autumn|fall)\b|\bthis year\b/.test(t)) f.year = currentYear;
  if (/\blast year\b/.test(t)) f.year = currentYear - 1;
  return f;
}

export function matches(p: Photo, f: Filters): boolean {
  return (
    (!f.what || p.kind === f.what) &&
    (!f.where || p.place === f.where) &&
    (!f.who || p.who === f.who) &&
    (!f.year || p.year === f.year) &&
    (!f.season || seasonMonths[f.season].includes(p.month))
  );
}

/** Matching photos newest first, so photos that start matching mix in between the others. */
export function search(f: Filters): Photo[] {
  return photos
    .filter((p) => matches(p, f))
    .sort((a, b) => b.year * 12 + b.month - (a.year * 12 + a.month) || a.id - b.id);
}

export function dayCount(list: Photo[]): number {
  return new Set(list.map((p) => `${p.year}-${p.month}-${p.place}`)).size;
}

export const filterLabels: Record<FilterKey, string> = {
  what: "What",
  where: "Where",
  who: "With",
  season: "When",
  year: "Year",
};

/** What the demo types, and the order it takes the filters off again. */
export const script: { text: string; peel: FilterKey[] }[] = [
  { text: "padel with friends last summer", peel: ["season", "what", "who", "year"] },
  { text: "beach in Madeira 2024", peel: ["year", "what", "where"] },
  { text: "dinner in Aveiro", peel: ["what", "where"] },
];
