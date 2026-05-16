import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { Search, Sparkles, X, Check, Star, Loader2, Tag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

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
      "from-emerald-400/20 to-teal-500/10",
      "from-teal-400/20 to-cyan-500/10",
      "from-emerald-300/20 to-green-500/10",
      "from-cyan-400/20 to-emerald-500/10",
      "from-green-400/20 to-teal-600/10"
    ];
    return colors[id % colors.length];
  };

  if (isLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold sm:text-5xl font-display neon-text">Marketplace</h1>
        <p className="mt-3 text-muted-foreground">Premium software, instantly delivered.</p>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products..."
            className="w-full rounded-xl border border-border/60 bg-card/40 py-3 pl-11 pr-4 text-sm backdrop-blur-xl outline-none transition-colors focus:border-primary/50" />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          className="rounded-xl border border-border/60 bg-card/40 px-4 py-3 text-sm backdrop-blur-xl outline-none focus:border-primary/50">
          {["Featured", "Price ↑", "Price ↓", "Rating"].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>

      <div className="scrollbar-thin mt-5 flex gap-2 overflow-x-auto pb-2">
        {catNames.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all ${cat === c ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]" : "border border-border/60 bg-card/40 text-muted-foreground hover:text-foreground"}`}>{c}</button>
        ))}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((p, i) => (
          <motion.div key={p.id} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            onClick={() => setActive(p)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-card/40 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-neon)]">
            <div className={`relative h-44 bg-gradient-to-br ${getProductColor(p.id)} border-b border-white/5 flex items-center justify-center overflow-hidden`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,oklch(1_0_0_/_0.15),transparent_70%)]" />
              
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <Sparkles size={56} className="text-primary/40 transition-transform duration-500 group-hover:scale-110" />
              )}
              
              <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white/90 backdrop-blur-md border border-white/10 uppercase tracking-widest">{p.category?.name || "General"}</span>
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
                    <div className={`h-1.5 w-1.5 rounded-full ${p.status ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{p.status ? "Online" : "Offline"}</div>
                  </div>
                </div>
                <button className="rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:scale-105 active:scale-95">Buy now</button>
              </div>
            </div>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
              <button className="absolute right-4 top-4 z-10 rounded-xl bg-black/40 p-2 text-white/80 hover:bg-black/60 backdrop-blur-md transition-colors" onClick={() => setActive(null)}><X size={18} /></button>
              
              <div className={`h-56 bg-gradient-to-br ${getProductColor(active.id)} flex items-center justify-center overflow-hidden border-b border-white/5`}>
                {active.image_url ? (
                  <img src={active.image_url} alt={active.name} className="h-full w-full object-cover" />
                ) : (
                  <Sparkles size={80} className="text-primary/50" />
                )}
              </div>
              
              <div className="p-8">
                <div className="flex items-center gap-2 mb-1">
                  <Tag size={12} className="text-primary" />
                  <span className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/80">{active.category?.name}</span>
                </div>
                <h3 className="text-3xl font-bold tracking-tight">{active.name}</h3>
                
                <div className="mt-4 flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1 border border-white/5">
                    <div className={`h-1.5 w-1.5 rounded-full ${active.status ? "bg-emerald-500" : "bg-red-500"}`} />
                    <span className="font-bold text-muted-foreground">{active.status ? "Operational" : "Offline"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-primary font-bold">
                    <Star size={14} className="fill-current" />
                    <span>5.0 Rating</span>
                  </div>
                </div>

                <div className="mt-6 text-sm text-muted-foreground leading-relaxed bg-white/5 rounded-2xl p-4 border border-white/5">{active.description}</div>
                
                <div className="mt-8 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Starting at</div>
                    <div className="font-display text-4xl font-bold neon-text">${active.price}</div>
                  </div>
                  <button className="rounded-2xl bg-primary px-8 py-4 text-sm font-black text-primary-foreground shadow-[var(--shadow-neon)] transition-all hover:scale-105 active:scale-95 uppercase tracking-widest">Purchase License</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
