import { Link, useLocation } from "@tanstack/react-router";
import { Home, ShoppingBag, Activity, Star } from "lucide-react";
import { motion } from "framer-motion";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/marketplace", label: "Shop", icon: ShoppingBag },
  { to: "/status", label: "Status", icon: Activity },
  { to: "/reviews", label: "Reviews", icon: Star },
];

export function MobileBottomNav() {
  const loc = useLocation();

  const isActive = (to: string) => {
    if (to === "/") return loc.pathname === "/";
    return loc.pathname === to || loc.pathname.startsWith(`${to}/`);
  };

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <div className="glass-nav-pill mx-auto flex max-w-lg items-center justify-between gap-1 rounded-2xl p-1.5 shadow-[var(--shadow-glass)]">
        {links.map((l) => {
          const active = isActive(l.to);
          const Icon = l.icon;
          return (
            <Link
              key={l.to}
              to={l.to}
              className="relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 transition-colors"
            >
              {active && (
                <motion.span
                  layoutId="mobile-nav-active"
                  className="glass-nav-tab-active absolute inset-0 rounded-xl"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <Icon
                size={20}
                strokeWidth={active ? 2.5 : 2}
                className={`relative z-10 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
              />
              <span
                className={`relative z-10 text-[9px] font-semibold uppercase tracking-wider ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {l.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
