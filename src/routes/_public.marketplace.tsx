import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import {
  Sparkles, X, Star, Loader2, Tag, Lock,
  Shield, Zap, Clock, ChevronRight, User,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const Route = createFileRoute("/_public/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace — Emerite Store" },
      { name: "description", content: "Browse premium software products and licenses." },
    ],
  }),
  component: Marketplace,
});

/* ── accent palettes per product ───────────────────────── */
const GRADIENTS = [
  "from-violet-600/40 via-purple-700/30 to-indigo-800/40",
  "from-cyan-500/40 via-sky-600/30 to-blue-800/40",
  "from-emerald-500/40 via-teal-600/30 to-green-800/40",
  "from-rose-500/40 via-pink-600/30 to-red-800/40",
  "from-amber-500/40 via-orange-600/30 to-yellow-800/40",
  "from-primary/40 via-accent/30 to-teal-800/40",
];
const grad = (id: number) => GRADIENTS[id % GRADIENTS.length];

/* avatar initials color */
const AVATAR_COLORS = [
  "bg-violet-600", "bg-cyan-600", "bg-emerald-600",
  "bg-rose-600",   "bg-amber-600", "bg-primary",
];
const avatarColor = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length];

function Marketplace() {
  const [active, setActive] = useState<any | null>(null);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.marketplace.getProducts(),
  });

  const list = useMemo(() => products, [products]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">

      {/* ── Page header ──────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-10"
      >
        <h1 className="font-display text-5xl font-extrabold tracking-tight sm:text-6xl">
          <span className="neon-text">Marketplace</span>
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Premium software, licenses, and tools — instant delivery.
        </p>
      </motion.div>

      {/* ── Grid ─────────────────────────────────────────── */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((p: any, i: number) => (
          <motion.div
            key={p.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => p.status && setActive(p)}
          >
            <ProductCard p={p} />
          </motion.div>
        ))}

        {list.length === 0 && (
          <div className="col-span-full py-24 text-center">
            <Sparkles size={36} className="mx-auto mb-4 text-muted-foreground/35" />
            <p className="text-muted-foreground">No products available yet.</p>
          </div>
        )}
      </div>

      {/* ── Detail modal ─────────────────────────────────── */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-50 flex items-center justify-center glass-overlay p-4"
          >
            <motion.div
              initial={{ scale: 0.93, y: 28, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.93, y: 28, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 360 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[900px] overflow-hidden rounded-3xl glass-strong shadow-[var(--shadow-xl)]"
            >
              {/* Close */}
              <button
                onClick={() => setActive(null)}
                className="absolute right-4 top-4 z-30 flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-white/60 border border-white/12 backdrop-blur-xl transition-all hover:bg-white/16 hover:text-white"
              >
                <X size={15} />
              </button>

              <div className="grid md:grid-cols-[1fr_1.1fr]">
                {/* Image */}
                <div className="relative h-72 overflow-hidden md:h-full md:min-h-[480px]">
                  {active.image_url ? (
                    <motion.img
                      initial={{ scale: 1.08 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      src={active.image_url}
                      alt={active.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${grad(active.id)}`}>
                      <Sparkles size={80} className="text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-deep)]/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-[var(--bg-deep)]/90" />
                  <div className={`absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-white/80 backdrop-blur-xl`}>
                    <Tag size={8} />
                    {active.category?.name || "General"}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col p-7 md:py-9 md:pl-7 md:pr-9">
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                    <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">
                      {active.name}
                    </h2>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-bold ${
                        active.status ? "bg-primary/10 border-primary/25 text-primary" : "bg-red-500/10 border-red-500/25 text-red-400"
                      }`}>
                        <span className="relative flex h-1.5 w-1.5">
                          {active.status && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />}
                          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${active.status ? "bg-primary" : "bg-red-500"}`} />
                        </span>
                        {active.status ? "Operational" : "Offline"}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/12 border border-amber-500/20 px-3 py-1 text-[11px] font-bold text-amber-300">
                        <Star size={10} className="fill-current" />
                        {active.rating || "5.0"}
                      </span>
                    </div>
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.14 }}
                    className="mt-5 text-[13px] leading-relaxed text-muted-foreground"
                  >
                    {active.description || "Premium software with instant HWID-locked delivery."}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.22 }}
                    className="mt-6 grid grid-cols-3 gap-2.5"
                  >
                    {[
                      { icon: Shield, label: "Secure",  sub: "Encrypted" },
                      { icon: Zap,    label: "Instant", sub: "Delivery"  },
                      { icon: Clock,  label: "24/7",    sub: "Support"   },
                    ].map(({ icon: Icon, label, sub }, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-2 py-4 transition-colors hover:bg-white/[0.06]">
                        <Icon size={17} className="text-primary/65" />
                        <span className="text-[11px] font-bold">{label}</span>
                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground">{sub}</span>
                      </div>
                    ))}
                  </motion.div>

                  <div className="flex-1 min-h-6" />

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 flex items-end justify-between gap-4 border-t border-white/[0.07] pt-6"
                  >
                    <div>
                      <div className="mb-1 text-[9px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Starting at</div>
                      <div className="font-display text-5xl font-extrabold neon-text leading-none">${active.price}</div>
                    </div>
                    <button className="group/btn relative overflow-hidden rounded-2xl bg-gradient-brand px-7 py-4 text-[12px] font-black uppercase tracking-[0.14em] text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:scale-[1.03] hover:shadow-[0_16px_44px_-8px_color-mix(in_srgb,var(--primary)_55%,transparent)] active:scale-[0.96] before:absolute before:inset-0 before:bg-[linear-gradient(180deg,rgba(255,255,255,0.26)_0%,transparent_48%)] before:pointer-events-none">
                      <span className="relative z-10 flex items-center gap-2">
                        Purchase
                        <ChevronRight size={14} className="transition-transform group-hover/btn:translate-x-0.5" />
                      </span>
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

/* ═══════════════════════════════════════════════════════════
   PRODUCT CARD — matches reference design
   Big image · name overlay · seller row · price pill
═══════════════════════════════════════════════════════════ */
function ProductCard({ p }: { p: any }) {
  const sellerInitial = (p.seller_name || p.category?.name || "E")[0].toUpperCase();
  const sellerName    = p.seller_name || "Emerite";
  const sellerRole    = p.seller_role || "Administrator";

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-[20px] transition-all duration-300 cursor-pointer ${
        p.status
          ? "hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
          : "pointer-events-none opacity-50 grayscale-[0.5]"
      }`}
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturate))",
        WebkitBackdropFilter: "blur(var(--glass-blur)) saturate(var(--glass-saturate))",
        border: "1px solid var(--glass-border-subtle)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {/* ── Offline badge ──────────────────────────────── */}
      {!p.status && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mb-2 rounded-full border border-red-500/25 bg-red-500/12 p-3 text-red-400">
            <Lock size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-red-400">Offline</span>
        </div>
      )}

      {/* ── Thumbnail ──────────────────────────────────── */}
      <div className="relative h-[220px] overflow-hidden">
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${grad(p.id)}`}>
            <Sparkles size={48} className="text-white/25 transition-transform duration-500 group-hover:scale-110" />
          </div>
        )}

        {/* Gradient fade bottom — so name reads on top */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Rating top-right */}
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-bold text-amber-300 backdrop-blur-md border border-white/10">
          <Star size={10} className="fill-current" />
          {p.rating || "5.0"}
        </span>

        {/* Product name overlaid on image */}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-3">
          <h3 className="font-display text-[15px] font-black leading-tight tracking-tight text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
            {p.name}
          </h3>
        </div>
      </div>

      {/* ── Seller + price row ─────────────────────────── */}
      <div className="flex items-center gap-3 px-3.5 py-3">
        {/* Avatar */}
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-black text-white ${avatarColor(p.id)}`}>
          {p.image_url ? (
            <User size={13} />
          ) : (
            sellerInitial
          )}
        </div>

        {/* Name + role */}
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px] font-bold leading-tight text-foreground">
            {sellerName}
          </div>
          <div className="text-[10px] font-medium text-muted-foreground leading-tight">
            {sellerRole}
          </div>
        </div>

        {/* Price pill with arrow */}
        <button
          className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-white/[0.08] border border-white/[0.12] px-3 py-1.5 text-[13px] font-black text-foreground transition-all hover:bg-primary/15 hover:border-primary/30 hover:text-primary active:scale-95"
          onClick={(e) => e.stopPropagation()}
        >
          ${p.price}
          <ChevronRight size={13} className="text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
      </div>
    </div>
  );
}
