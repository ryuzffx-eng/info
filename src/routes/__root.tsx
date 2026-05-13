import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  Link,
} from "@tanstack/react-router";
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-strong max-w-md rounded-2xl p-10 text-center">
        <h1 className="text-7xl font-bold neon-text">404</h1>
        <p className="mt-3 text-muted-foreground">This page drifted off the grid.</p>
        <Link to="/" className="mt-6 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground neon-glow">
          Back home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-strong max-w-md rounded-2xl p-10 text-center">
        <h1 className="text-2xl font-semibold">Something glitched</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >Try again</button>
      </div>
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
    links: [{ rel: "stylesheet", href: appCss }],
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
  return (
    <ThemeProvider>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <QueryClientProvider client={queryClient}>
          <Outlet />
          <Toaster theme="dark" position="top-right" richColors />
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}
