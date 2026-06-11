import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type GlassButtonProps = Omit<HTMLMotionProps<"button">, "ref"> & {
  variant?: "primary" | "glass" | "ghost";
  size?: "sm" | "md" | "lg";
  to?: string;
  href?: string;
};

const sizeClasses = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

const variantClasses = {
  primary:
    "bg-gradient-brand text-primary-foreground font-semibold shadow-[var(--shadow-glow)] hover:shadow-[var(--shadow-neon)] border border-white/10",
  glass:
    "glass text-foreground font-medium border-white/10 hover:border-primary/30 hover:text-primary hover:shadow-[var(--shadow-glow)]",
  ghost:
    "bg-transparent text-muted-foreground font-medium hover:text-foreground hover:bg-white/[0.04]",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:scale-[1.03] active:scale-[0.98]";

const motionTransition = { type: "spring" as const, stiffness: 400, damping: 25 };

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = "primary", size = "md", children, to, href, ...props }, ref) => {
    const classes = cn(baseClasses, sizeClasses[size], variantClasses[variant], className);

    if (to) {
      return (
        <Link to={to} className={classes}>
          {children}
        </Link>
      );
    }

    if (href) {
      return (
        <motion.a
          href={href}
          target="_blank"
          rel="noreferrer"
          className={classes}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          transition={motionTransition}
        >
          {children}
        </motion.a>
      );
    }

    return (
      <motion.button
        ref={ref}
        className={classes}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        transition={motionTransition}
        {...props}
      >
        {children}
      </motion.button>
    );
  },
);
GlassButton.displayName = "GlassButton";
