import { useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { useParallax } from "./ParallaxContext";

interface HeadParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  trailLength: number;
  headParticles: HeadParticle[];
}

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface ThemePalette {
  core: Rgb;
  aura: Rgb;
  tail: Rgb;
}

const HEAD_PARTICLE_COUNT = 12;
const TRAIL_SEGMENTS = 6;

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function cssToRgb(color: string): Rgb {
  if (typeof document === "undefined") return { r: 56, g: 245, b: 183 };
  const probe = document.createElement("span");
  probe.style.color = color;
  document.documentElement.appendChild(probe);
  const rgb = getComputedStyle(probe).color;
  probe.remove();
  const m = rgb.match(/[\d.]+/g);
  if (!m || m.length < 3) return { r: 255, g: 255, b: 255 };
  return { r: +m[0], g: +m[1], b: +m[2] };
}

function rgba(c: Rgb, a: number) {
  return `rgba(${c.r | 0}, ${c.g | 0}, ${c.b | 0}, ${a})`;
}

function lerpRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  };
}

function buildPalette(colors: { primary: string; accent: string; neon: string }): ThemePalette {
  return {
    core: cssToRgb("#ffffff"),
    aura: cssToRgb(colors.neon || colors.primary),
    tail: cssToRgb(colors.accent),
  };
}

function spawnMeteor(w: number, h: number, fromEdge = false): Meteor {
  const x =
    fromEdge && Math.random() > 0.4
      ? rand(-w * 0.15, w * 0.85)
      : fromEdge
        ? -200
        : rand(-w * 0.25, w * 1.25);
  const y =
    fromEdge && Math.random() > 0.4
      ? -200
      : fromEdge
        ? rand(-h * 0.15, h * 0.85)
        : rand(-h * 0.25, h * 1.25);

  const speed = rand(180, 420);
  const angleJitter = (Math.random() - 0.5) * 0.12;
  const size = rand(1.8, 4.2);

  return {
    x,
    y,
    vx: speed,
    vy: speed * (0.72 + angleJitter),
    size,
    trailLength: size * rand(14, 28),
    headParticles: Array.from({ length: HEAD_PARTICLE_COUNT }, () => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 0,
      size: 0,
    })),
  };
}

function resetMeteor(m: Meteor, w: number, h: number) {
  const fresh = spawnMeteor(w, h, true);
  Object.assign(m, {
    x: fresh.x,
    y: fresh.y,
    vx: fresh.vx,
    vy: fresh.vy,
    size: fresh.size,
    trailLength: fresh.trailLength,
  });
  for (const p of m.headParticles) p.life = 0;
}

function edgeAlpha(x: number, y: number, w: number, h: number, margin: number) {
  let a = 1;
  if (x < margin) a = Math.min(a, x / margin);
  if (y < margin) a = Math.min(a, y / margin);
  if (x > w - margin) a = Math.min(a, (w - x) / margin);
  if (y > h - margin) a = Math.min(a, (h - y) / margin);
  return clamp(a, 0, 1);
}

