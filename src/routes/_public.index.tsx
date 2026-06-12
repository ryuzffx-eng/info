import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/crystal/GlassCard";
import { GlowContainer } from "@/components/crystal/GlowContainer";
import { CrystalLogo } from "@/components/crystal/CrystalLogo";
import { Shield, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_public/")({
  head: () => ({
    meta: [
      { title: "Login — Emerite Dashboard" },
      { name: "description", content: "Sign in to access your secure developer, reseller, or client dashboard." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => api.auth.me(),
    retry: false,
  });

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate({ to: "/admin" });
      } else if (user.role === "reseller") {
        navigate({ to: "/reseller" });
      } else {
        navigate({ to: "/dashboard" });
      }
    }
  }, [user, navigate]);

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    setLoading(true);
    try {
      const res = await api.auth.googleLogin(credentialResponse.credential!);
      localStorage.setItem("access_token", res.access_token);
      localStorage.setItem("refresh_token", res.refresh_token);
      toast.success("Welcome back!");
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
    } catch (err: any) {
      toast.error(err.message || "Google authentication failed");
    } finally {
      setLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 overflow-hidden">
      {/* Background Hero Gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{ background: "var(--gradient-hero)" }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md z-10"
      >
        {/* Crystal Logo Centerpiece */}
        <GlowContainer intensity="strong" pulse className="mx-auto mb-8 flex justify-center">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <CrystalLogo size={80} glow />
          </motion.div>
        </GlowContainer>

        <GlassCard shine hover={false} className="p-8 sm:p-10 relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to access your Emerite dashboard
            </p>
          </div>

          <div className="flex justify-center py-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google Login Failed")}
              theme="filled_black"
              shape="pill"
              size="large"
              width="320"
            />
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 border-t border-white/[0.06] pt-6 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
            <Shield size={13} className="text-primary/60" />
            <span>End-to-End Encrypted</span>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
