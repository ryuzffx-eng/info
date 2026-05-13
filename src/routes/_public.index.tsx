import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Shield, Zap, Lock, Key, Activity, ArrowRight, Sparkles, Star, MessageCircle, Loader2 } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_public/")({
  head: () => ({
    meta: [
      { title: "Emerite Store — Secure Software Marketplace" },
      { name: "description", content: "Buy premium tools, licenses, and software securely with HWID-locked delivery and real-time status." },
    ],
  }),
  component: HomePage,
});

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = Date.now(); const dur = 1400;
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / dur);
      setN(Math.floor(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    tick();
  }, [to]);
  return <span>{n.toLocaleString()}{suffix}</span>;
}

const getProductColor = (id: any) => {
  const themes = [
    "from-primary/40 to-accent/60",
    "from-accent/40 to-primary/60",
    "from-primary/50 to-primary/30",
    "from-accent/50 to-accent/30",
  ];
  const numId = typeof id === "number" ? id : parseInt(String(id)) || 0;
  return themes[numId % themes.length];
};

function HomePage() {
  const features = [
    { icon: Shield, title: "Secure Authentication", desc: "Industry-grade encryption guards every session and key." },
    { icon: Zap, title: "Instant Delivery", desc: "Get your license the moment your payment confirms." },
    { icon: Lock, title: "HWID Lock", desc: "Hardware-bound licensing prevents unauthorized sharing." },
    { icon: Key, title: "License Management", desc: "Generate, pause, reset, and revoke from one panel." },
    { icon: Activity, title: "Real-time Status", desc: "Live infrastructure metrics with incident history." },
    { icon: Sparkles, title: "Premium Support", desc: "24/7 staff ready on Discord and ticket system." },
  ];

  const { data: statsData } = useQuery({
    queryKey: ["public-stats"],
    queryFn: () => api.marketplace.getPublicStats(),
    refetchInterval: 30000,
  });

  const { data: productsData = [] } = useQuery({
    queryKey: ["trending-products"],
    queryFn: () => api.marketplace.getProducts({ featured_only: true }),
  });

  const { data: reviewsData = [] } = useQuery({
    queryKey: ["home-reviews"],
    queryFn: () => api.marketplace.getReviews(),
  });

  const stats = useMemo(() => [
    { label: "Total Users", value: statsData?.total_users || 0 },
    { label: "Total Products", value: statsData?.total_products || 0 },
    { label: "Active Licenses", value: statsData?.active_licenses || 0 },
    { label: "Online Now", value: statsData?.online_now || 0 },
  ], [statsData]);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 sm:pt-28">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-primary" /></span>
              All systems operational
            </div>
            <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
              Secure <span className="neon-text">Software</span><br/>Marketplace
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Buy premium tools, licenses, and software securely. Built for creators, resellers, and power users.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link to="/marketplace" className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-neon)] transition-transform hover:scale-[1.04]">
                Explore Marketplace <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <a href="#" className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/40 px-6 py-3 text-sm font-semibold backdrop-blur-xl transition-colors hover:border-primary/40 hover:text-primary">
                <MessageCircle size={16} /> Join Discord
              </a>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="mx-auto mt-20 grid max-w-5xl grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                className="glass-strong rounded-2xl p-5 text-center">
                <div className="font-display text-3xl font-bold neon-text"><Counter to={s.value} /></div>
                <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="text-center">
          <h2 className="text-4xl font-bold sm:text-5xl">Everything you need, <span className="neon-text">nothing you don't</span></h2>
          <p className="mt-4 text-muted-foreground">Built on a backbone trusted by thousands of operators worldwide.</p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/30 p-6 backdrop-blur-xl transition-all hover:border-primary/40 hover:shadow-[var(--shadow-glow)]">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-3xl transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div className="inline-flex rounded-xl bg-primary/10 p-3 text-primary ring-1 ring-primary/20">
                  <f.icon size={22} />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* PRODUCT SHOWCASE */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">Trending products</h2>
            <p className="mt-2 text-muted-foreground">Hand-picked from our marketplace.</p>
          </div>
          <Link to="/marketplace" className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:inline-flex">View all <ArrowRight size={14} /></Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {productsData.slice(0, 4).map((p: any, i: number) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-glow)]">
              <div className={`relative h-36 bg-gradient-to-br ${getProductColor(p.id)} flex items-center justify-center`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,oklch(1_0_0_/_0.2),transparent_70%)]" />
                <Sparkles size={48} className="text-white/90 drop-shadow-lg" />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{p.name}</h3>
                  <span className="text-[10px] uppercase font-bold text-primary">{p.status ? "Online" : "Update"}</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{p.category?.name || "General"}</div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-display text-xl font-bold">${p.price}</span>
                  <Link to="/marketplace" className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary ring-1 ring-primary/20 transition-colors hover:bg-primary hover:text-primary-foreground">Buy</Link>
                </div>
              </div>
            </motion.div>
          ))}
          {productsData.length === 0 && (
            <div className="col-span-full py-10 text-center text-muted-foreground italic text-sm">
              No products available yet.
            </div>
          )}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="text-center">
          <h2 className="text-4xl font-bold">Loved by <span className="neon-text">thousands</span></h2>
        </div>
        <div className="mt-12 overflow-hidden">
          {reviewsData.length > 0 ? (
            <motion.div className="flex gap-5" animate={{ x: [0, -1200] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
              {[...reviewsData, ...reviewsData, ...reviewsData].map((r: any, i: number) => (
                <div key={i} className="w-80 shrink-0 rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-xl">
                  <div className="flex gap-1">{Array.from({ length: r.rating || 5 }).map((_, j) => <Star key={j} size={14} className="fill-primary text-primary" />)}</div>
                  <p className="mt-3 text-sm text-foreground/90 line-clamp-3">"{r.comment || "Great product, works as expected!"}"</p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground">U{r.user_id}</div>
                    <div>
                      <div className="text-sm font-semibold">User #{r.user_id}</div>
                      <div className="text-xs text-muted-foreground">{r.product_name}</div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <div className="py-10 text-center text-muted-foreground italic">
              No reviews yet. Be the first to share your experience!
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card/40 to-accent/15 p-12 text-center backdrop-blur-xl">
          <div className="absolute inset-0 grid-bg opacity-30" />
          <div className="relative">
            <h2 className="text-3xl font-bold sm:text-4xl">Ready to ship faster?</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">Join the platform powering the next generation of software resellers.</p>
            <Link to="/login" className="mt-7 inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-neon)]">Create free account</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

