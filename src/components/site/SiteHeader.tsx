import { Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "./Logo";
import {
  LogOut, LayoutDashboard, ExternalLink, MessageSquare,
  ShieldCheck, X, ShoppingBag,
} from "lucide-react";
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

const bannerMessages = [
  { text: "Join our Discord community", url: "https://discord.gg/mVvwkpAvy7" },
  { text: "Join our Telegram channel", url: "https://t.me/EmeriteStore" },
];

function TopBanner() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % bannerMessages.length), 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex h-8 items-center justify-center overflow-hidden border-b border-primary/10 bg-primary/[0.07] px-4 text-center backdrop-blur-md">
      <AnimatePresence mode="wait">
        <motion.a
          key={index}
          href={bannerMessages[index].url}
          target="_blank"
          rel="noreferrer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-primary/80 transition-opacity hover:text-primary hover:opacity-100"
        >
          <MessageSquare size={12} />
          {bannerMessages[index].text}
          <ExternalLink size={12} />
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
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="glass-dropdown absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl p-1.5"
          >
            {/* Account row */}
            <div className="mb-1 border-b border-white/[0.07] px-3 py-2.5">
              <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                Account
              </div>
              <div className="mt-0.5 truncate text-[13px] font-semibold">{user.email}</div>
            </div>

            {user.role === "admin" && (
              <MenuLink to="/admin" icon={LayoutDashboard} label="Admin Panel" onClose={onClose} />
            )}
            {(user.role === "reseller" || user.role === "admin") && (
              <MenuLink to="/reseller" icon={LayoutDashboard} label="Reseller Panel" onClose={onClose} />
            )}
            {(user.role === "user" || user.role === "admin") && (
              <MenuLink to="/dashboard" icon={LayoutDashboard} label="Client Area" onClose={onClose} />
            )}

            <div className="mt-1 border-t border-white/[0.07] pt-1">
              <button
                onClick={onLogout}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MenuLink({
  to,
  icon: Icon,
  label,
  onClose,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  onClose: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClose}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
    >
      <Icon size={14} />
      {label}
    </Link>
  );
}

export function SiteHeader() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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
        } catch {
          /* no licenses */
        }
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Google authentication failed");
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? "glass-nav shadow-[var(--shadow-nav)]" : "glass-nav"
        }`}
      >
        <TopBanner />

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          {/* Logo */}
          <Link to="/" className="shrink-0 transition-opacity hover:opacity-80">
            <Logo />
          </Link>

          {/* Desktop: tabs + actions */}
          <div className="hidden items-center gap-2 md:flex">
            <GlassNavTabs tabs={links} />

            <div className="glass-nav-actions flex items-center gap-1.5 rounded-2xl p-1.5">
              {!user && !isLoading ? (
                <>
                  <button
                    onClick={() => setLoginModalOpen(true)}
                    className="rounded-xl px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
                  >
                    Log in
                  </button>
                  <GlassButton onClick={() => setLoginModalOpen(true)} size="sm">
                    <ShoppingBag size={13} />
                    Get Started
                  </GlassButton>
                </>
              ) : user ? (
                <div className="relative pl-0.5">
                  <AvatarButton
                    user={user}
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                  />
                  <UserMenu
                    user={user}
                    open={userMenuOpen}
                    onClose={() => setUserMenuOpen(false)}
                    onLogout={handleLogout}
                  />
                </div>
              ) : (
                <div className="h-8 w-8 animate-shimmer rounded-xl" />
              )}
            </div>
          </div>

          {/* Mobile: avatar or login */}
          <div className="flex items-center gap-2 md:hidden">
            {!user && !isLoading && (
              <GlassButton onClick={() => setLoginModalOpen(true)} size="sm">
                Log in
              </GlassButton>
            )}
            {user && (
              <div className="relative">
                <AvatarButton
                  user={user}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                />
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

      {/* Login modal */}
      <AnimatePresence>
        {loginModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-center justify-center glass-overlay p-4"
          >
            <div className="absolute inset-0" onClick={() => setLoginModalOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 18 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-sm"
            >
              <GlassCard shine hover={false} className="overflow-hidden px-8 py-10 sm:px-10 sm:py-12">
                <button
                  onClick={() => setLoginModalOpen(false)}
                  className="absolute right-4 top-4 rounded-full bg-white/[0.06] p-1.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                >
                  <X size={15} />
                </button>

                <div className="mb-7 flex justify-center">
                  <Logo size={64} stacked />
                </div>

                <div className="text-center">
                  <h1 className="font-display text-2xl font-bold tracking-tight">Welcome back</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Sign in to access your Emerite Store dashboard
                  </p>
                </div>

                <div className="mt-7 flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error("Google Login Failed")}
                    theme="filled_black"
                    shape="pill"
                    size="large"
                    width="280"
                  />
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 border-t border-white/[0.06] pt-6 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  <ShieldCheck size={13} className="text-primary/60" />
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

function AvatarButton({
  user,
  onClick,
}: {
  user: { username?: string; avatar_url?: string };
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl border border-primary/20 ring-2 ring-primary/[0.08] transition-all hover:border-primary/40 hover:ring-primary/20"
    >
      {user.avatar_url ? (
        <img src={user.avatar_url} alt={user.username} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-brand text-[11px] font-bold text-primary-foreground">
          {user.username?.[0]?.toUpperCase() ?? "U"}
        </div>
      )}
    </button>
  );
}
