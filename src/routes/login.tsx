import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Logo } from "@/components/site/Logo";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useNavigate } from "@tanstack/react-router";
import { GoogleLogin } from "@react-oauth/google";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Emerite Store" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await api.auth.googleLogin(credentialResponse.credential);
      localStorage.setItem("access_token", res.access_token);
      localStorage.setItem("refresh_token", res.refresh_token);
      toast.success("Welcome back!");
      
      if (res.role === "admin") {
        navigate({ to: "/admin" });
      } else if (res.role === "reseller") {
        navigate({ to: "/reseller" });
      } else {
        // Check if user is a buyer
        try {
          const licenses = await api.auth.myLicenses();
          if (licenses && licenses.length > 0) {
            navigate({ to: "/dashboard" });
          } else {
            navigate({ to: "/" });
          }
        } catch (e) {
          navigate({ to: "/" });
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Google authentication failed");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-6 bg-background">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute -left-48 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/15 blur-[160px] animate-pulse" />
      <div className="absolute -right-48 bottom-1/4 h-[500px] w-[500px] rounded-full bg-accent/15 blur-[160px] animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} 
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 glass-strong w-full max-w-sm rounded-2xl p-10 shadow-neon border-white/5"
      >
        <div className="mb-12 flex justify-center">
          <Logo size={32} />
        </div>
        
        <div className="flex flex-col items-center gap-6">
          <div className="w-full flex justify-center transition-transform hover:scale-[1.02]">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google Login Failed")}
              useOneTap
              theme="filled_black"
              shape="rectangular"
              size="large"
              width="280px"
            />
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-[9px] text-muted-foreground/30 font-medium tracking-widest uppercase">
            Identity Encrypted
          </p>
        </div>
      </motion.div>
    </div>
  );
}
