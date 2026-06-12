import { Link, useLocation } from "@tanstack/react-router";
import { 
  LayoutDashboard, Key, ScrollText, Users, Package, Settings, MessageCircle, 
  BarChart3, Shield, UsersRound, AppWindow, FolderOpen, Store, ChevronUp, Monitor
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const userLinks = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
];

const resellerLinks = [
  { to: "/reseller", label: "Home", icon: LayoutDashboard },
  { to: "/reseller/licenses", label: "Licenses", icon: Key },
  { to: "/reseller/users", label: "Users", icon: Users },
  { to: "/reseller/bypass", label: "Bypass", icon: Shield },
  { to: "/reseller/logs", label: "Logs", icon: ScrollText },
];

const adminCategories = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [
      { to: "/admin", label: "Overview", icon: LayoutDashboard },
      { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { to: "/admin/logs", label: "Security Logs", icon: ScrollText },
    ],
  },
  {
    label: "People",
    icon: UsersRound,
    items: [
      { to: "/admin/users", label: "Users", icon: Users },
      { to: "/admin/resellers", label: "Resellers", icon: UsersRound },
      { to: "/admin/licenses", label: "Licenses", icon: Key },
      { to: "/admin/bypass", label: "Bypass", icon: Shield },
      { to: "/admin/telemetry", label: "Telemetry", icon: Monitor },
    ],
  },
  {
    label: "Catalog",
    icon: Package,
    items: [
      { to: "/admin/applications", label: "Applications", icon: AppWindow },
      { to: "/admin/files", label: "Files", icon: FolderOpen },
    ],
  },
  {
    label: "System",
    icon: Settings,
    items: [
      { to: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function DashboardBottomNav({ variant }: { variant: "admin" | "reseller" | "user" }) {
  const loc = useLocation();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Close menu on navigation
  useEffect(() => {
    setActiveCategory(null);
  }, [loc.pathname]);

  if (variant !== "admin") {
    const links = variant === "reseller" ? resellerLinks : userLinks;
    return (
      <nav className="glass-nav fixed bottom-0 left-0 right-0 z-50 block border-t border-white/10 px-2 pb-[calc(0.8rem+env(safe-area-inset-bottom))] pt-3 md:hidden shadow-[var(--shadow-glass)]">
        <div className="mx-auto flex max-w-lg items-center justify-around">
          {links.map((l) => {
            const active = loc.pathname === l.to;
            const Icon = l.icon;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`relative flex flex-col items-center gap-1.5 transition-all duration-300 ${active ? "text-primary" : "text-zinc-500"}`}
              >
                <div className="relative flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300">
                  {active && (
                    <motion.div layoutId="active-bg-dash" className="absolute inset-0 rounded-lg bg-primary/10" />
                  )}
                  <Icon size={20} className={`relative z-10 transition-transform ${active ? "text-primary scale-110" : ""}`} />
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${active ? "text-primary" : "text-zinc-600"}`}>
                  {l.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    );
  }

  return (
    <>
      <AnimatePresence>
        {activeCategory && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setActiveCategory(null)}
              className="fixed inset-0 z-40 glass-overlay backdrop-blur-sm md:hidden" 
            />
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="glass-dropdown fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-50 overflow-hidden rounded-xl p-2 md:hidden"
            >
              <div className="grid gap-0.5">
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-white/[0.03] mb-1">
                  {activeCategory} Options
                </div>
                {adminCategories.find(c => c.label === activeCategory)?.items.map((item) => {
                  const active = loc.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`group flex items-center gap-3 rounded-md px-3 py-2.5 transition-all ${active ? "bg-white/[0.04]" : "hover:bg-white/[0.04]"}`}
                    >
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-all ${active ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/[0.06] text-zinc-500"}`}>
                        <item.icon size={14} />
                      </div>
                      <div className={`text-[13px] font-semibold transition-colors ${active ? "text-white" : "text-zinc-300"}`}>
                        {item.label}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <nav className="glass-nav fixed bottom-0 left-0 right-0 z-50 block border-t border-white/10 px-2 pb-[calc(0.8rem+env(safe-area-inset-bottom))] pt-3 md:hidden shadow-[var(--shadow-glass)]">
        <div className="mx-auto flex max-w-lg items-center justify-around">
          {adminCategories.map((cat) => {
            const isCategoryActive = cat.items.some(item => loc.pathname === item.to);
            const isOpen = activeCategory === cat.label;
            const Icon = cat.icon;

            return (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(isOpen ? null : cat.label)}
                className={`relative flex flex-col items-center gap-1.5 transition-all duration-300 ${isCategoryActive || isOpen ? "text-primary" : "text-zinc-500"}`}
              >
                <div className="relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-300">
                  {(isCategoryActive || isOpen) && (
                    <>
                      <motion.div layoutId="active-bg-admin" className="absolute inset-0 rounded-lg bg-primary/5" />
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 rounded-lg bg-primary/[0.03] blur-md" />
                    </>
                  )}
                  <Icon size={22} strokeWidth={(isCategoryActive || isOpen) ? 2.5 : 2} className={`relative z-10 transition-all ${isOpen ? "rotate-6 scale-110" : ""}`} />
                  {isOpen && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="absolute -top-1 right-0">
                      <div className="flex h-4 w-4 items-center justify-center rounded-lg bg-primary text-[8px] font-black text-black">
                        <ChevronUp size={10} strokeWidth={4} />
                      </div>
                    </motion.div>
                  )}
                </div>
                <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors ${isCategoryActive || isOpen ? "text-primary" : "text-zinc-600"}`}>
                  {cat.label}
                </span>
                {isCategoryActive && (
                  <motion.div layoutId="indicator-admin" className="absolute -bottom-1 h-1 w-4 rounded-full bg-primary shadow-[0_0_15px_var(--primary)]" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
