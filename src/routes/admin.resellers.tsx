import { createFileRoute } from "@tanstack/react-router";
import { Plus, DollarSign, Users, Loader2, X } from "lucide-react";
import { PageHeader, Card, Badge, Btn, StatCard } from "@/components/admin/ui";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/resellers")({ component: Resellers });

function Resellers() {
  const queryClient = useQueryClient();
  const [openNew, setOpenNew] = useState(false);
  const [openTopup, setOpenTopup] = useState<{ id: number, name: string } | null>(null);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [credits, setCredits] = useState(0);

  const { data: resellers, isLoading } = useQuery({
    queryKey: ["admin-resellers"],
    queryFn: api.admin.getResellers,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.admin.createReseller(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-resellers"] });
      toast.success("Reseller created successfully");
      setOpenNew(false);
      setNewUserEmail("");
    },
    onError: (err: any) => toast.error(err.message)
  });

  const topupMutation = useMutation({
    mutationFn: ({ id, amount }: { id: number, amount: number }) => api.admin.addCredits(id, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-resellers"] });
      toast.success("Credits added successfully");
      setOpenTopup(null);
      setCredits(0);
    },
    onError: (err: any) => toast.error(err.message)
  });

  const totalCredits = resellers?.reduce((acc: number, r: any) => acc + (r.credits || 0), 0) || 0;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Resellers" subtitle="Manage reseller accounts and credit balances."
        action={<Btn onClick={() => setOpenNew(true)}><Plus size={14} /> New reseller</Btn>} />
      
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total resellers" value={resellers?.length.toString()} icon={Users} />
        <StatCard label="Credits in circulation" value={totalCredits.toLocaleString()} icon={DollarSign} accent="accent" />
        <StatCard label="Active Sellers" value={resellers?.filter((r: any) => r.credits > 0).length.toString()} icon={DollarSign} />
      </div>

      <Card className="mt-6">
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="py-3 pr-4">Reseller</th>
                <th className="px-4">Email</th>
                <th className="px-4">Credits</th>
                <th className="px-4">Joined</th>
                <th className="pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {resellers?.map((r: any) => (
                <tr key={r.id} className="border-b border-border/40 hover:bg-card/40">
                  <td className="py-3 pr-4 font-medium">{r.username}</td>
                  <td className="px-4 text-xs text-muted-foreground">{r.email}</td>
                  <td className="px-4"><Badge>{r.credits}</Badge></td>
                  <td className="px-4 text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="pl-4">
                    <div className="flex justify-end gap-1">
                      <Btn variant="outline" onClick={() => setOpenTopup({ id: r.id, name: r.username })}>Top up</Btn>
                    </div>
                  </td>
                </tr>
              ))}
              {resellers?.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">No resellers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Reseller Modal */}
      <AnimatePresence>
        {openNew && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="glass-strong w-full max-w-md rounded-2xl p-7 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Promote to Reseller</h3>
                <button onClick={() => setOpenNew(false)} className="rounded-lg p-2 hover:bg-card"><X size={16} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">User Email</label>
                  <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="user@example.com" 
                    className="mt-2 w-full rounded-xl border border-border/60 bg-card/40 p-3 text-sm outline-none focus:border-primary/50" />
                </div>
                <Btn className="w-full justify-center py-6 mt-4" onClick={() => createMutation.mutate({ email: newUserEmail, credits: 0 })} disabled={createMutation.isPending || !newUserEmail}>
                  {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : "Promote User"}
                </Btn>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top up Modal */}
      <AnimatePresence>
        {openTopup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="glass-strong w-full max-w-md rounded-2xl p-7 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Top up Credits: {openTopup.name}</h3>
                <button onClick={() => setOpenTopup(null)} className="rounded-lg p-2 hover:bg-card"><X size={16} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</label>
                  <input type="number" value={credits} onChange={(e) => setCredits(parseInt(e.target.value))} 
                    className="mt-2 w-full rounded-xl border border-border/60 bg-card/40 p-3 text-sm outline-none focus:border-primary/50" />
                </div>
                <Btn className="w-full justify-center py-6 mt-4" onClick={() => topupMutation.mutate({ id: openTopup.id, amount: credits })} disabled={topupMutation.isPending || credits <= 0}>
                  {topupMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : "Add Credits"}
                </Btn>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
