import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

type GlassButtonProps = Omit<HTMLMotionProps<"button">, "ref"> & {
  variant?: "primary" | "glass" | "ghost" | "danger";
  size?: "xs" | "sm" | "md" | "lg";
  to?: string;
  href?: string;
};

const sizeClasses = {
  xs: "px-3 py-1.5 text-[11px] gap-1.5",
  sm: "px-4 py-2 text-xs gap-1.5",
  md: "px-6 py-2.5 text-sm gap-2",
  lg: "px-8 py-3.5 text-[15px] gap-2.5",
};

const variantClasses = {
  primary: [
    "relative font-semibold text-primary-foreground",
    "bg-gradient-brand",
    "border border-white/20",
    "shadow-[var(--shadow-glow)]",
    /* top specular sheen */
    "before:absolute before:inset-0 before:rounded-[inherit]",
    "before:bg-[linear-gradient(180deg,rgba(255,255,255,0.32)_0%,transparent_48%)]",
    "before:pointer-events-none",
    /* hover intensifies shadow */
    "hover:shadow-[0_18px_52px_-8px_color-mix(in_srgb,var(--primary)_52%,transparent)]",
    "hover:brightness-105",
  ].join(" "),
  glass: [
    "glass font-medium text-foreground",
    "hover:bg-[var(--glass-bg-hover)] hover:border-[var(--glass-border)] hover:text-foreground",
  ].join(" "),
  ghost: [
    "bg-transparent font-medium text-muted-foreground border border-transparent",
    "hover:bg-white/[0.06] hover:text-foreground hover:border-[var(--glass-border-subtle)]",
  ].join(" "),
  danger: [
    "bg-destructive/10 font-medium text-destructive border border-destructive/20",
    "hover:bg-destructive/18 hover:border-destructive/35",
  ].join(" "),
};

const baseClasses = [
  "inline-flex items-center justify-center",
  "rounded-full",
  "transition-all duration-250",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
  "disabled:pointer-events-none disabled:opacity-45",
  "overflow-hidden",
  "select-none",
].join(" ");

const motionTransition = { type: "spring" as const, stiffness: 420, damping: 28 };

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = "primary", size = "md", children, to, href, ...props }, ref) => {
    const classes = cn(baseClasses, sizeClasses[size], variantClasses[variant], className);
    const inner = <span className="relative z-10 inline-flex items-center gap-[inherit]">{children}</span>;

    if (to) {
      return (
        <Link to={to} className={classes}>
          {inner}
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
          whileHover={{ scale: 1.025 }}
          whileTap={{ scale: 0.965 }}
          transition={motionTransition}
        >
          {inner}
        </motion.a>
      );
    }

    return (
      <motion.button
        ref={ref}
        className={classes}
        whileHover={{ scale: 1.025 }}
        whileTap={{ scale: 0.965 }}
        transition={motionTransition}
        {...props}
      >
        {inner}
      </motion.button>
    );
  },
);
GlassButton.displayName = "GlassButton";
