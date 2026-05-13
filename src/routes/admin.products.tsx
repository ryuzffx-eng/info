import { createFileRoute } from "@tanstack/react-router";
import { Plus, Edit, Trash2, Sparkles, Loader2, X } from "lucide-react";
import { PageHeader, Card, Badge, Btn } from "@/components/admin/ui";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({ component: ProductsAdmin });

function ProductsAdmin() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", price: 0, description: "", category_id: 1 });

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => api.marketplace.getProducts(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => api.marketplace.getCategories(),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.marketplace.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product added successfully");
      setOpen(false);
      setForm({ name: "", price: 0, description: "", category_id: 1 });
    },
    onError: (err: any) => toast.error(err.message)
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Products" subtitle="Manage your marketplace catalog."
        action={<Btn onClick={() => setOpen(true)}><Plus size={14} /> Add product</Btn>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products?.map((p: any) => (
          <Card key={p.id} className="overflow-hidden !p-0">
            <div className={`relative flex h-32 items-center justify-center bg-gradient-to-br ${p.color || 'from-emerald-400 to-teal-500'}`}>
              <Sparkles size={36} className="text-white/90" />
              <div className="absolute right-3 top-3"><Badge tone={p.status ? "primary" : "muted"}><span className="mr-1">●</span>{p.status ? "Active" : "Inactive"}</Badge></div>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-xs text-muted-foreground">{p.category_name || "Uncategorized"}</p>
                </div>
                <div className="font-display text-xl font-bold">${p.price}</div>
              </div>
              <div className="mt-4 flex gap-2">
                <Btn variant="outline" className="flex-1 justify-center"><Edit size={12} /> Edit</Btn>
                <Btn variant="ghost"><Trash2 size={12} /></Btn>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong w-full max-w-md rounded-2xl p-7 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Add New Product</h3>
                <button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-card"><X size={16} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Product Name" 
                    className="mt-2 w-full rounded-xl border border-border/60 bg-card/40 p-3 text-sm outline-none focus:border-primary/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price ($)</label>
                    <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })} 
                      className="mt-2 w-full rounded-xl border border-border/60 bg-card/40 p-3 text-sm outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
                    <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: parseInt(e.target.value) })}
                      className="mt-2 w-full rounded-xl border border-border/60 bg-card/40 p-3 text-sm outline-none focus:border-primary/50">
                      {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Write something..." rows={3}
                    className="mt-2 w-full rounded-xl border border-border/60 bg-card/40 p-3 text-sm outline-none focus:border-primary/50 resize-none" />
                </div>
                <Btn className="w-full justify-center py-6 mt-4" onClick={() => mutation.mutate(form)} disabled={mutation.isPending || !form.name}>
                  {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : "Add Product"}
                </Btn>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
