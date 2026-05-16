import { Link, useLocation } from "@tanstack/react-router";
import { Home, ShoppingBag, Activity, Star } from "lucide-react";
import { motion } from "framer-motion";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { to: "/status", label: "Status", icon: Activity },
  { to: "/reviews", label: "Reviews", icon: Star },
];

export function MobileBottomNav() {
  const loc = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 block border-t border-white/5 bg-background/80 px-2 pb-[calc(0.8rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-2xl md:hidden shadow-[0_-10px_40px_rgba(0,0,0,0.6)]">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {links.map((l) => {
          const active = loc.pathname === l.to;
          const Icon = l.icon;
          return (
            <Link
              key={l.to}
              to={l.to}
              className={`relative flex flex-col items-center gap-1.5 transition-all duration-300 ${
                active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-300">
                {active && (
                  <>
                    <motion.div
                      layoutId="active-bg"
                      className="absolute inset-0 rounded-xl bg-primary/10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute -inset-1 -z-10 rounded-2xl bg-primary/20 blur-xl"
                    />
                  </>
                )}
                <Icon 
                  size={24} 
                  strokeWidth={active ? 2.5 : 2}
                  className={`relative z-10 transition-transform duration-300 ${active ? "scale-110 text-primary" : ""}`} 
                />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${active ? "text-primary" : "text-[rgba(255,255,255,0.4)]"}`}>
                {l.label}
              </span>
              {active && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute -bottom-1 h-1 w-4 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
