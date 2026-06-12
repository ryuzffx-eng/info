import { useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { useParallax } from "./ParallaxContext";

interface Rgb {
  r: number;
  g: number;
  b: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  twinkle: number;
  twinkleSpeed: number;
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function cssToRgb(color: string): Rgb {
  if (typeof document === "undefined") return { r: 16, g: 213, b: 136 };
  const probe = document.createElement("span");
  probe.style.color = color;
  document.documentElement.appendChild(probe);
  const rgb = getComputedStyle(probe).color;
  probe.remove();
  const m = rgb.match(/[\d.]+/g);
  if (!m || m.length < 3) return { r: 16, g: 213, b: 136 };
  return { r: +m[0], g: +m[1], b: +m[2] };
}

function rgba(c: Rgb, a: number) {
  return `rgba(${c.r | 0}, ${c.g | 0}, ${c.b | 0}, ${a})`;
}

/** Soft drifting emerald particles — calm, glassy, theme-aware. */
export function MeteorParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme, themes } = useTheme();
  const activeTheme = themes[theme] || themes.emerald;
  const parallax = useParallax();
  const parallaxRef = useRef(parallax);
  parallaxRef.current = parallax;

  const colorRef = useRef<Rgb>(cssToRgb(activeTheme.primary));
  const neonRef = useRef<Rgb>(cssToRgb(activeTheme.neon));

  useEffect(() => {
    colorRef.current = cssToRgb(activeTheme.primary);
    neonRef.current = cssToRgb(activeTheme.neon);
  }, [theme, activeTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    let particles: Particle[] = [];
    let animId = 0;
    let lastTime = performance.now();

    const count = () => (w < 768 ? 28 : w < 1200 ? 44 : 60);

    const makeParticle = (): Particle => ({
      x: rand(0, w),
      y: rand(0, h),
      vx: rand(-0.12, 0.12),
      vy: rand(-0.18, -0.04), // gentle upward drift
      size: rand(0.8, 2.6),
      baseAlpha: rand(0.18, 0.55),
      twinkle: rand(0, Math.PI * 2),
      twinkleSpeed: rand(0.6, 1.8),
    });

    const init = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = Array.from({ length: count() }, makeParticle);
    };

    init();
    window.addEventListener("resize", init);

    const frame = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const time = now / 1000;

      const mx = (parallaxRef.current.x - 0.5) * 30;
      const my = (parallaxRef.current.y - 0.5) * 20;

      const color = colorRef.current;
      const neon = neonRef.current;

      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.globalCompositeOperation = "lighter";

      for (const p of particles) {
        p.x += p.vx + mx * 0.0008;
        p.y += p.vy + my * 0.0008;
        p.twinkle += p.twinkleSpeed * dt;

        // wrap around edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        const flicker = 0.65 + 0.35 * Math.sin(p.twinkle);
        const alpha = p.baseAlpha * flicker;
        const px = p.x + mx * 0.15;
        const py = p.y + my * 0.12;

        // soft halo
        const halo = ctx.createRadialGradient(px, py, 0, px, py, p.size * 6);
        halo.addColorStop(0, rgba(color, alpha * 0.5));
        halo.addColorStop(1, rgba(color, 0));
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(px, py, p.size * 6, 0, Math.PI * 2);
        ctx.fill();

        // bright core
        ctx.fillStyle = rgba(neon, Math.min(1, alpha * 1.4));
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
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
