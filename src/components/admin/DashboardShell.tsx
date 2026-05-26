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
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview", description: "Account overview & stats" },
  { to: "/dashboard/licenses", icon: Key, label: "My Licenses", description: "Manage your active software" },
  { to: "/dashboard/orders", icon: ScrollText, label: "Orders", description: "View your purchase history" },
  { to: "/dashboard/support", icon: MessageCircle, label: "Support", description: "Get help with your products" },
];

const resellerNav = [
  { to: "/reseller", icon: LayoutDashboard, label: "Overview", description: "Reseller dashboard" },
  { to: "/reseller/licenses", icon: Key, label: "Licenses", description: "Manage customer keys" },
  { to: "/reseller/users", icon: Users, label: "Users", description: "Customer account list" },
  { to: "/reseller/bypass", icon: Shield, label: "Bypass", description: "Manage Bypass Whitelist" },
  { to: "/reseller/logs", icon: ScrollText, label: "Logs", description: "Recent reseller activity" },
];

const adminDashboardNav = [
  { to: "/admin", icon: LayoutDashboard, label: "Overview", description: "Global store analytics" },
  { to: "/admin/analytics", icon: BarChart3, label: "Analytics", description: "Deep dive sales data" },
  { to: "/admin/logs", icon: ScrollText, label: "Security Logs", description: "Monitor system events" },
];

const adminManagement = [
  { to: "/admin/users", icon: Users, label: "Users", description: "User management system" },
  { to: "/admin/resellers", icon: UsersRound, label: "Resellers", description: "Manage reseller network" },
  { to: "/admin/licenses", icon: Key, label: "Licenses", description: "Manage all license keys" },
  { to: "/admin/bypass", icon: Shield, label: "Bypass", description: "Bypass UID Whitelist" },
];

const adminCatalog = [
  { to: "/admin/applications", icon: AppWindow, label: "Applications", description: "Manage your software" },
  { to: "/admin/products", icon: Package, label: "Products", description: "Store product listings" },
  { to: "/admin/files", icon: FolderOpen, label: "Files", description: "Storage and downloads" },
  { to: "/admin/store-pages", icon: Store, label: "Store Pages", description: "Custom storefront pages" },
];

const adminSystem = [
  { to: "/admin/settings", icon: Settings, label: "Global Settings", description: "Core system configuration" },
  { to: "/docs", icon: ScrollText, label: "Documentation", description: "Developer & API guides" },
  { to: "/support", icon: MessageCircle, label: "Support Portal", description: "Admin support tickets" },
];

import { DashboardBottomNav } from "./DashboardBottomNav";

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
    <div className="relative min-h-screen bg-background selection:bg-primary/30 selection:text-primary-foreground text-foreground font-sans overflow-hidden">
      {/* Deep Atmospheric Background Glows (No bars/grid) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,var(--primary-glow),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,var(--secondary-glow),transparent_50%)]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Navigation Bar */}
        <nav className="sticky top-0 z-50 w-full border-b border-white/[0.03] bg-black/40 backdrop-blur-3xl">
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
                      <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-xs font-bold text-white uppercase tracking-tighter">
                        {user?.username?.[0] || "U"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="relative flex-1 mx-auto w-full max-w-[1400px] p-6 lg:p-10 pb-24 md:pb-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            {children}
          </motion.div>
        </main>
        
        <DashboardBottomNav variant={variant} />
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
            className="absolute left-0 top-[calc(100%+4px)] pt-3"
          >
            <div className="w-[280px] overflow-hidden rounded-xl border border-white/[0.08] bg-black/95 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-3xl">
              <div className="grid gap-0.5">
                {items.map((item: any) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="group flex items-start gap-3 rounded-lg px-3 py-3 transition-all hover:bg-white/[0.04]"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/5 bg-zinc-900/80 text-zinc-500 transition-all group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary mt-0.5">
                      <item.icon size={15} />
                    </div>
                    <div className="flex flex-col">
                      <div className="text-[13px] font-semibold text-zinc-300 transition-colors group-hover:text-white">
                        {item.label}
                      </div>
                      {item.description && (
                        <div className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">
                          {item.description}
                        </div>
                      )}
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
