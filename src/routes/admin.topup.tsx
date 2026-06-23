import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Btn, Badge, ConfirmModal } from "@/components/admin/ui";
import { Plus, Trash2, Loader2, Sparkles, AlertTriangle, ArrowRight, Wallet, Info } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/topup")({ component: AdminTopupPlans });

function AdminTopupPlans() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletePlanId, setDeletePlanId] = useState<number | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [credits, setCredits] = useState("");
  const [description, setDescription] = useState("");

  // Bonus states
  const [bonusEnabled, setBonusEnabled] = useState(false);
  const [bonusThreshold, setBonusThreshold] = useState("10.00");
  const [bonusPercent, setBonusPercent] = useState("10");

  const { data: plans, isLoading } = useQuery<any[]>({
    queryKey: ["admin-topup-plans"],
    queryFn: () => api.admin.getTopupPlans(),
  });

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: api.admin.getSettings,
  });

  useEffect(() => {
    if (settings) {
      setBonusEnabled(settings.topup_bonus_enabled === "true");
      setBonusThreshold(settings.topup_bonus_threshold ?? "10.00");
      setBonusPercent(settings.topup_bonus_percent ?? "10");
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: (data: Record<string, string>) => api.admin.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["reseller-profile"] });
      toast.success("Bonus settings updated!");
    },
    onError: (err: any) => {
      toast.error(`Failed to update bonus settings: ${err.message}`);
    }
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.admin.createTopupPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-topup-plans"] });
      toast.success("Top-up plan created successfully");
      setIsModalOpen(false);
      setName("");
      setAmount("");
      setCredits("");
      setDescription("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create plan");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.admin.deleteTopupPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-topup-plans"] });
      toast.success("Top-up plan deleted");
      setDeletePlanId(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete plan");
      setDeletePlanId(null);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Plan name is required");
    const numAmount = parseFloat(amount);
    const numCredits = parseInt(credits, 10);
    if (isNaN(numAmount) || numAmount <= 0) return toast.error("Please enter a valid amount");
    if (isNaN(numCredits) || numCredits <= 0) return toast.error("Please enter a valid credit amount");

    createMutation.mutate({
      name: name.trim(),
      amount: numAmount,
      credits: numCredits,
      description: description.trim() || undefined
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Reseller Top-up Plans" 
        subtitle="Configure preset credit packages available for resellers to purchase."
        action={
          <Btn onClick={() => setIsModalOpen(true)}>
            <Plus size={14} /> Add Plan
          </Btn>
        }
      />

      {/* Top-up Bonus Configuration Card */}
      <Card className="border-emerald-500/10 bg-emerald-500/[0.02]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h3 className="font-bold text-white flex items-center gap-1.5">
              <Sparkles size={16} className="text-emerald-400" />
              Reseller Top-up Bonus Rules
            </h3>
            <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider mt-0.5">
              Reward bonus credits for smaller deposits (up to threshold limit)
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Toggle */}
            <label className="flex items-center gap-2 cursor-pointer bg-white/[0.02] border border-white/5 hover:border-white/10 px-3 py-2 rounded-xl transition-all">
              <span className="text-xs text-zinc-400 uppercase font-black tracking-wider">Enable Bonus</span>
              <input 
                type="checkbox" 
                checked={bonusEnabled} 
                onChange={(e) => {
                  const val = e.target.checked;
                  setBonusEnabled(val);
                  updateSettingsMutation.mutate({
                    ...settings,
                    topup_bonus_enabled: val ? "true" : "false"
                  });
                }}
                className="peer sr-only" 
              />
              <span className="relative h-5 w-9 rounded-full bg-zinc-800 transition-colors peer-checked:bg-emerald-500">
                <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
              </span>
            </label>

            {/* Threshold field */}
            <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">Max Amount</span>
              <input 
                type="number"
                value={bonusThreshold}
                onChange={(e) => setBonusThreshold(e.target.value)}
                onBlur={() => {
                  updateSettingsMutation.mutate({
                    ...settings,
                    topup_bonus_threshold: bonusThreshold
                  });
                }}
                className="w-16 bg-transparent border-b border-white/10 focus:border-emerald-500 outline-none text-xs text-white font-mono font-bold text-center py-0.5"
              />
              <span className="text-xs text-zinc-600 font-bold">$</span>
            </div>

            {/* Percent field */}
            <div className="flex items-center gap-1.5 bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider">Bonus</span>
              <input 
                type="number"
                value={bonusPercent}
                onChange={(e) => setBonusPercent(e.target.value)}
                onBlur={() => {
                  updateSettingsMutation.mutate({
                    ...settings,
                    topup_bonus_percent: bonusPercent
                  });
                }}
                className="w-12 bg-transparent border-b border-white/10 focus:border-emerald-500 outline-none text-xs text-white font-mono font-bold text-center py-0.5"
              />
              <span className="text-xs text-zinc-600 font-bold">%</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="!p-0 overflow-hidden border-border/40">
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-card/20 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 border-b border-white/5">
              <tr>
                <th className="py-5 px-6 font-display">Plan Name</th>
                <th className="px-6 font-display">Price (USD)</th>
                <th className="px-6 font-display">Credits Granted</th>
                <th className="px-6 font-display">Description</th>
                <th className="px-6 font-display">Created At</th>
                <th className="px-6 text-right font-display">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {plans?.map((plan: any) => (
                <tr key={plan.id} className="group hover:bg-primary/[0.01] transition-colors">
                  <td className="py-5 px-6 font-bold text-white tracking-tight">{plan.name}</td>
                  <td className="px-6 font-bold text-foreground/90">${plan.amount.toFixed(2)}</td>
                  <td className="px-6">
                    <Badge tone="success" className="font-extrabold uppercase px-2 py-0.5">
                      {plan.credits} Credits
                    </Badge>
                  </td>
                  <td className="px-6 text-muted-foreground/75 max-w-[240px] truncate" title={plan.description}>
                    {plan.description || "-"}
                  </td>
                  <td className="px-6 text-muted-foreground/50">
                    {new Date(plan.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6">
                    <div className="flex justify-end">
                      <button 
                        onClick={() => setDeletePlanId(plan.id)}
                        className="text-red-500/80 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-xl transition-all"
                        title="Delete Plan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!plans || plans.length === 0) && (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-muted/10 flex items-center justify-center text-muted-foreground/40">
                        <Wallet size={24} />
                      </div>
                      <div className="text-muted-foreground font-medium">No top-up plans configured yet</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong w-full max-w-md rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Add Top-up Plan</h3>
                <Btn variant="ghost" className="!p-2" onClick={() => setIsModalOpen(false)}>✕</Btn>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Plan Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Starter Pack"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm outline-none focus:border-primary/50 text-white font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price (USD)</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      placeholder="Cost in $"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm outline-none focus:border-primary/50 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Credits</label>
                    <input
                      type="number"
                      required
                      placeholder="Balance given"
                      value={credits}
                      onChange={(e) => setCredits(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm outline-none focus:border-primary/50 text-white font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of plan contents..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm outline-none focus:border-primary/50 text-white font-medium resize-none"
                  />
                </div>

                <Btn 
                  type="submit" 
                  disabled={createMutation.isPending} 
                  className="w-full py-4 justify-center mt-2"
                >
                  {createMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : "Save Plan"}
                </Btn>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={deletePlanId !== null}
        onClose={() => setDeletePlanId(null)}
        onConfirm={() => deletePlanId && deleteMutation.mutate(deletePlanId)}
        loading={deleteMutation.isPending}
        title="Delete Top-up Plan"
        message="Are you sure you want to delete this top-up package? Resellers will no longer be able to buy it."
      />
    </div>
  );
}
