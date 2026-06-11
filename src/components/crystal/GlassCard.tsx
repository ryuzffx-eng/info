import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type GlassCardProps = HTMLMotionProps<"div"> & {
  hover?: boolean;
  shine?: boolean;
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, hover = true, shine = false, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "glass-card rounded-2xl",
          shine && "glass-shine",
          hover && "hover:-translate-y-1 hover:border-primary/25",
          className,
        )}
        whileHover={hover ? { y: -4 } : undefined}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);
GlassCard.displayName = "GlassCard";
