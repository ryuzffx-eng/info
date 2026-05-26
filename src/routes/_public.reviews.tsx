import { createFileRoute } from "@tanstack/react-router";
import { Star, Plus, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { CustomSelect } from "@/components/admin/ui";

export const Route = createFileRoute("/_public/reviews")({
  head: () => ({ meta: [{ title: "Reviews — Emerite Store" }, { name: "description", content: "Real customer reviews and ratings." }] }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [productId, setProductId] = useState<number | "">("");

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews"],
    queryFn: () => api.marketplace.getReviews(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.marketplace.getProducts(),
  });

  const avg = reviews.length > 0 
    ? (reviews.reduce((a: number, r: any) => a + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0";

  const stats = [
    { label: "Average rating", value: avg, suffix: "/5" },
    { label: "Total reviews", value: reviews.length.toLocaleString() },
    { label: "Positive feedback", value: "100%" },
    { label: "Verified buyers", value: "100%" },
  ];

  const mutation = useMutation({
    mutationFn: (data: any) => api.marketplace.createReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Review submitted! Thanks for your feedback.");
      setOpen(false);
      setComment("");
    },
    onError: (err: Error) => {
      toast.error(`Failed to submit: ${err.message}`);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      toast.error("Please select a product");
      return;
    }
    mutation.mutate({
      product_id: productId,
      rating,
      comment
    });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold sm:text-5xl font-display neon-text">Customer Reviews</h1>
          <p className="mt-2 text-muted-foreground">Real feedback from real builders.</p>
        </div>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]">
          <Plus size={16} /> Add review
        </button>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-strong rounded-2xl p-5 text-center">
            <div className="font-display text-3xl font-bold neon-text">{s.value}{s.suffix || ""}</div>
            <div className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={32} />
        </div>
      )}

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r: any, i: number) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-xl transition-all hover:border-primary/40 hover:shadow-[var(--shadow-glow)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-primary-foreground">
                  {r.product_name[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold">Verified User</div>
                  <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(r.created_at))} ago</div>
                </div>
              </div>
              <div className="flex gap-0.5">{Array.from({ length: r.rating }).map((_, j) => <Star key={j} size={14} className="fill-primary text-primary" />)}</div>
            </div>
            <p className="mt-4 text-sm text-foreground/90 italic">"{r.comment}"</p>
            <div className="mt-4 inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium text-primary ring-1 ring-primary/20">{r.product_name}</div>
          </motion.div>
        ))}
        {!isLoading && reviews.length === 0 && (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            No reviews yet. Be the first to share your experience!
          </div>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-md">
            <motion.form initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()}
              onSubmit={handleSubmit}
              className="glass-strong relative w-full max-w-md rounded-2xl p-7">
              <button type="button" className="absolute right-3 top-3 rounded-lg bg-card/60 p-2 hover:bg-card" onClick={() => setOpen(false)}><X size={16} /></button>
              <h3 className="text-xl font-bold">Share your experience</h3>
              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Product</label>
                  <CustomSelect
                    value={productId ? String(productId) : ""}
                    onChange={(val) => setProductId(val ? Number(val) : "")}
                    options={[
                      { label: "Select a product...", value: "" },
                      ...products.map((p: any) => ({ label: p.name, value: String(p.id) }))
                    ]}
                    className="mt-2 w-full animate-none"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Rating</label>
                  <div className="mt-2 flex gap-1">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button" onClick={() => setRating(n)}>
                        <Star size={28} className={n <= rating ? "fill-primary text-primary" : "text-muted-foreground"} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted-foreground">Your review</label>
                  <textarea required rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tell us what you loved..."
                    className="mt-2 w-full rounded-xl border border-border/60 bg-card/40 p-3 text-sm outline-none focus:border-primary/50" />
                </div>
                <button disabled={mutation.isPending} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-neon)] flex justify-center items-center gap-2">
                  {mutation.isPending && <Loader2 size={16} className="animate-spin" />}
                  Submit review
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
