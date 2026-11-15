"use client";

import { useEffect, useRef } from "react";

/*
 * The hero's background: a faint field of scattered "photos". Wherever the pointer goes, the ones nearby fall into
 * a tidy grid and take on colour, which is what MEMORIA does to a photo library. When nobody is pointing, a slow
 * invisible pointer wanders so the page is never completely still. Purely decorative: it sits behind the text and
 * takes no input of its own.
 */

const CELL = 58;
const TILE = 30;
const RADIUS = 190;
const TINTS = ["#1849ed", "#7cc7f2", "#ffb38a", "#a6dcae", "#c9d3ea", "#f9c65d"];

type Tile = { gx: number; gy: number; sx: number; sy: number; rot: number; phase: number; tint: string; t: number };

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

    const readTheme = () => {
      const text = getComputedStyle(document.documentElement).getPropertyValue("--text").trim();
      const n = parseInt(text.replace("#", "").slice(0, 6), 16);
      idle = `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, 0.07)`;
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
            phase: hash(i + 29) * Math.PI * 2,
            tint: TINTS[Math.floor(hash(i + 41) * TINTS.length)],
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
      // With reduced motion nothing moves on its own: no drift, and the resting tidy patch stays put.
      // Tiles still answer the pointer, since that movement is the visitor's own.
      const time = reduce ? 0 : now / 1000;
      // With no real pointer for a while, a slow wanderer keeps one patch tidy.
      let px = pointer.x;
      let py = pointer.y;
      if (now - pointer.seen > 2500) {
        // On wide screens it stays on the empty right side; on phones, below the text.
        const wide = w > 900;
        px = w * (wide ? 0.68 + 0.2 * Math.sin(time * 0.23) : 0.5 + 0.3 * Math.sin(time * 0.23));
        py = h * (wide ? 0.5 + 0.3 * Math.sin(time * 0.31 + 1.3) : 0.86 + 0.06 * Math.sin(time * 0.31 + 1.3));
      }
      // Keep the field quieter behind the text on wide screens.
      const textEdge = w > 900 ? w * 0.5 : 0;

      for (const tile of tiles) {
        const d = Math.hypot(tile.gx - px, tile.gy - py);
        const target = Math.max(0, 1 - d / RADIUS);
        tile.t += (target - tile.t) * (reduce ? 0.22 : 0.09);
        const k = tile.t * tile.t * (3 - 2 * tile.t);
        const drift = reduce ? 0 : 1;
        const x = tile.sx + Math.sin(time * 0.4 + tile.phase) * 5 * drift + (tile.gx - tile.sx) * k;
        const y = tile.sy + Math.cos(time * 0.33 + tile.phase) * 5 * drift + (tile.gy - tile.sy) * k;
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
          ctx.globalAlpha = k * 0.85 * quiet;
          ctx.fillStyle = tile.tint;
          ctx.fill();
          // A hint of a picture: a horizon and a sun.
          ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
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
