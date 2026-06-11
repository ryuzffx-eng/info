import { createFileRoute } from "@tanstack/react-router";
import { Plus, Edit, Trash2, Sparkles, Loader2, X, PlusCircle, Image as ImageIcon, Tag, ChevronDown, CheckCircle2 } from "lucide-react";
import { PageHeader, Card, Badge, Btn, ConfirmModal } from "@/components/admin/ui";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/products")({ component: ProductsAdmin });

function ProductsAdmin() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [isCustomCat, setIsCustomCat] = useState(false);
  const [isCatSelectOpen, setIsCatSelectOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({ 
    name: "", 
    price: 0, 
    description: "", 
    category_id: 1, 
    new_category_name: "",
    image_url: "",
    status: true
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => api.marketplace.getProducts(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => api.marketplace.getCategories(),
  });

  // Populate form when editing
  useEffect(() => {
    if (editProduct) {
      setForm({
        name: editProduct.name,
        price: editProduct.price,
        description: editProduct.description,
        category_id: editProduct.category_id,
        new_category_name: "",
        image_url: editProduct.image_url || "",
        status: editProduct.status
      });
      setIsCustomCat(false);
    } else {
      setForm({ name: "", price: 0, description: "", category_id: categories[0]?.id || 1, new_category_name: "", image_url: "", status: true });
    }
  }, [editProduct, categories]);

  const mutation = useMutation({
    mutationFn: (data: any) => {
      const payload = { ...data };
      if (editProduct) {
        delete payload.new_category_name;
        return api.marketplace.updateProduct(editProduct.id, payload);
      }
      
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
      toast.success(editProduct ? "Product updated" : "Product added");
      setOpen(false);
      setEditProduct(null);
      setIsCustomCat(false);
      setIsCatSelectOpen(false);
    },
    onError: (err: any) => toast.error(err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.marketplace.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product deleted");
      setDeleteId(null);
    },
    onError: (err: any) => toast.error(err.message)
  });

  const handleOpen = (product?: any) => {
    setEditProduct(product || null);
    setOpen(true);
  };

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
        action={<Btn onClick={() => handleOpen()}><Plus size={14} /> Add product</Btn>} />
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products?.map((p: any) => (
          <Card key={p.id} className="overflow-hidden !p-0 group">
            <div className={`relative flex h-40 items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 border-b border-white/5 overflow-hidden`}>
              <div className="absolute inset-0 grid-bg opacity-20" />
              {p.image_url ? (
                <img src={p.image_url} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
              ) : (
                <Sparkles size={48} className="text-primary/60 group-hover:scale-110 transition-transform duration-500" />
              )}
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
                  <div className="flex items-center gap-1.5 mt-1">
                    <Tag size={10} className="text-primary" />
                    <p className="text-[10px] uppercase tracking-widest text-primary/80 font-bold">
                      {p.category?.name || "General"}
                    </p>
                  </div>
                </div>
                <div className="font-display text-xl font-bold neon-text">${p.price}</div>
              </div>
              <div className="mt-4 flex gap-2">
                <Btn variant="outline" className="flex-1 justify-center h-9 text-xs" onClick={() => handleOpen(p)}><Edit size={12} /> Edit</Btn>
                <Btn 
                  variant="ghost" 
                  className="h-9 w-9 p-0 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                  onClick={() => setDeleteId(p.id)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending && deleteId === p.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                </Btn>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation */}
      <ConfirmModal 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Product"
        message="Are you sure you want to remove this product? this action cannot be undone."
        loading={deleteMutation.isPending}
      />

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong w-full max-w-md rounded-2xl p-7 shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto scrollbar-none">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold tracking-tight">{editProduct ? "Edit Product" : "Add New Product"}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{editProduct ? `Modifying ${editProduct.name}` : "List a new software to the catalog."}</p>
                </div>
                <button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-card transition-colors"><X size={16} /></button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Product Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Premium Hub V3" 
                    className="w-full rounded-xl border border-border/60 bg-card/40 p-3.5 text-sm outline-none focus:border-primary/50 transition-colors" />
                </div>
                
                <div className={`grid grid-cols-2 gap-5 ${isCatSelectOpen ? "relative z-30" : ""}`}>
                  <div className="flex flex-col">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground h-4 mb-2">Price ($)</label>
                    <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })} 
                      className="w-full rounded-xl border border-border/60 bg-card/40 p-3.5 text-sm outline-none focus:border-primary/50 transition-colors h-[46px]" />
                  </div>
                  <div className={`flex flex-col relative ${isCatSelectOpen ? "z-30" : ""}`}>
                    <div className="flex items-center justify-between h-4 mb-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Category</label>
                      {!editProduct && (
                        <button onClick={() => setIsCustomCat(!isCustomCat)} className="text-[10px] font-bold text-primary hover:underline transition-all">
                          {isCustomCat ? "Use Existing" : "Create New"}
                        </button>
                      )}
                    </div>
                    {isCustomCat ? (
                      <input value={form.new_category_name} onChange={(e) => setForm({ ...form, new_category_name: e.target.value })} placeholder="Category Name" 
                        className="w-full rounded-xl border border-primary/40 bg-primary/5 p-3.5 text-sm outline-none focus:border-primary/60 transition-colors h-[46px]" />
                    ) : (
                      <>
                        <button
                          onClick={() => setIsCatSelectOpen(!isCatSelectOpen)}
                          className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-card/40 p-3.5 text-sm transition-all focus:border-primary/50 h-[46px] text-left"
                        >
                          <span className="truncate">{categories.find(c => c.id === form.category_id)?.name || "Select Category"}</span>
                          <ChevronDown size={14} className={`transition-transform duration-300 ${isCatSelectOpen ? "rotate-180" : ""}`} />
                        </button>
                        <AnimatePresence>
                          {isCatSelectOpen && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setIsCatSelectOpen(false)} />
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="glass-dropdown absolute left-0 top-[calc(100%+8px)] z-20 w-full overflow-hidden rounded-xl p-1.5"
                              >
                                {categories.map(c => (
                                  <button
                                    key={c.id}
                                    onClick={() => {
                                      setForm({ ...form, category_id: c.id });
                                      setIsCatSelectOpen(false);
                                    }}
                                    className={`flex w-full items-center rounded-lg px-3 py-2.5 text-sm transition-all ${form.category_id === c.id ? "bg-primary/20 text-primary font-bold" : "hover:bg-card text-muted-foreground hover:text-foreground"}`}
                                  >
                                    {c.name}
                                  </button>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Image URL (Optional)</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                        <ImageIcon size={14} />
                      </div>
                      <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." 
                        className="w-full rounded-xl border border-border/60 bg-card/40 py-3.5 pl-11 pr-4 text-sm outline-none focus:border-primary/50 transition-colors h-[46px]" />
                    </div>
                  </div>
                  <div className="col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Product Status</label>
                    <button 
                      onClick={() => setForm({ ...form, status: !form.status })}
                      className={`flex w-full items-center justify-between rounded-xl border p-3.5 text-sm transition-all h-[46px] ${form.status ? "border-primary/40 bg-primary/5 text-primary" : "border-red-500/40 bg-red-500/5 text-red-400"}`}
                    >
                      <span className="font-bold">{form.status ? "ACTIVE" : "INACTIVE"}</span>
                      <CheckCircle2 size={16} className={form.status ? "opacity-100" : "opacity-20"} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-2">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What does this product do?" rows={3}
                    className="w-full rounded-xl border border-border/60 bg-card/40 p-3.5 text-sm outline-none focus:border-primary/50 resize-none transition-colors" />
                </div>
                
                <Btn className="w-full justify-center py-6 mt-2 shadow-neon transition-transform active:scale-95" onClick={() => mutation.mutate(form)} disabled={mutation.isPending || !form.name}>
                  {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : (editProduct ? "Update Product" : "Add Product")}
                </Btn>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
