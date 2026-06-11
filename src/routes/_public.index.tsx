import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Shield, Zap, Lock, Key, Activity, ArrowRight, Sparkles, Star, MessageCircle } from "lucide-react";
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

const getProductColor = (id: unknown) => {
  const themes = [
    "from-primary/30 to-accent/10",
    "from-accent/25 to-neon/10",
    "from-primary/35 to-primary/15",
    "from-neon/20 to-primary/15",
  ];
  const numId = typeof id === "number" ? id : parseInt(String(id)) || 0;
  return themes[numId % themes.length];
};

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
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
                href="https://discord.gg/fZMfNARQtf"
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

      {/* PRODUCTS */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold sm:text-4xl">Trending products</h2>
            <p className="mt-2 text-neutral-400">Hand-picked from our marketplace.</p>
          </div>
          <Link to="/marketplace" className="hidden items-center gap-1 text-sm font-medium text-primary hover:text-neon sm:inline-flex">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {productsData.slice(0, 4).map((p: { id: number; name: string; status?: boolean; category?: { name?: string }; price: number }, i: number) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <GlassCard className="group overflow-hidden">
                <div className={`relative flex h-36 items-center justify-center bg-gradient-to-br ${getProductColor(p.id)}`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.12),transparent_70%)]" />
                  <Sparkles size={44} className="text-neon/80 drop-shadow-lg" />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{p.name}</h3>
                    <span className="text-[10px] font-bold uppercase text-primary">{p.status ? "Online" : "Update"}</span>
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">{p.category?.name || "General"}</div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-display text-xl font-bold neon-text">${p.price}</span>
                    <GlassButton to="/marketplace" size="sm" variant="glass">Buy</GlassButton>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
          {productsData.length === 0 && (
            <div className="col-span-full py-10 text-center text-sm italic text-neutral-500">No products available yet.</div>
          )}
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
