import { useEffect, useState } from "react";
import FloatingLines from "./FloatingLines";
import { useTheme } from "@/components/ThemeProvider";

/**
 * iOS 26-style static backdrop — layered light fields that frosted glass sits on.
 * Enhanced with interactive animated WebGL floating lines, cyber & glass grid overlays, and mouse glow tracker.
 */
export function CrystalBackground() {
  const { theme, themes } = useTheme();
  const activeTheme = themes[theme] || themes.emerald;

  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-black">
      {/* Base gradient mesh */}
      <div className="absolute inset-0" style={{ background: "var(--bg-mesh)" }} />

      {/* Animated Floating Lines WebGL Backdrop */}
      <div className="absolute inset-0 opacity-60 pointer-events-none">
        <FloatingLines 
          enabledWaves={["top", "middle", "bottom"]}
          lineCount={8}
          lineDistance={8}
          bendRadius={8}
          bendStrength={-2}
          interactive
          parallax={true}
          animationSpeed={1.8}
          linesGradient={["#bfdbfe", "#3b82f6", "#1e3a8a"]}
        />
      </div>


      {/* Interactive Mouse Glow: 450px radius tracking mouse coords */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: `radial-gradient(450px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.08), transparent 80%)`
        }}
      />

      {/* Primary light source — top center, wide halo */}
      <div
        className="absolute left-1/2 -top-[25%] h-[65%] w-[85%] -translate-x-1/2 rounded-[50%] opacity-60"
        style={{
          filter: "blur(110px)",
          background:
            "radial-gradient(ellipse, color-mix(in srgb, var(--primary) 18%, transparent) 0%, transparent 68%)",
        }}
      />

      {/* Secondary light — lower-left accent wash */}
      <div
        className="absolute -left-[8%] bottom-[-8%] h-[52%] w-[52%] rounded-[50%] opacity-45"
        style={{
          filter: "blur(130px)",
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--accent) 13%, transparent) 0%, transparent 68%)",
        }}
      />

      {/* Tertiary — top-right cool tone for depth */}
      <div
        className="absolute right-[-5%] top-[5%] h-[40%] w-[38%] rounded-[50%] opacity-30"
        style={{
          filter: "blur(100px)",
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--neon) 10%, transparent) 0%, transparent 65%)",
        }}
      />

      {/* Frosted vertical gradient — glass surfaces read correctly */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.022) 0%, transparent 38%, rgba(0,0,0,0.16) 100%)",
        }}
      />

      {/* Center vignette — pulls focus to content */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 85% 72% at 50% 44%, transparent 42%, color-mix(in srgb, var(--bg-deep) 50%, transparent) 100%)",
        }}
      />

      {/* Noise grain texture — very subtle */}
      <div
        className="absolute inset-0 opacity-[0.028]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />
    </div>
  );
}
