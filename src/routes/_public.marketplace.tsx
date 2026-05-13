import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import { Search, Sparkles, X, Check, Star, Loader2 } from "lucide-react";
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

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.marketplace.getProducts(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.marketplace.getCategories(),
  });

  const catNames = useMemo(() => ["All", ...categories.map((c: any) => c.name)], [categories]);

  const list = useMemo(() => {
    let r = products.filter((p: any) => 
      (cat === "All" || p.category?.name === cat) && 
      p.name.toLowerCase().includes(q.toLowerCase())
    );
    if (sort === "Price ↑") r = [...r].sort((a, b) => a.price - b.price);
    if (sort === "Price ↓") r = [...r].sort((a, b) => b.price - a.price);
    // Note: API needs to return rating, defaulting to 5 for now
    if (sort === "Rating") r = [...r].sort((a, b) => (b.rating || 5) - (a.rating || 5));
    return r;
  }, [q, cat, sort, products]);

  const getProductColor = (id: number) => {
    const colors = [
      "from-emerald-400 to-teal-500",
      "from-teal-400 to-cyan-500",
      "from-emerald-300 to-green-500",
      "from-cyan-400 to-emerald-500",
      "from-green-400 to-teal-600"
    ];
    return colors[id % colors.length];
  };

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

      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      )}

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((p, i) => (
          <motion.div key={p.id} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            onClick={() => setActive(p)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-card/40 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-neon)]">
            <div className={`relative h-40 bg-gradient-to-br ${getProductColor(p.id)} flex items-center justify-center`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,oklch(1_0_0_/_0.25),transparent_70%)]" />
              <Sparkles size={56} className="text-white/90 drop-shadow-xl" />
              <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">{p.category?.name || "General"}</span>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{p.name}</h3>
                <div className="flex items-center gap-1 text-xs"><Star size={12} className="fill-primary text-primary" />{p.rating || "5.0"}</div>
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
              <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-4">
                <div>
                  <div className="font-display text-2xl font-bold">${p.price}</div>
                  <div className="text-[10px] uppercase tracking-wider text-primary">{p.status ? "Online" : "Offline"}</div>
                </div>
                <button className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-105">Buy now</button>
              </div>
            </div>
          </motion.div>
        ))}
        {!isLoading && list.length === 0 && (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            No products match your criteria.
          </div>
        )}
      </div>

      <AnimatePresence>
        {active && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong relative w-full max-w-lg overflow-hidden rounded-2xl">
              <button className="absolute right-3 top-3 z-10 rounded-lg bg-card/60 p-2 hover:bg-card" onClick={() => setActive(null)}><X size={16} /></button>
              <div className={`h-44 bg-gradient-to-br ${getProductColor(active.id)} flex items-center justify-center`}>
                <Sparkles size={72} className="text-white drop-shadow-xl" />
              </div>
              <div className="p-7">
                <h3 className="text-2xl font-bold">{active.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{active.category?.name} • {active.status ? "Operational" : "Offline"}</p>
                <div className="mt-4 text-sm text-muted-foreground">{active.description}</div>
                <div className="mt-7 flex items-center justify-between">
                  <div className="font-display text-3xl font-bold neon-text">${active.price}</div>
                  <button className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-neon)]">Purchase License</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
