import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Shield, Zap, Lock, Key, Activity, ArrowRight, Sparkles, Star, MessageCircle, Monitor, Smartphone, Tablet, ChevronRight } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { GlassCard } from "@/components/crystal/GlassCard";
import { GlassButton } from "@/components/crystal/GlassButton";
import { GlowContainer } from "@/components/crystal/GlowContainer";
import { CrystalLogo } from "@/components/crystal/CrystalLogo";

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
    const start = Date.now();
    const dur = 1400;
    const tick = () => {
      const p = Math.min(1, (Date.now() - start) / dur);
      setN(Math.floor(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    };
    tick();
  }, [to]);
  return <span>{n.toLocaleString()}{suffix}</span>;
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
};

const platformIcon = (cat: string) => {
  const c = (cat || "").toLowerCase();
  if (c.includes("ios") || c.includes("iphone") || c.includes("ipad")) return Smartphone;
  if (c.includes("android")) return Tablet;
  return Monitor;
};

const platformLabel = (cat: string) => {
  const c = (cat || "").toLowerCase();
  if (c.includes("ios") || c.includes("iphone")) return "iOS";
  if (c.includes("android")) return "Android";
  if (c.includes("window")) return "Windows";
  return cat || "General";
};

type Product = {
  id: number;
  name: string;
  status?: boolean;
  category?: { name?: string };
  price: number;
  image_url?: string;
  tags?: string[];
};

