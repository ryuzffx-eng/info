import { motion } from "framer-motion";
import { useParallax } from "./ParallaxContext";

export function AuroraBackground() {
  const { x, y } = useParallax();
  const px = (x - 0.5) * 50;
  const py = (y - 0.5) * 35;

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "var(--bg-mesh)" }}>
      {/* Luminous aurora blobs */}
      <motion.div
        className="absolute -left-[25%] top-[5%] h-[60%] w-[75%] rounded-full blur-[110px]"
        style={{
          background: "radial-gradient(ellipse, var(--primary-glow) 0%, transparent 68%)",
          transform: `translate(${px * 0.7}px, ${py * 0.5}px)`,
        }}
        animate={{ opacity: [0.55, 0.85, 0.55], scale: [1, 1.08, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute -right-[20%] top-[15%] h-[55%] w-[70%] rounded-full blur-[100px]"
        style={{
          background: "radial-gradient(ellipse, var(--accent-glow) 0%, transparent 62%)",
          transform: `translate(${-px * 0.55}px, ${py * 0.35}px)`,
        }}
        animate={{ opacity: [0.45, 0.7, 0.45] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
      />

      <motion.div
        className="absolute left-[20%] bottom-[10%] h-[45%] w-[60%] rounded-full blur-[90px]"
        style={{
          background: "radial-gradient(ellipse, color-mix(in srgb, var(--neon) 16%, transparent) 0%, transparent 65%)",
          transform: `translate(${px * 0.3}px, ${-py * 0.4}px)`,
        }}
        animate={{ opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />

      {/* Glass frost layer */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,transparent_30%,rgba(255,255,255,0.02)_100%)]" />
    </div>
  );
}
