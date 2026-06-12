import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type GlowContainerProps = HTMLMotionProps<"div"> & {
  intensity?: "soft" | "medium" | "strong";
  pulse?: boolean;
};

/** Plain layout wrapper. Glow removed — kept for API compatibility. */
export function GlowContainer({
  className,
  children,
  intensity: _intensity,
  pulse: _pulse,
  ...props
}: GlowContainerProps) {
  return (
    <motion.div className={cn("relative", className)} {...props}>
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
