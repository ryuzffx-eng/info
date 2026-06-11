import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { Search, Sparkles, X, Check, Star, Loader2, Tag, Lock, Shield, Zap, Clock, ChevronRight, ExternalLink } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { CustomSelect } from "@/components/admin/ui";
import { GlassCard } from "@/components/crystal/GlassCard";
import { GlassButton } from "@/components/crystal/GlassButton";

export const Route = createFileRoute("/_public/marketplace")({
  head: () => ({ meta: [{ title: "Marketplace — Emerite Store" }, { name: "description", content: "Browse premium software products and licenses." }] }),
  component: Marketplace,
});

function Marketplace() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("Featured");
  const [active, setActive] = useState<any | null>(null);

  const { data: products = [], isLoading: isProductsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.marketplace.getProducts(),
  });

  const { data: categories = [], isLoading: isCatsLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.marketplace.getCategories(),
  });

  const isLoading = isProductsLoading || isCatsLoading;

  const catNames = useMemo(() => ["All", ...categories.map((c: any) => c.name)], [categories]);

  const list = useMemo(() => {
    let r = products.filter((p: any) =>
      (cat === "All" || p.category?.name === cat) &&
      p.name.toLowerCase().includes(q.toLowerCase())
    );
    if (sort === "Price ↑") r = [...r].sort((a, b) => a.price - b.price);
    if (sort === "Price ↓") r = [...r].sort((a, b) => b.price - a.price);
    if (sort === "Rating") r = [...r].sort((a, b) => (b.rating || 5) - (a.rating || 5));
    return r;
  }, [q, cat, sort, products]);

  const getProductColor = (id: number) => {
    const colors = [
      "from-primary/20 to-primary/10",
      "from-teal-400/20 to-cyan-500/10",
      "from-primary/20 to-primary/10",
      "from-cyan-400/20 to-primary/10",
      "from-green-400/20 to-teal-600/10"
    ];
    return colors[id % colors.length];
  };

  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-4xl font-bold sm:text-5xl">
          <span className="neon-text">Marketplace</span>
        </h1>
        <p className="mt-2 text-neutral-400">Premium software, licenses, and tools — instant delivery.</p>
      </motion.div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p, i) => (
          <motion.div key={p.id} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            onClick={() => p.status && setActive(p)}>
            <GlassCard
              hover={!!p.status}
              className={`group relative overflow-hidden ${p.status ? "cursor-pointer" : "pointer-events-none opacity-60 grayscale-[0.4]"}`}
            >

            {!p.status && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[1px]">
                <div className="bg-red-500/10 border border-red-500/20 rounded-full p-3 text-red-500 mb-2">
                  <Lock size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Temporarily Offline</span>
              </div>
            )}

            <div className={`relative h-52 bg-gradient-to-br ${getProductColor(p.id)} border-b border-white/5 flex items-center justify-center overflow-hidden`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,oklch(1_0_0_/_0.15),transparent_70%)]" />

              {p.image_url ? (
                <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <Sparkles size={56} className="text-primary/40 transition-transform duration-500 group-hover:scale-110" />
              )}

              <span className="absolute right-3 top-3 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold text-white/90 backdrop-blur-md border border-white/15 uppercase tracking-widest">{p.category?.name || "General"}</span>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold tracking-tight">{p.name}</h3>
                <div className="flex items-center gap-1 text-xs font-bold text-primary"><Star size={12} className="fill-current" />{p.rating || "5.0"}</div>
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground leading-relaxed">{p.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                <div>
                  <div className="font-display text-2xl font-bold neon-text">${p.price}</div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className={`h-1.5 w-1.5 rounded-full ${p.status ? "bg-primary animate-pulse" : "bg-red-500"}`} />
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{p.status ? "Online" : "Offline"}</div>
                  </div>
                </div>
                <button
                  disabled={!p.status}
                  className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${p.status ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-105 active:scale-95" : "bg-muted/20 text-muted-foreground cursor-not-allowed"}`}
                >
                  {p.status ? "Buy now" : "Unavailable"}
                </button>
              </div>
            </div>
            </GlassCard>
          </motion.div>
        ))}
        {list.length === 0 && (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            No products match your criteria.
          </div>
        )}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-50 flex items-center justify-center glass-overlay p-4 backdrop-blur-2xl">
            <motion.div
              initial={{ scale: 0.92, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 30, opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 350 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[900px] overflow-hidden rounded-3xl glass-strong shadow-[var(--shadow-card)]">

              {/* Close button */}
              <button
                className="absolute right-5 top-5 z-30 flex items-center justify-center h-10 w-10 rounded-2xl bg-white/10 text-white/60 hover:text-white hover:bg-white/15 backdrop-blur-xl transition-all duration-200 border border-white/12"
                onClick={() => setActive(null)}
              >
                <X size={16} />
              </button>

              <div className="grid md:grid-cols-[1fr_1.1fr]">
                {/* Left — Hero image section */}
                <div className="relative h-72 md:h-full md:min-h-[480px] overflow-hidden">
                  {active.image_url ? (
                    <motion.img
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      src={active.image_url}
                      alt={active.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className={`h-full w-full bg-gradient-to-br ${getProductColor(active.id)} flex items-center justify-center`}>
                      <Sparkles size={80} className="text-primary/30" />
                    </div>
                  )}
                  {/* Gradient overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)] via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[var(--bg-deep)]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[color-mix(in_srgb,var(--bg-deep)_80%,transparent)] via-transparent to-transparent md:hidden" />

                  {/* Category badge on image */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="absolute left-5 top-5 flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-xl px-3 py-1.5 border border-white/12"
                  >
                    <Tag size={10} className="text-primary" />
                    <span className="text-[9px] uppercase tracking-[0.2em] font-black text-primary">{active.category?.name || "General"}</span>
                  </motion.div>
                </div>

                {/* Right — Content section */}
                <div className="relative flex flex-col p-8 md:py-10 md:pr-10 md:pl-6">

                  {/* Title + Status */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <h3 className="font-display text-3xl md:text-4xl font-bold tracking-tight leading-tight">{active.name}</h3>
                    <div className="mt-3 flex items-center gap-3">
                      <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold border ${
                        active.status
                          ? "bg-primary/10 border-primary/20 text-primary"
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}>
                        <span className="relative flex h-2 w-2">
                          {active.status && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />}
                          <span className={`relative inline-flex rounded-full h-2 w-2 ${active.status ? "bg-primary" : "bg-red-500"}`} />
                        </span>
                        {active.status ? "Operational" : "Offline"}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                        <Star size={12} className="fill-current" />
                        <span>{active.rating || "5.0"}</span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Description */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 }}
                    className="mt-5 text-[13px] text-muted-foreground leading-relaxed"
                  >
                    {active.description}
                  </motion.div>

                  {/* Feature highlights */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="mt-6 grid grid-cols-3 gap-3"
                  >
                    {[
                      { icon: Shield, label: "Secure", sub: "Encrypted" },
                      { icon: Zap, label: "Fast", sub: "Instant" },
                      { icon: Clock, label: "24/7", sub: "Support" },
                    ].map((feat, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] py-4 px-2 transition-colors hover:bg-white/[0.06]">
                        <feat.icon size={18} className="text-primary/70" />
                        <span className="text-[11px] font-bold text-foreground/90">{feat.label}</span>
                        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{feat.sub}</span>
                      </div>
                    ))}
                  </motion.div>

                  {/* Spacer */}
                  <div className="flex-1 min-h-4" />

                  {/* Purchase section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.32 }}
                    className="mt-6 flex items-end justify-between gap-4 pt-6 border-t border-white/[0.06]"
                  >
                    <div>
                      <div className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground font-bold mb-1">Starting at</div>
                      <div className="font-display text-4xl md:text-5xl font-bold neon-text">${active.price}</div>
                    </div>
                    <button className="group/btn flex items-center gap-2 rounded-2xl bg-primary px-7 py-4 text-[12px] font-black text-primary-foreground shadow-[var(--shadow-neon)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_50px_rgba(16,185,129,0.35)] active:scale-95 uppercase tracking-[0.15em]">
                      Purchase
                      <ChevronRight size={14} className="transition-transform group-hover/btn:translate-x-0.5" />
                    </button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
