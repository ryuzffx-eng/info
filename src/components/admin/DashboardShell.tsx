import { Link, useLocation } from "@tanstack/react-router";
import { Logo } from "@/components/site/Logo";
import {
  LayoutDashboard, AppWindow, Users, Key, UsersRound, Package,
  FolderOpen, Store, BarChart3, Settings, ScrollText, MessageCircle,
  ChevronDown, Shield, Monitor, Wallet,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DashboardBottomNav } from "./DashboardBottomNav";

const userNav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview", description: "Account overview & stats" },
];

const resellerDashboardNav = [
  { to: "/reseller", icon: LayoutDashboard, label: "Overview", description: "Reseller dashboard" },
  { to: "/reseller/topup", icon: Wallet, label: "Top Up", description: "Purchase credit balance" },
];

const resellerManagement = [
  { to: "/reseller/licenses", icon: Key, label: "Licenses", description: "Manage customer keys" },
  { to: "/reseller/users", icon: Users, label: "Users", description: "Customer account list" },
  { to: "/reseller/bypass", icon: Shield, label: "Bypass", description: "Manage Bypass Whitelist" },
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
  { to: "/admin/telemetry", icon: Monitor, label: "Telemetry", description: "Data from Rust Exe" },
];

const adminCatalog = [
  { to: "/admin/applications", icon: AppWindow, label: "Applications", description: "Manage your software" },
];

const adminSystem = [
  { to: "/admin/settings", icon: Settings, label: "Global Settings", description: "Core system configuration" },
  { to: "/admin/topup", icon: Wallet, label: "Topup Plans", description: "Manage reseller packages" },
];

type NavItem = { to: string; icon: React.ElementType; label: string; description?: string };

function NavTab({
  label,
  items,
  active,
  onHover,
  onLeave,
}: {
  label: string;
  items: NavItem[];
  active: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const loc = useLocation();
  const isPathActive = (targetTo: string) => {
    if (targetTo === "/admin" || targetTo === "/reseller" || targetTo === "/dashboard") {
      return loc.pathname === targetTo;
    }
    return loc.pathname === targetTo || loc.pathname.startsWith(`${targetTo}/`);
  };
  const hasActive = items.some((item) => isPathActive(item.to));

  return (
    <div className="relative" onMouseEnter={onHover} onMouseLeave={onLeave}>
      <button
        className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-semibold transition-all ${
          active || hasActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground"
        }`}
      >
        {label}
        <ChevronDown
          size={13}
          strokeWidth={2.5}
          className={`opacity-60 transition-transform duration-200 ${active ? "rotate-180 opacity-100" : ""}`}
        />
      </button>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 top-[calc(100%+6px)] z-[200] pt-1"
          >
            <div className="glass-dropdown w-[280px] overflow-hidden rounded-2xl p-1.5">
              <div className="grid gap-0.5">
                {items.map((item) => {
                  const isActive = isPathActive(item.to);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={`group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-all ${
                        isActive ? "bg-primary/10" : "hover:bg-white/[0.07]"
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-all ${
                          isActive
                            ? "border-primary/35 bg-primary/15 text-primary"
                            : "border-white/12 bg-white/[0.07] text-muted-foreground group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary"
                        }`}
                      >
                        <item.icon size={13} />
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <div
                          className={`text-[13px] font-semibold transition-colors ${
                            isActive ? "text-primary" : "text-foreground group-hover:text-primary"
                          }`}
                        >
                          {item.label}
                        </div>
                        {item.description && (
                          <div className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AvatarButton({ user }: { user?: { username?: string; avatar_url?: string } }) {
  return (
    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl border border-primary/20 ring-2 ring-primary/[0.07]">
      {user?.avatar_url ? (
        <img src={user.avatar_url} alt={user.username} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-[var(--gradient-brand)] bg-zinc-900 text-[11px] font-bold text-white uppercase">
          {user?.username?.[0] ?? "U"}
        </div>
      )}
    </div>
  );
}

export function DashboardShell({
  children,
  variant = "admin",
}: {
  children: React.ReactNode;
  variant?: "admin" | "reseller" | "user";
}) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const { data: user } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => api.auth.me(),
    retry: false,
  });

  const { data: profile } = useQuery({
    queryKey: ["reseller-profile"],
    queryFn: () => api.reseller.getProfile(),
    enabled: variant === "reseller",
  });

  const isAdmin = user?.role === "admin";
  const isReseller = user?.role === "admin" || user?.role === "reseller";

  return (
    <div className="relative min-h-screen font-sans text-foreground">
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Top nav bar */}
        <nav className="glass-nav sticky top-0 z-[100] w-full">
          <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-6 px-4 sm:px-6">
            <Link to="/" className="shrink-0 transition-opacity hover:opacity-75">
              <Logo size={22} />
            </Link>

            {/* Context tabs */}
            <div className="hidden items-center gap-0.5 md:flex">
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
                <>
                  <NavTab
                    label="Dashboard"
                    items={resellerDashboardNav}
                    active={activeMenu === "reseller-dash"}
                    onHover={() => setActiveMenu("reseller-dash")}
                    onLeave={() => setActiveMenu(null)}
                  />
                  <NavTab
                    label="Management"
                    items={resellerManagement.filter(item => {
                      if (item.to === "/reseller/users") return false;
                      if (item.to === "/reseller/bypass") {
                        return profile?.role === "admin" || profile?.permissions?.can_access_bypass;
                      }
                      return true;
                    })}
                    active={activeMenu === "reseller-mgmt"}
                    onHover={() => setActiveMenu("reseller-mgmt")}
                    onLeave={() => setActiveMenu(null)}
                  />
                </>
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

            {/* Avatar right */}
            <div className="ml-auto">
              <AvatarButton user={user} />
            </div>
          </div>
        </nav>

        {/* Page content */}
        <main className="relative mx-auto w-full max-w-[1400px] flex-1 p-5 pb-24 sm:p-8 md:pb-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
          >
            {children}
          </motion.div>
        </main>

        <DashboardBottomNav variant={variant} />
      </div>
    </div>
  );
}
