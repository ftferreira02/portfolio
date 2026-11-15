"use client";

import { useEffect, useRef } from "react";

/*
 * The hero's background: a faint field of scattered "photos". Wherever the pointer goes, the ones nearby fall into
 * a tidy grid and take on colour, which is what MEMORIA does to a photo library. When nobody is pointing, one patch
 * on the empty side rests tidy, so the idea reads without a mouse. Nothing moves on its own. Purely decorative: it
 * sits behind the text and takes no input of its own.
 */

const CELL = 58;
const TILE = 30;
const RADIUS = 190;
const TINTS = ["#1849ed", "#7cc7f2", "#ffb38a", "#a6dcae", "#c9d3ea", "#f9c65d"];
// On the dark page the same hues, lifted, so they read as colour instead of mud.
const TINTS_DARK = ["#7d97ff", "#8fd3f7", "#ffc2a0", "#b5e6bc", "#d5dcf0", "#fbd27a"];

type Tile = { gx: number; gy: number; sx: number; sy: number; rot: number; tint: number; t: number };

function hash(n: number) {
  const x = Math.sin(n * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

export function HeroField() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (!el || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let tiles: Tile[] = [];
    let idle = "rgba(34, 37, 46, 0.07)";
    let dark = false;

    const readTheme = () => {
      const text = getComputedStyle(document.documentElement).getPropertyValue("--text").trim();
      const n = parseInt(text.replace("#", "").slice(0, 6), 16);
      idle = `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, 0.07)`;
      // Light text means a dark page.
      dark = ((n >> 16) & 255) + ((n >> 8) & 255) + (n & 255) > 382;
    };

    const layout = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = el.clientWidth;
      h = el.clientHeight;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.ceil(w / CELL) + 1;
      const rows = Math.ceil(h / CELL) + 1;
      const offX = (w - (cols - 1) * CELL) / 2;
      const offY = (h - (rows - 1) * CELL) / 2;
      tiles = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * 131 + c * 17 + 1;
          if (hash(i + 0.5) < 0.38) continue; // leave gaps: a loose scatter, not wallpaper
          const gx = offX + c * CELL;
          const gy = offY + r * CELL;
          tiles.push({
            gx,
            gy,
            sx: gx + (hash(i) - 0.5) * CELL * 1.5,
            sy: gy + (hash(i + 7) - 0.5) * CELL * 1.5,
            rot: (hash(i + 13) - 0.5) * 1.3,
            tint: Math.floor(hash(i + 41) * TINTS.length),
            t: 0,
          });
        }
      }
    };

    // The pointer, in canvas coordinates. `seen` is when a real pointer last moved.
    const pointer = { x: -9999, y: -9999, seen: -Infinity };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.seen = performance.now();
    };

    const draw = (now: number) => {
      ctx.clearRect(0, 0, w, h);
      // Tiles only move in answer to the visitor's pointer.
      let px = pointer.x;
      let py = pointer.y;
      if (now - pointer.seen > 2500) {
        // No pointer for a while: one patch rests tidy, on the empty right side on wide screens, below the text on phones.
        const wide = w > 900;
        px = w * (wide ? 0.68 : 0.5);
        py = h * (wide ? 0.62 : 0.86);
      }
      // Keep the field quieter behind the text on wide screens.
      const textEdge = w > 900 ? w * 0.5 : 0;

      for (const tile of tiles) {
        const d = Math.hypot(tile.gx - px, tile.gy - py);
        const target = Math.max(0, 1 - d / RADIUS);
        tile.t += (target - tile.t) * (reduce ? 0.22 : 0.09);
        const k = tile.t * tile.t * (3 - 2 * tile.t);
        const x = tile.sx + (tile.gx - tile.sx) * k;
        const y = tile.sy + (tile.gy - tile.sy) * k;
        const quiet = textEdge ? 0.22 + 0.78 * Math.min(1, Math.max(0, (tile.gx - textEdge * 0.8) / (textEdge * 0.5))) : 0.5;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(tile.rot * (1 - k));
        ctx.beginPath();
        ctx.roundRect(-TILE / 2, -TILE / 2, TILE, TILE, 6);
        ctx.globalAlpha = quiet;
        ctx.fillStyle = idle;
        ctx.fill();
        if (k > 0.02) {
          ctx.globalAlpha = k * (dark ? 1 : 0.85) * Math.min(1, quiet * (dark ? 1.35 : 1));
          ctx.fillStyle = (dark ? TINTS_DARK : TINTS)[tile.tint];
          ctx.fill();
          // A hint of a picture: a horizon and a sun.
          ctx.fillStyle = dark ? "rgba(16, 19, 26, 0.55)" : "rgba(255, 255, 255, 0.75)";
          ctx.fillRect(-TILE / 2 + 5, 4, TILE - 10, 2.5);
          ctx.beginPath();
          ctx.arc(TILE / 2 - 9, -TILE / 2 + 9, 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    };

    readTheme();
    layout();
    const ro = new ResizeObserver(() => {
      layout();
    });
    ro.observe(el);
    const theme = new MutationObserver(() => {
      readTheme();
    });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => {
      readTheme();
    };
    media.addEventListener("change", onScheme);

    let frame = 0;
    let onScreen = true;
    const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting));
    io.observe(el);
    window.addEventListener("pointermove", onMove, { passive: true });
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop);
      if (onScreen && document.visibilityState === "visible") draw(now);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      ro.disconnect();
      io.disconnect();
      theme.disconnect();
      media.removeEventListener("change", onScheme);
    };
  }, []);

  return <canvas ref={canvas} aria-hidden="true" className="hero-field pointer-events-none absolute inset-0 size-full" />;
}
