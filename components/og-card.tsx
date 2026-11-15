import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/content/site";

/*
 * The image shown when a page is shared (WhatsApp, LinkedIn, Slack...). Rendered by next/og, so inline styles and
 * flexbox only. It uses the site's light colours and fonts, with the home page's photo tiles on the right: loose and
 * grey on the left, falling into a tidy, coloured grid towards the right edge.
 */

const ogSize = { width: 1200, height: 630 };

const font = (file: string) => readFile(join(process.cwd(), "assets/fonts", file));
const fonts = Promise.all([font("fraunces-500.ttf"), font("dm-sans-400.ttf"), font("dm-sans-500.ttf")]);

const C = { bg: "#f8f9fb", text: "#22252e", muted: "#5c6376", accent: "#1849ed", idle: "#e9ebf0" };
const TINTS = ["#1849ed", "#7cc7f2", "#ffb38a", "#a6dcae", "#c9d3ea", "#f9c65d"];

function hash(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

const CELL = 74;
const TILE = 54;
const COLS = 6;
const ROWS = 8;
const LEFT = 1200 - COLS * CELL + (CELL - TILE) / 2;
const TOP = (630 - ROWS * CELL) / 2 + (CELL - TILE) / 2;

function Tiles() {
  const tiles = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = r * 131 + c * 17 + 1;
      if (hash(i + 0.5) < 0.3) continue;
      // How tidy a tile is grows from the left of the field to the right edge.
      const k = Math.min(1, Math.max(0, (c - 1.2) / 3));
      const loose = 1 - k;
      const x = LEFT + c * CELL + (hash(i) - 0.5) * CELL * 0.8 * loose;
      const y = TOP + r * CELL + (hash(i + 7) - 0.5) * CELL * 0.8 * loose;
      const rot = (hash(i + 13) - 0.5) * 60 * loose;
      const tint = TINTS[Math.floor(hash(i + 41) * TINTS.length)];
      const coloured = k > 0.3;
      // The sun and horizon are laid out with flexbox inside the tile; absolute children drift in next/og.
      tiles.push(
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: TILE,
            height: TILE,
            borderRadius: 10,
            background: coloured ? tint : C.idle,
            opacity: coloured ? 0.35 + 0.6 * k : 1,
            transform: `rotate(${rot}deg)`,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "flex-end",
            padding: "9px 9px 15px",
          }}
        >
          {coloured ? <div style={{ width: 10, height: 10, borderRadius: 5, background: "rgba(255,255,255,0.8)" }} /> : null}
          {coloured ? <div style={{ width: "100%", height: 4, borderRadius: 2, background: "rgba(255,255,255,0.8)" }} /> : null}
        </div>,
      );
    }
  }
  return <>{tiles}</>;
}

export function OgCard({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", background: C.bg, color: C.text, fontFamily: "DM Sans", position: "relative" }}>
      <Tiles />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", width: 760 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, fontWeight: 500 }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: C.accent }} />
          {site.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontFamily: "Fraunces", fontSize: title.length > 24 ? 60 : 92, lineHeight: 1.06, letterSpacing: "-0.02em", display: "flex", flexDirection: "column" }}>
            {title.split("\n").map((line) => (
              <div key={line}>{line}</div>
            ))}
          </div>
          <div style={{ fontSize: 28, lineHeight: 1.35, marginTop: 22, color: C.muted, maxWidth: 600 }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", fontSize: 24, fontWeight: 500, color: C.accent }}>{new URL(site.url).host}</div>
      </div>
    </div>
  );
}

export async function ogImage(props: { title: string; subtitle: string }) {
  const [fraunces, dm400, dm500] = await fonts;
  return new ImageResponse(<OgCard {...props} />, {
    ...ogSize,
    fonts: [
      { name: "Fraunces", data: fraunces, weight: 500, style: "normal" },
      { name: "DM Sans", data: dm400, weight: 400, style: "normal" },
      { name: "DM Sans", data: dm500, weight: 500, style: "normal" },
    ],
  });
}
