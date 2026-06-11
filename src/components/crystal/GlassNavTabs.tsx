import { Link, useLocation } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type NavTab = { to: string; label: string };

type GlassNavTabsProps = {
  tabs: NavTab[];
  className?: string;
  size?: "sm" | "md";
};

export function GlassNavTabs({ tabs, className, size = "md" }: GlassNavTabsProps) {
  const loc = useLocation();

  const isActive = (to: string) => {
    if (to === "/") return loc.pathname === "/";
    return loc.pathname === to || loc.pathname.startsWith(`${to}/`);
  };

  return (
    <nav
      className={cn(
        "glass-nav-pill inline-flex items-center gap-0.5 rounded-2xl p-1",
        size === "sm" ? "p-1" : "p-1.5",
        className,
      )}
      aria-label="Main navigation"
    >
      {tabs.map((tab) => {
        const active = isActive(tab.to);
        return (
          <Link
            key={tab.to}
            to={tab.to}
            className={cn(
              "relative rounded-xl font-medium transition-colors duration-200",
              size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="glass-nav-active"
                className="glass-nav-tab-active absolute inset-0 rounded-xl"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
