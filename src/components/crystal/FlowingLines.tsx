import { useEffect, useRef } from "react";

/**
 * Premium animated hero background — luminous light ribbons sweeping across a
 * dark navy field, with bloom, parallax depth, corner glow and a vignette.
 * Inspired by Apple / Stripe / Linear / Vercel hero showcases.
 *
 * Canvas 2D, additive blending, DPR-capped, reduced-motion aware, ~60fps.
 */

interface Rgb {
  r: number;
  g: number;
  b: number;
}

const hexRgb = (hex: string): Rgb => {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const rgba = (c: Rgb, a: number) => `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`;

// Palette from spec
const PALETTE = {
  cyan: hexRgb("#93C5FD"), // brightest core
  light: hexRgb("#60A5FA"),
  blue: hexRgb("#3B82F6"),
  deep: hexRgb("#2563EB"),
};

interface Ribbon {
  /** vertical anchor 0..1 */
  baseY: number;
  amp: number;
  freq: number;
  phase: number;
  speed: number; // horizontal drift speed
  thickness: number;
  alpha: number;
  tilt: number; // diagonal slope
  depth: number; // 0 (far) .. 1 (near) -> parallax + size
  color: Rgb;
  hero: boolean; // the one bright primary beam
  fadePhase: number;
  fadeSpeed: number;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function FlowingLines() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.tx = e.clientX / window.innerWidth;
      mouse.current.ty = e.clientY / window.innerHeight;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    let w = window.innerWidth;
    let h = window.innerHeight;
    let animId = 0;
    let lastTime = performance.now();
    let ribbons: Ribbon[] = [];

    const ribbonCount = () => (w < 768 ? 6 : w < 1300 ? 9 : 12);

    const build = () => {
      const n = ribbonCount();
      ribbons = [];

      // The hero beam: bright cyan, sweeps left-center -> bottom-right
      ribbons.push({
        baseY: 0.42,
        amp: 150,
        freq: 0.9,
        phase: 0.4,
        speed: 0.05,
        thickness: 3.2,
        alpha: 0.95,
        tilt: 0.16,
        depth: 1,
        color: PALETTE.cyan,
        hero: true,
        fadePhase: 0,
        fadeSpeed: 0.18,
      });

      // Supporting ribbons behind it
      const tones = [PALETTE.light, PALETTE.blue, PALETTE.deep, PALETTE.blue, PALETTE.light];
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1);
        const depth = 0.25 + Math.random() * 0.7;
        ribbons.push({
          baseY: 0.15 + t * 0.7 + (Math.random() - 0.5) * 0.08,
          amp: 70 + Math.random() * 150,
          freq: 0.6 + Math.random() * 1.3,
          phase: Math.random() * Math.PI * 2,
          speed: 0.03 + Math.random() * 0.09,
          thickness: 0.6 + depth * 2.2,
          alpha: 0.12 + depth * 0.4,
          tilt: -0.05 + Math.random() * 0.28,
          depth,
          color: tones[i % tones.length],
          hero: false,
          fadePhase: Math.random() * Math.PI * 2,
          fadeSpeed: 0.1 + Math.random() * 0.22,
        });
      }
      // far -> near so the hero beam paints on top
      ribbons.sort((a, b) => a.depth - b.depth);
    };

    const init = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    init();
    window.addEventListener("resize", init);

    const STEPS = 60;

    const drawRibbon = (ln: Ribbon, time: number, mxPx: number, myPx: number) => {
      // parallax: nearer ribbons react more to the cursor
      const par = ln.depth;
      const offX = (mouse.current.x - 0.5) * 60 * par;
      const offY = (mouse.current.y - 0.5) * 40 * par;

      // natural fade in/out
      const fade = 0.55 + 0.45 * Math.sin(time * ln.fadeSpeed + ln.fadePhase);
      const aMul = ln.hero ? 0.85 + 0.15 * Math.sin(time * 0.4) : fade;

      const pts: { x: number; y: number }[] = [];
      for (let s = 0; s <= STEPS; s++) {
        const px = (s / STEPS) * (w + 240) - 120 + offX;
        const nx = px / w;
        let py =
          ln.baseY * h +
          offY +
          ln.tilt * (px - w / 2) +
          Math.sin(nx * Math.PI * ln.freq * 2 + time * ln.speed * 6 + ln.phase) * ln.amp +
          Math.sin(nx * Math.PI * ln.freq + time * ln.speed * 3 + ln.phase * 1.7) * ln.amp * 0.4;

        // gentle cursor bend (stronger for the hero beam)
        const dx = px - mxPx;
        const sigma = ln.hero ? 420 : 300;
        const pull = Math.exp(-(dx * dx) / (2 * sigma * sigma));
        py += (myPx - py) * pull * (ln.hero ? 0.4 : 0.25) * par;

        pts.push({ x: px, y: py });
      }

      // glow passes: wide+faint -> narrow+bright (additive bloom)
      const passes = ln.hero
        ? [
            { width: ln.thickness * 14, a: aMul * 0.1 },
            { width: ln.thickness * 7, a: aMul * 0.18 },
            { width: ln.thickness * 3, a: aMul * 0.4 },
            { width: ln.thickness, a: aMul * 0.95 },
          ]
        : [
            { width: ln.thickness * 8, a: aMul * ln.alpha * 0.14 },
            { width: ln.thickness * 3.2, a: aMul * ln.alpha * 0.32 },
            { width: ln.thickness, a: aMul * ln.alpha },
          ];

      for (const pass of passes) {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let s = 1; s < pts.length - 1; s++) {
          const xc = (pts[s].x + pts[s + 1].x) / 2;
          const yc = (pts[s].y + pts[s + 1].y) / 2;
          ctx.quadraticCurveTo(pts[s].x, pts[s].y, xc, yc);
        }
        // hero core whitens at the brightest pass for that hot center
        const col =
          ln.hero && pass.a > aMul * 0.5
            ? { r: 235, g: 245, b: 255 }
            : ln.color;
        ctx.strokeStyle = rgba(col, pass.a);
        ctx.lineWidth = pass.width;
        ctx.stroke();
      }
    };

    const frame = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const time = now / 1000;

      mouse.current.x = lerp(mouse.current.x, mouse.current.tx, 0.045);
      mouse.current.y = lerp(mouse.current.y, mouse.current.ty, 0.045);
      const mxPx = mouse.current.x * w;
      const myPx = mouse.current.y * h;

      ctx.clearRect(0, 0, w, h);

      // soft radial glow, top-right corner
      const tr = ctx.createRadialGradient(w * 0.92, h * 0.08, 0, w * 0.92, h * 0.08, w * 0.55);
      tr.addColorStop(0, rgba(PALETTE.blue, 0.14));
      tr.addColorStop(1, rgba(PALETTE.blue, 0));
      ctx.fillStyle = tr;
      ctx.fillRect(0, 0, w, h);

      // faint radial glow, bottom-left corner
      const bl = ctx.createRadialGradient(w * 0.05, h * 0.95, 0, w * 0.05, h * 0.95, w * 0.45);
      bl.addColorStop(0, rgba(PALETTE.deep, 0.1));
      bl.addColorStop(1, rgba(PALETTE.deep, 0));
      ctx.fillStyle = bl;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (const ln of ribbons) drawRibbon(ln, time, mxPx, myPx);
      ctx.restore();

      if (!prefersReduced) animId = requestAnimationFrame(frame);
    };

    if (prefersReduced) {
      // render a single static frame
      frame(performance.now());
    } else {
      animId = requestAnimationFrame(frame);
    }

    return () => {
      window.removeEventListener("resize", init);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
