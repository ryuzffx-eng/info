import { useEffect, useRef } from "react";
import { useParallax } from "./ParallaxContext";

interface Crystal {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  vx: number;
  vy: number;
  opacity: number;
  sides: number;
}

interface Bubble {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  opacity: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function drawCrystal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  rotation: number,
  opacity: number,
  sides: number,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  const w = size * 1.2;
  const h = size;

  ctx.beginPath();
  ctx.moveTo(0, -h * 0.45);
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    const rx = i % 2 === 0 ? w * 0.5 : w * 0.35;
    ctx.lineTo(Math.cos(angle) * rx, Math.sin(angle) * h * 0.45);
  }
  ctx.closePath();

  const grad = ctx.createLinearGradient(-w * 0.5, -h * 0.5, w * 0.5, h * 0.5);
  grad.addColorStop(0, `rgba(56, 245, 183, ${opacity * 0.5})`);
  grad.addColorStop(0.5, `rgba(0, 224, 138, ${opacity * 0.25})`);
  grad.addColorStop(1, `rgba(0, 200, 120, ${opacity * 0.15})`);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.strokeStyle = `rgba(56, 245, 183, ${opacity * 0.2})`;
  ctx.lineWidth = 0.5;
  ctx.stroke();

  ctx.restore();
}

function drawBubble(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, opacity: number) {
  const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
  grad.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.12})`);
  grad.addColorStop(0.6, `rgba(0, 224, 138, ${opacity * 0.06})`);
  grad.addColorStop(1, `rgba(0, 200, 120, ${opacity * 0.02})`);

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.08})`;
  ctx.lineWidth = 0.5;
  ctx.stroke();
}

export function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const parallax = useParallax();
  const parallaxRef = useRef(parallax);
  parallaxRef.current = parallax;

  const stateRef = useRef<{ crystals: Crystal[]; bubbles: Bubble[]; particles: Particle[] }>({
    crystals: [],
    bubbles: [],
    particles: [],
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    let animId = 0;
    let lastTime = performance.now();

    const init = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      stateRef.current = {
        crystals: Array.from({ length: 14 }, () => ({
          x: rand(0, w),
          y: rand(0, h),
          size: rand(8, 22),
          rotation: rand(0, Math.PI * 2),
          rotSpeed: rand(-0.003, 0.003),
          vx: rand(-0.15, 0.15),
          vy: rand(-0.12, 0.12),
          opacity: rand(0.15, 0.45),
          sides: Math.floor(rand(5, 7)),
        })),
        bubbles: Array.from({ length: 20 }, () => ({
          x: rand(0, w),
          y: rand(0, h),
          radius: rand(12, 48),
          vx: rand(-0.08, 0.08),
          vy: rand(-0.06, 0.06),
          opacity: rand(0.2, 0.5),
        })),
        particles: Array.from({ length: 60 }, () => ({
          x: rand(0, w),
          y: rand(0, h),
          vx: rand(-0.2, 0.2),
          vy: rand(-0.2, 0.2),
          size: rand(0.5, 2),
          opacity: rand(0.1, 0.4),
        })),
      };
    };

    init();

    const onResize = () => init();
    window.addEventListener("resize", onResize);

    const animate = (now: number) => {
      const dt = Math.min((now - lastTime) / 16.67, 2);
      lastTime = now;

      const mx = (parallaxRef.current.x - 0.5) * 60;
      const my = (parallaxRef.current.y - 0.5) * 40;
      const { crystals, bubbles, particles } = stateRef.current;

      ctx.clearRect(0, 0, w, h);

      particles.forEach((p) => {
        p.x += (p.vx + mx * 0.002) * dt;
        p.y += (p.vy + my * 0.002) * dt;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x + mx * 0.15, p.y + my * 0.1, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(56, 245, 183, ${p.opacity})`;
        ctx.fill();
      });

      bubbles.forEach((b) => {
        b.x += (b.vx + mx * 0.004) * dt;
        b.y += (b.vy + my * 0.003) * dt;
        if (b.x < -b.radius) b.x = w + b.radius;
        if (b.x > w + b.radius) b.x = -b.radius;
        if (b.y < -b.radius) b.y = h + b.radius;
        if (b.y > h + b.radius) b.y = -b.radius;

        drawBubble(ctx, b.x + mx * 0.25, b.y + my * 0.2, b.radius, b.opacity);
      });

      crystals.forEach((c) => {
        c.x += (c.vx + mx * 0.006) * dt;
        c.y += (c.vy + my * 0.005) * dt;
        c.rotation += c.rotSpeed * dt;
        if (c.x < -40) c.x = w + 40;
        if (c.x > w + 40) c.x = -40;
        if (c.y < -40) c.y = h + 40;
        if (c.y > h + 40) c.y = -40;

        drawCrystal(ctx, c.x + mx * 0.35, c.y + my * 0.3, c.size, c.rotation, c.opacity, c.sides);
      });

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", onResize);
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
