import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import appCss from "../styles.css?url";
import logoPng from "@/assets/logo.png";
import { LoadingScreen } from "@/components/site/LoadingScreen";
import { CrystalBackground } from "@/components/crystal/CrystalBackground";
import { GlassButton } from "@/components/crystal/GlassButton";
import { GlassCard } from "@/components/crystal/GlassCard";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <GlassCard className="max-w-md p-10 text-center" hover={false}>
        <h1 className="text-7xl font-bold neon-text">404</h1>
        <p className="mt-3 text-muted-foreground">This page drifted off the grid.</p>
        <GlassButton to="/" className="mt-6" size="md">
          Back home
        </GlassButton>
      </GlassCard>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <GlassCard className="max-w-md p-10 text-center" hover={false}>
        <h1 className="text-2xl font-semibold">Something glitched</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <GlassButton
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6"
        >
          Try again
        </GlassButton>
      </GlassCard>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Emerite Store — Secure Software Marketplace" },
      { name: "description", content: "Premium software marketplace with HWID-locked licenses, instant delivery, and real-time status." },
      { property: "og:title", content: "Emerite Store" },
      { property: "og:description", content: "Secure software marketplace, licenses, and tools." },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: logoPng, type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

import { ThemeProvider } from "@/components/ThemeProvider";

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [isInitialLoading, setIsInitialLoading] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("emerite_has_visited") !== "true";
    }
    return true;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const visited = localStorage.getItem("emerite_has_visited") === "true";
      if (visited) {
        document.body.classList.add("no-loader", "no-entrance-animations");
      }
    }
  }, []);

  useEffect(() => {
    if (isInitialLoading) {
      const timer = setTimeout(() => {
        setIsInitialLoading(false);
        localStorage.setItem("emerite_has_visited", "true");
      }, 2700); // 2.7s logoEntrance duration
      return () => clearTimeout(timer);
    }
  }, [isInitialLoading]);

  return (
    <ThemeProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <QueryClientProvider client={queryClient}>
          {isInitialLoading ? (
            <LoadingScreen />
          ) : (
            <>
              <CrystalBackground />
              <Outlet />
            </>
          )}
          <Toaster theme="dark" position="top-right" richColors />
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}
