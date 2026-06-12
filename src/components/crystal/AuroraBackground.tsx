import { motion } from "framer-motion";

/**
 * Animated gradient mesh — large emerald blobs slowly drift & morph behind the
 * frosted glass. Smooth, ambient, premium. No particles.
 */
export function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: "var(--bg-mesh)" }}>
      {/* Blob 1 — primary emerald, top-left sweep */}
      <motion.div
        className="absolute -left-[15%] -top-[20%] h-[70%] w-[70%] rounded-full blur-[130px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--primary) 38%, transparent) 0%, transparent 65%)",
        }}
        animate={{
          x: ["0%", "18%", "-6%", "0%"],
          y: ["0%", "12%", "20%", "0%"],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Blob 2 — neon mint, right side */}
      <motion.div
        className="absolute -right-[12%] top-[8%] h-[60%] w-[60%] rounded-full blur-[140px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--neon) 26%, transparent) 0%, transparent 65%)",
        }}
        animate={{
          x: ["0%", "-14%", "8%", "0%"],
          y: ["0%", "16%", "-8%", "0%"],
          scale: [1, 0.9, 1.18, 1],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      />

      {/* Blob 3 — accent, bottom-center */}
      <motion.div
        className="absolute left-[20%] bottom-[-25%] h-[65%] w-[65%] rounded-full blur-[150px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--accent) 30%, transparent) 0%, transparent 65%)",
        }}
        animate={{
          x: ["0%", "12%", "-10%", "0%"],
          y: ["0%", "-12%", "6%", "0%"],
          scale: [1, 1.2, 0.92, 1],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      {/* Blob 4 — faint deep emerald, center drift for fill */}
      <motion.div
        className="absolute left-[35%] top-[30%] h-[50%] w-[50%] rounded-full blur-[160px]"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--primary) 22%, transparent) 0%, transparent 70%)",
        }}
        animate={{
          x: ["0%", "-16%", "14%", "0%"],
          y: ["0%", "10%", "-14%", "0%"],
          scale: [1, 1.1, 1.05, 1],
        }}
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Frost wash to soften the whole mesh into glass */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.035)_0%,transparent_40%,rgba(255,255,255,0.018)_100%)]" />
    </div>
  );
}
