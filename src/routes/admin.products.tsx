import { createFileRoute } from "@tanstack/react-router";
import { Plus, Edit, Trash2, Sparkles, Loader2, X, PlusCircle } from "lucide-react";
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
  const [isCustomCat, setIsCustomCat] = useState(false);
  const [form, setForm] = useState({ 
    name: "", 
    price: 0, 
    description: "", 
    category_id: 1, 
    new_category_name: "" 
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => api.marketplace.getProducts(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => api.marketplace.getCategories(),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => {
      const payload = { ...data };
      if (!isCustomCat) {
        delete payload.new_category_name;
      } else {
        delete payload.category_id;
      }
      return api.marketplace.createProduct(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Product added successfully");
      setOpen(false);
      setIsCustomCat(false);
      setForm({ name: "", price: 0, description: "", category_id: 1, new_category_name: "" });
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
            <div className={`relative flex h-32 items-center justify-center bg-gradient-to-br from-emerald-400/20 to-teal-500/10 border-b border-white/5`}>
              <div className="absolute inset-0 grid-bg opacity-20" />
              <Sparkles size={36} className="text-primary/60" />
              <div className="absolute right-3 top-3">
                <Badge tone={p.status ? "primary" : "muted"}>
                  <span className="mr-1">●</span>{p.status ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold tracking-tight">{p.name}</h3>
                  <p className="text-[10px] uppercase tracking-widest text-primary/80 font-bold mt-1">
                    {p.category?.name || "General"}
                  </p>
                </div>
                <div className="font-display text-xl font-bold neon-text">${p.price}</div>
              </div>
              <div className="mt-4 flex gap-2">
                <Btn variant="outline" className="flex-1 justify-center h-9 text-xs"><Edit size={12} /> Edit</Btn>
                <Btn variant="ghost" className="h-9 w-9 p-0 flex items-center justify-center text-muted-foreground hover:text-destructive"><Trash2 size={12} /></Btn>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong w-full max-w-md rounded-2xl p-7 shadow-2xl border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold tracking-tight">Add New Product</h3>
                  <p className="text-xs text-muted-foreground">List a new software to the catalog.</p>
                </div>
                <button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-card transition-colors"><X size={16} /></button>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Premium Hub V3" 
                    className="mt-2 w-full rounded-xl border border-border/60 bg-card/40 p-3 text-sm outline-none focus:border-primary/50 transition-colors" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Price ($)</label>
                    <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })} 
                      className="mt-2 w-full rounded-xl border border-border/60 bg-card/40 p-3 text-sm outline-none focus:border-primary/50 transition-colors" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</label>
                      <button onClick={() => setIsCustomCat(!isCustomCat)} className="text-[10px] font-bold text-primary hover:underline">
                        {isCustomCat ? "Select existing" : "Create new"}
                      </button>
                    </div>
                    {isCustomCat ? (
                      <input value={form.new_category_name} onChange={(e) => setForm({ ...form, new_category_name: e.target.value })} placeholder="New Name" 
                        className="mt-2 w-full rounded-xl border border-primary/40 bg-primary/5 p-3 text-sm outline-none focus:border-primary/60 transition-colors" />
                    ) : (
                      <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: parseInt(e.target.value) })}
                        className="mt-2 w-full rounded-xl border border-border/60 bg-card/40 p-3 text-sm outline-none focus:border-primary/50 transition-colors cursor-pointer">
                        {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detailed product information..." rows={3}
                    className="mt-2 w-full rounded-xl border border-border/60 bg-card/40 p-3 text-sm outline-none focus:border-primary/50 resize-none transition-colors" />
                </div>
                
                <Btn className="w-full justify-center py-6 mt-4 shadow-neon" onClick={() => mutation.mutate(form)} disabled={mutation.isPending || !form.name}>
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
