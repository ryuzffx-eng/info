import { Link, useLocation } from "@tanstack/react-router";
import { Logo } from "@/components/site/Logo";
import {
  LayoutDashboard, AppWindow, Users, Key, UsersRound, Package,
  FolderOpen, Store, BarChart3, Settings, ScrollText, Bell, Menu, X, MessageCircle, ChevronDown, ExternalLink, Shield
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const userNav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { to: "/dashboard/licenses", icon: Key, label: "My Licenses" },
  { to: "/dashboard/orders", icon: ScrollText, label: "Orders" },
  { to: "/dashboard/support", icon: MessageCircle, label: "Support" },
];

const resellerNav = [
  { to: "/reseller", icon: LayoutDashboard, label: "Overview" },
  { to: "/reseller/licenses", icon: Key, label: "Licenses" },
  { to: "/reseller/users", icon: Users, label: "Users" },
  { to: "/reseller/logs", icon: ScrollText, label: "Logs" },
];

const adminDashboardNav = [
  { to: "/admin", icon: LayoutDashboard, label: "Overview" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/admin/logs", icon: ScrollText, label: "Security Logs" },
];

const adminManagement = [
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/resellers", icon: UsersRound, label: "Resellers" },
  { to: "/admin/licenses", icon: Key, label: "Licenses" },
];

const adminCatalog = [
  { to: "/admin/applications", icon: AppWindow, label: "Applications" },
  { to: "/admin/products", icon: Package, label: "Products" },
  { to: "/admin/files", icon: FolderOpen, label: "Files" },
  { to: "/admin/store-pages", icon: Store, label: "Store Pages" },
];

const adminSystem = [
  { to: "/admin/settings", icon: Settings, label: "Global Settings" },
  { to: "/docs", icon: ScrollText, label: "Documentation" },
  { to: "/support", icon: MessageCircle, label: "Support Portal" },
];

export function DashboardShell({ children, variant = "admin" }: { children: React.ReactNode; variant?: "admin" | "reseller" | "user" }) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => api.auth.me(),
    retry: false,
  });

  const isAdmin = user?.role === "admin";
  const isReseller = user?.role === "admin" || user?.role === "reseller";

  return (
    <div className="relative min-h-screen bg-[#030303] selection:bg-primary/30 selection:text-primary-foreground text-zinc-200 font-sans overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(16,185,129,0.07),transparent_70%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
        
        {/* Animated Glow Spots */}
        <motion.div 
          animate={{ 
            x: [0, 100, 0], 
            y: [0, 50, 0],
            opacity: [0.1, 0.15, 0.1]
          }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            x: [0, -80, 0], 
            y: [0, 100, 0],
            opacity: [0.05, 0.1, 0.05]
          }} 
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] -right-[5%] w-[30%] h-[50%] rounded-full bg-teal-500/5 blur-[100px]" 
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 grid-bg opacity-[0.15] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
        
        {/* Grain Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Navigation Bar */}
        <nav className="sticky top-0 z-50 w-full border-b border-white/[0.05] bg-black/40 backdrop-blur-2xl">
          <div className="mx-auto flex h-16 max-w-[1400px] items-center px-4 sm:px-6">
            <div className="flex items-center gap-6">
              <Link to="/" className="hover:opacity-80 transition-opacity pr-4">
                <Logo size={24} />
              </Link>

              {/* Main Tabs - Context Specific */}
              <div className="hidden items-center gap-1 md:flex">
                {variant === "user" && (
                  <NavTab
                    label="Dashboard"
                    items={userNav}
                    active={activeMenu === "user"}
                    onHover={() => setActiveMenu("user")}
                    onLeave={() => setActiveMenu(null)}
                  />
                )}

                {variant === "reseller" && isReseller && (
                  <NavTab
                    label="Reseller"
                    items={resellerNav}
                    active={activeMenu === "reseller"}
                    onHover={() => setActiveMenu("reseller")}
                    onLeave={() => setActiveMenu(null)}
                  />
                )}

                {variant === "admin" && isAdmin && (
                  <>
                    <NavTab
                      label="Dashboard"
                      items={adminDashboardNav}
                      active={activeMenu === "admin"}
                      onHover={() => setActiveMenu("admin")}
                      onLeave={() => setActiveMenu(null)}
                    />
                    <NavTab
                      label="Management"
                      items={adminManagement}
                      active={activeMenu === "mgmt"}
                      onHover={() => setActiveMenu("mgmt")}
                      onLeave={() => setActiveMenu(null)}
                    />
                    <NavTab
                      label="Catalog"
                      items={adminCatalog}
                      active={activeMenu === "catalog"}
                      onHover={() => setActiveMenu("catalog")}
                      onLeave={() => setActiveMenu(null)}
                    />
                    <NavTab
                      label="System"
                      items={adminSystem}
                      active={activeMenu === "system"}
                      onHover={() => setActiveMenu("system")}
                      onLeave={() => setActiveMenu(null)}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="ml-auto flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <div className="h-9 w-9 overflow-hidden rounded-full border border-white/10 ring-1 ring-white/5 group-hover:border-primary/50 transition-all cursor-pointer shadow-2xl">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt={user.username} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 text-xs font-bold text-white uppercase tracking-tighter">
                        {user?.username?.[0] || "U"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="relative flex-1 mx-auto w-full max-w-[1400px] p-6 lg:p-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

function NavTab({ label, items, active, onHover, onLeave }: any) {
  return (
    <div className="relative" onMouseEnter={onHover} onMouseLeave={onLeave}>
      <button className={`flex items-center gap-1 rounded-md px-3 py-2 text-[13px] font-semibold transition-all ${active ? "text-primary bg-primary/5" : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5"}`}>
        {label}
        <ChevronDown size={14} className={`transition-transform duration-300 opacity-40 ${active ? "rotate-180 opacity-100" : ""}`} />
      </button>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="absolute left-0 top-full pt-2"
          >
            <div className="w-[240px] overflow-hidden rounded-xl border border-white/[0.08] bg-[#0A0A0A]/95 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-3xl">
              <div className="grid gap-0.5">
                {items.map((item: any) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:bg-white/[0.04]"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/5 bg-zinc-900/80 text-zinc-500 transition-all group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary">
                      <item.icon size={14} />
                    </div>
                    <div className="text-[13px] font-semibold text-zinc-300 transition-colors group-hover:text-white">
                      {item.label}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
