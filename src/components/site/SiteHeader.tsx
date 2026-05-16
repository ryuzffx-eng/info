import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const links = [
  { to: "/", label: "Home" },
  { to: "/marketplace", label: "Marketplace" },
  { to: "/status", label: "Status" },
  { to: "/reviews", label: "Reviews" },
];

export function SiteHeader() {
  const loc = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => api.auth.me(),
    retry: false,
  });

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    queryClient.setQueryData(["current-user"], null);
    navigate({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/"><Logo /></Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = loc.pathname === l.to;
            return (
              <Link key={l.to} to={l.to}
                className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                {active && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-lg bg-primary/10 ring-1 ring-primary/30" />}
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          {!user && !isLoading ? (
            <Link 
              to="/login" 
              className="rounded-lg bg-primary/10 border border-primary/30 px-4 py-2 text-sm font-semibold text-primary transition-all hover:bg-primary/20 active:scale-95"
            >
              Sign in
            </Link>
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="group relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-primary/30 ring-2 ring-primary/10 transition-all hover:ring-primary/30"
              >
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.username} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-brand text-xs font-bold text-white">
                    {user.username?.[0].toUpperCase()}
                  </div>
                )}
                <div className="absolute inset-0 bg-primary/0 transition-colors group-hover:bg-primary/10" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card/90 p-1 shadow-neon backdrop-blur-xl z-50"
                    >
                      <div className="px-3 py-2 border-b border-border/50 mb-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Account</div>
                        <div className="text-sm font-semibold text-foreground truncate">{user.email}</div>
                      </div>
                      {user.role === "admin" && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10 hover:text-primary"
                        >
                          <LayoutDashboard size={14} /> Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                      >
                        <LogOut size={14} /> Sign out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="h-9 w-9 animate-pulse rounded-full bg-border/50" />
          )}
        </div>
      </div>
    </header>
  );
}