function ProductShowcase({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState(0);

  const items = products.slice(0, 6);
  const active = items[selected] ?? null;

  if (items.length === 0) return null;

  const PlatformIcon = active ? platformIcon(active.category?.name ?? "") : Monitor;
  const label = active ? platformLabel(active.category?.name ?? "") : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="grid gap-4 lg:grid-cols-[1fr_360px]"
    >
      {/* Left — big preview */}
      <GlassCard hover={false} className="relative overflow-hidden min-h-[340px] flex flex-col justify-end p-0">
        {/* Preview image / placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        {active?.image_url ? (
          <img src={active.image_url} alt={active.name} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl scale-150" />
              <Sparkles size={64} className="relative text-primary/60" />
            </div>
          </div>
        )}

        {/* Bottom info bar */}
        <div className="relative z-10 flex items-end justify-between p-6 pt-20 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
          <div>
            {/* Category pills */}
            <div className="mb-3 flex gap-2">
              {items.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setSelected(i)}
                  className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
                    i === selected
                      ? "bg-primary text-primary-foreground"
                      : "glass text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {platformLabel(p.category?.name ?? "")}
                </button>
              ))}
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight">{active?.name}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          </div>
          <GlassButton to="/marketplace" size="lg" className="shrink-0 ml-4">
            Buy now &amp; details <ChevronRight size={16} />
          </GlassButton>
        </div>
      </GlassCard>

      {/* Right — product list */}
      <div className="flex flex-col gap-2">
        {items.map((p, i) => {
          const Icon = platformIcon(p.category?.name ?? "");
          const isActive = i === selected;
          return (
            <button
              key={p.id}
              onClick={() => setSelected(i)}
              className={`w-full text-left rounded-2xl border transition-all duration-200 flex items-center gap-3 p-3 ${
                isActive
                  ? "bg-primary/10 border-primary/30"
                  : "glass border-transparent hover:border-white/10"
              }`}
            >
              {/* Thumbnail */}
              <div className={`shrink-0 h-14 w-20 rounded-xl overflow-hidden flex items-center justify-center ${isActive ? "bg-primary/20" : "bg-white/5"}`}>
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <Sparkles size={20} className={isActive ? "text-primary" : "text-muted-foreground"} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{p.category?.name?.toUpperCase() ?? "PRODUCT"}</div>
                <div className="font-bold text-sm truncate">{p.name}</div>
                <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
                  <Icon size={10} />
                  <span>{platformLabel(p.category?.name ?? "")}</span>
                </div>
              </div>

              {/* Price */}
              <div className={`shrink-0 text-sm font-bold ${isActive ? "text-primary" : "text-foreground"}`}>
                ${p.price}
              </div>
            </button>
          );
        })}

        <Link
          to="/marketplace"
          className="mt-1 flex items-center justify-center gap-1.5 rounded-2xl glass border border-white/8 py-3 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          View all products <ArrowRight size={12} />
        </Link>
      </div>
    </motion.div>
  );
}

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
    queryFn: () => api.marketplace.getProducts(),
  });

  const { data: reviewsData = [] } = useQuery({
    queryKey: ["home-reviews"],
    queryFn: () => api.marketplace.getReviews(),
  });

  const stats = useMemo(
    () => [
      { label: "Total Users", value: statsData?.total_users || 0 },
      { label: "Total Products", value: statsData?.total_products || 0 },
      { label: "Active Licenses", value: statsData?.active_licenses || 0 },
      { label: "Online Now", value: statsData?.online_now || 0 },
    ],
    [statsData],
  );

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />

        <div className="relative mx-auto max-w-7xl px-4 pb-28 pt-16 sm:px-6 sm:pt-24">
          <motion.div {...fadeUp} className="mx-auto max-w-4xl text-center">
            {/* Crystal centerpiece */}
            <GlowContainer intensity="strong" pulse className="mx-auto mb-10 flex justify-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <CrystalLogo size={120} glow />
              </motion.div>
            </GlowContainer>

            <div className="mx-auto inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              All systems operational
            </div>

            <h1 className="mt-8 text-5xl font-extrabold leading-[1.02] tracking-tight sm:text-7xl">
              The premium <span className="neon-text">software</span>
              <br />
              marketplace
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-neutral-400">
              Emerite Store delivers secure licenses, HWID-locked delivery, and enterprise-grade infrastructure — built for resellers and power users.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <GlassButton to="/marketplace" size="lg">
                Explore Marketplace <ArrowRight size={16} />
              </GlassButton>
              <GlassButton
                href="https://discord.gg/mVvwkpAvy7"
                variant="glass"
                size="lg"
              >
                <MessageCircle size={16} /> Join Discord
              </GlassButton>
            </div>
          </motion.div>

          {/* Stats */}
          <div className="mx-auto mt-20 grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}>
                <GlassCard shine className="p-5 text-center">
                  <div className="font-display text-3xl font-bold neon-text">
                    <Counter to={s.value} />
                  </div>
                  <div className="mt-1 text-[11px] font-medium uppercase tracking-widest text-neutral-500">{s.label}</div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT SHOWCASE */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <ProductShowcase products={productsData} />
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-4 py-28 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <h2 className="text-4xl font-bold sm:text-5xl">
            Built for operators who <span className="neon-text">demand more</span>
          </h2>
          <p className="mt-4 text-neutral-400">Enterprise infrastructure. Instant delivery. Zero compromise.</p>
        </motion.div>
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <GlassCard shine className="group relative overflow-hidden p-6">
                <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/10 blur-3xl transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <div className="inline-flex rounded-xl bg-primary/10 p-3 text-primary ring-1 ring-primary/20">
                    <f.icon size={22} />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-neutral-400">{f.desc}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="mx-auto max-w-7xl px-4 py-28 sm:px-6">
        <div className="text-center">
          <h2 className="text-4xl font-bold">
            Trusted by <span className="neon-text">thousands</span>
          </h2>
        </div>
        <div className="mt-12 overflow-hidden">
          {reviewsData.length > 0 ? (
            <motion.div className="flex gap-5" animate={{ x: [0, -1200] }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}>
              {[...reviewsData, ...reviewsData, ...reviewsData].map((r: { rating?: number; comment?: string; user_id: number; product_name?: string }, i: number) => (
                <GlassCard key={i} hover={false} className="w-80 shrink-0 p-6">
                  <div className="flex gap-1">
                    {Array.from({ length: r.rating || 5 }).map((_, j) => (
                      <Star key={j} size={14} className="fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm text-neutral-300">"{r.comment || "Great product, works as expected!"}"</p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-primary-foreground">
                      U{r.user_id}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">User #{r.user_id}</div>
                      <div className="text-xs text-neutral-500">{r.product_name}</div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </motion.div>
          ) : (
            <div className="py-10 text-center italic text-neutral-500">No reviews yet. Be the first to share your experience!</div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 pb-28 sm:px-6">
        <GlassCard shine className="relative overflow-hidden p-12 text-center">
          <GlowContainer intensity="soft" className="absolute inset-0" />
          <div className="relative">
            <h2 className="text-3xl font-bold sm:text-4xl">Start building with Emerite Store</h2>
            <p className="mx-auto mt-3 max-w-xl text-neutral-400">
              Join the platform powering the next generation of software resellers.
            </p>
            <GlassButton to="/login" size="lg" className="mt-8">
              Create free account
            </GlassButton>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
