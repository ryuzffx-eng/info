import { Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { LogOut, LayoutDashboard, ExternalLink, MessageSquare, ShieldCheck, X, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";
import { GlassButton } from "@/components/crystal/GlassButton";
import { GlassCard } from "@/components/crystal/GlassCard";
import { GlassNavTabs } from "@/components/crystal/GlassNavTabs";

const links = [
  { to: "/", label: "Home" },
  { to: "/marketplace", label: "Marketplace" },
  { to: "/status", label: "Status" },
  { to: "/reviews", label: "Reviews" },
];

const messages = [
  { text: "Join our Discord community", url: "https://discord.gg/fZMfNARQtf" },
  { text: "Join our Telegram channel", url: "https://t.me/EmeriteStore" },
];

function TopBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % messages.length), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-9 items-center justify-center overflow-hidden border-b border-primary/10 bg-primary/10 px-4 py-2 text-center text-xs font-semibold text-primary backdrop-blur-md">
      <AnimatePresence mode="wait">
        <motion.a
          key={index}
          href={messages[index].url}
          target="_blank"
          rel="noreferrer"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <MessageSquare size={14} />
          <span>{messages[index].text}</span>
          <ExternalLink size={14} />
        </motion.a>
      </AnimatePresence>
    </div>
  );
}

function UserMenu({
  user,
  open,
  onClose,
  onLogout,
}: {
  user: { email: string; role?: string };
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className="glass-strong absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl p-1"
          >
            <div className="mb-1 border-b border-white/5 px-3 py-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Account</div>
              <div className="truncate text-sm font-semibold">{user.email}</div>
            </div>
            {user.role === "admin" && (
              <Link
                to="/admin"
                onClick={onClose}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <LayoutDashboard size={14} /> Admin Panel
              </Link>
            )}
            {(user.role === "reseller" || user.role === "admin") && (
              <Link
                to="/reseller"
                onClick={onClose}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <LayoutDashboard size={14} /> Reseller Panel
              </Link>
            )}
            {(user.role === "user" || user.role === "admin") && (
              <Link
                to="/dashboard"
                onClick={onClose}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <LayoutDashboard size={14} /> Client Area
              </Link>
            )}
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10"
            >
              <LogOut size={14} /> Sign out
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function SiteHeader() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { data: user, isLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => api.auth.me(),
    retry: false,
  });

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    queryClient.setQueryData(["current-user"], null);
    navigate({ to: "/" });
  };

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    try {
      const res = await api.auth.googleLogin(credentialResponse.credential!);
      localStorage.setItem("access_token", res.access_token);
      localStorage.setItem("refresh_token", res.refresh_token);
      toast.success("Welcome back!");
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      setLoginModalOpen(false);

      if (res.role === "admin") navigate({ to: "/admin" });
      else if (res.role === "reseller") navigate({ to: "/reseller" });
      else {
        try {
          const licenses = await api.auth.myLicenses();
          if (licenses?.length > 0) navigate({ to: "/dashboard" });
        } catch { /* no licenses */ }
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Google authentication failed");
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? "glass-nav shadow-[var(--shadow-glass)]" : "glass-nav"
        }`}
      >
        <TopBanner />

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          {/* Logo — left */}
          <Link to="/" className="shrink-0">
            <Logo />
          </Link>

          {/* Glass tab bar + actions — right (desktop) */}
          <div className="hidden items-center gap-2 md:flex">
            <GlassNavTabs tabs={links} />

            <div className="glass-nav-actions flex items-center gap-2 rounded-2xl p-1.5 pl-2">
              {!user && !isLoading ? (
                <>
                  <button
                    onClick={() => setLoginModalOpen(true)}
                    className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Login
                  </button>
                  <GlassButton onClick={() => setLoginModalOpen(true)} size="sm" className="!py-2">
                    <ShoppingBag size={14} />
                    Get Started
                  </GlassButton>
                </>
              ) : user ? (
                <div className="relative pl-1">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="group relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-primary/25 ring-2 ring-primary/10 transition-all hover:ring-primary/30"
                  >
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.username} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-brand text-xs font-bold text-primary-foreground">
                        {user.username?.[0].toUpperCase()}
                      </div>
                    )}
                  </button>

                  <UserMenu
                    user={user}
                    open={userMenuOpen}
                    onClose={() => setUserMenuOpen(false)}
                    onLogout={handleLogout}
                  />
                </div>
              ) : (
                <div className="h-9 w-9 animate-pulse rounded-xl bg-white/5" />
              )}
            </div>
          </div>

          {/* Mobile — compact CTA */}
          <div className="flex items-center gap-2 md:hidden">
            {!user && !isLoading && (
              <GlassButton onClick={() => setLoginModalOpen(true)} size="sm">
                Login
              </GlassButton>
            )}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-primary/25"
                >
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.username} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-brand text-xs font-bold text-primary-foreground">
                      {user.username?.[0].toUpperCase()}
                    </div>
                  )}
                </button>
                <UserMenu
                  user={user}
                  open={userMenuOpen}
                  onClose={() => setUserMenuOpen(false)}
                  onLogout={handleLogout}
                />
              </div>
            )}
          </div>
        </div>
      </header>

      <AnimatePresence>
        {loginModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center glass-overlay p-4 backdrop-blur-xl"
          >
            <div className="absolute inset-0" onClick={() => setLoginModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-md"
            >
              <GlassCard shine hover={false} className="overflow-hidden px-8 py-12 sm:px-12 sm:py-14">
                <button
                  onClick={() => setLoginModalOpen(false)}
                  className="absolute right-5 top-5 rounded-full bg-white/5 p-2 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                >
                  <X size={16} />
                </button>

                <div className="mb-8 flex justify-center">
                  <Logo size={72} stacked />
                </div>

                <div className="text-center">
                  <h1 className="font-display text-2xl font-bold tracking-tight">Welcome back</h1>
                  <p className="mt-2 text-sm text-muted-foreground">Sign in to access your Emerite Store dashboard</p>
                </div>

                <div className="mt-8 flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error("Google Login Failed")}
                    theme="filled_black"
                    shape="pill"
                    size="large"
                    width="280"
                  />
                </div>

                <div className="mt-10 flex items-center justify-center gap-2 border-t border-white/5 pt-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <ShieldCheck size={14} className="text-primary/60" />
                  <span>End-to-End Encrypted</span>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
