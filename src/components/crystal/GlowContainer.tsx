import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type GlowContainerProps = HTMLMotionProps<"div"> & {
  intensity?: "soft" | "medium" | "strong";
  pulse?: boolean;
};

const intensityMap = {
  soft: "opacity-40 blur-[80px]",
  medium: "opacity-55 blur-[100px]",
  strong: "opacity-70 blur-[120px]",
};

export function GlowContainer({
  className,
  children,
  intensity = "medium",
  pulse = false,
  ...props
}: GlowContainerProps) {
  return (
    <motion.div className={cn("relative", className)} {...props}>
      <motion.div
        className={cn(
          "pointer-events-none absolute left-1/2 top-1/2 h-[min(100%,420px)] w-[min(100%,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary",
          intensityMap[intensity],
        )}
        animate={pulse ? { opacity: [0.35, 0.6, 0.35], scale: [0.95, 1.05, 0.95] } : undefined}
        transition={pulse ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : undefined}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
