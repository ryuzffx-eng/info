import { Logo } from "./Logo";
import { motion } from "framer-motion";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0a0a]">
      {/* Deep immersive background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{
            opacity: [0.1, 0.2, 0.1],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" 
        />
      </div>

      {/* High-end Logo Animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: [0.8, 1, 0.8],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="relative z-10"
      >
        <div className="relative">
          {/* Subtle glow layer behind logo */}
          <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full animate-pulse" />
          
          <Logo size={140} withText={false} />
        </div>
      </motion.div>
    </div>
  );
}
