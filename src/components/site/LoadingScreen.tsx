import { Logo } from "./Logo";
import { motion } from "framer-motion";
import { CrystalBackground } from "@/components/crystal/CrystalBackground";
import { GlowContainer } from "@/components/crystal/GlowContainer";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--bg-deep)]">
      <CrystalBackground />

      <div className="relative z-10 flex flex-col items-center gap-8 animate-logo-entrance">
        <GlowContainer intensity="strong" pulse>
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Logo size={100} withText={false} hero />
          </motion.div>
        </GlowContainer>

        <div className="text-center">
          <p className="font-display text-xl font-bold tracking-tight">Emerite Store</p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-neutral-500">Loading</p>
        </div>
      </div>
    </div>
  );
}