function drawMeteor(
  ctx: CanvasRenderingContext2D,
  m: Meteor,
  palette: ThemePalette,
  masterAlpha: number,
  time: number,
  dt: number,
  offsetX: number,
  offsetY: number,
) {
  if (masterAlpha <= 0) return;

  const px = m.x + offsetX;
  const py = m.y + offsetY;
  const speed = Math.hypot(m.vx, m.vy) || 1;
  const dirX = m.vx / speed;
  const dirY = m.vy / speed;

  // Glowing trail
  for (let s = 0; s < TRAIL_SEGMENTS; s++) {
    const tStart = s / TRAIL_SEGMENTS;
    const tEnd = (s + 1) / TRAIL_SEGMENTS;

    const x1 = px - dirX * m.trailLength * tStart;
    const y1 = py - dirY * m.trailLength * tStart;
    const x2 = px - dirX * m.trailLength * tEnd;
    const y2 = py - dirY * m.trailLength * tEnd;

    const thickness = m.size * (1 - tStart) * 0.75 + 0.4;

    let alpha: number;
    let rgb: Rgb;
    if (s === 0) {
      rgb = palette.aura;
      alpha = masterAlpha * 0.85;
    } else {
      const fadeT = 1 - tStart;
      const fade = fadeT * fadeT;
      rgb = lerpRgb(palette.aura, palette.tail, 1 - fade);
      alpha = masterAlpha * fade * 0.7;
    }

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = rgba(rgb, alpha);
    ctx.lineWidth = thickness;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  // Spark burst at meteor head
  for (const part of m.headParticles) {
    if (part.life <= 0) {
      part.x = px;
      part.y = py;
      const explodeSpeed = rand(25, 70);
      const angle = Math.random() * Math.PI * 2;
      part.vx = Math.cos(angle) * explodeSpeed + m.vx * 0.08;
      part.vy = Math.sin(angle) * explodeSpeed + m.vy * 0.08;
      part.maxLife = rand(0.18, 0.42);
      part.life = part.maxLife;
      part.size = m.size * rand(0.25, 0.55);
    }

    part.life -= dt;
    part.x += part.vx * dt;
    part.y += part.vy * dt;

    const pt = clamp(part.life / part.maxLife, 0, 1);
    if (pt > 0) {
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.size * pt, 0, Math.PI * 2);
      ctx.fillStyle = rgba(palette.aura, masterAlpha * pt * 0.65);
      ctx.fill();
    }
  }

  // Head layers: aura halo, bright core, pulse
  ctx.beginPath();
  ctx.arc(px, py, m.size * 1.6, 0, Math.PI * 2);
  ctx.fillStyle = rgba(palette.aura, masterAlpha * 0.55);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(px, py, m.size * 0.65, 0, Math.PI * 2);
  ctx.fillStyle = rgba(palette.core, masterAlpha * 0.95);
  ctx.fill();

  const pulse = 0.5 + 0.5 * Math.sin(time * 10);
  ctx.beginPath();
  ctx.arc(px, py, m.size * (0.65 + 0.35 * pulse), 0, Math.PI * 2);
  ctx.fillStyle = rgba(palette.core, masterAlpha * 0.28);
  ctx.fill();
}

/** Diagonal meteor streaks with glowing trails — theme-aware */
export function MeteorParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme, themes } = useTheme();
  const activeTheme = themes[theme] || themes.emerald;
  const parallax = useParallax();
  const parallaxRef = useRef(parallax);
  parallaxRef.current = parallax;
  const paletteRef = useRef<ThemePalette>(buildPalette(activeTheme));

  useEffect(() => {
    paletteRef.current = buildPalette(activeTheme);
  }, [theme, activeTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    let meteors: Meteor[] = [];
    let animId = 0;
    let lastTime = performance.now();
    const fadeMargin = 150;
    const resetBuffer = 200;

    const meteorCount = () => (w < 768 ? 12 : w < 1200 ? 16 : 20);

    const init = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      meteors = Array.from({ length: meteorCount() }, () => spawnMeteor(w, h));
    };

    init();
    window.addEventListener("resize", init);

    const frame = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const time = now / 1000;
      const palette = paletteRef.current;

      const mx = (parallaxRef.current.x - 0.5) * 24;
      const my = (parallaxRef.current.y - 0.5) * 16;

      ctx.clearRect(0, 0, w, h);

      const primary = activeTheme.primary;
      const bloom = ctx.createRadialGradient(w * 0.5 + mx, h * 0.35 + my, 0, w * 0.5 + mx, h * 0.35 + my, w * 0.45);
      bloom.addColorStop(0, rgba(cssToRgb(primary), 0.06));
      bloom.addColorStop(1, "transparent");
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, w, h);

      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      for (const m of meteors) {
        m.x += m.vx * dt;
        m.y += m.vy * dt;

        if (m.x > w + resetBuffer || m.y > h + resetBuffer) {
          resetMeteor(m, w, h);
        }

        const alpha = edgeAlpha(m.x, m.y, w, h, fadeMargin);
        drawMeteor(ctx, m, palette, alpha, time, dt, mx * 0.4, my * 0.35);
      }

      ctx.restore();

      animId = requestAnimationFrame(frame);
    };

    animId = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener("resize", init);
      cancelAnimationFrame(animId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden
    />
  );
}
