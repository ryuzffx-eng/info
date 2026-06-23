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
  const [openApps, setOpenApps] = useState<{ id: number, name: string, allowedApps: number[] | null } | null>(null);
  const [tempAllowedApps, setTempAllowedApps] = useState<number[]>([]);
  const [isAllApps, setIsAllApps] = useState(true);
  const [canCreateCustomKeys, setCanCreateCustomKeys] = useState(false);
  const [canGenLifetime, setCanGenLifetime] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [credits, setCredits] = useState(0);

  const { data: resellers, isLoading } = useQuery({
    queryKey: ["admin-resellers"],
    queryFn: api.admin.getResellers,
  });

  const { data: applications } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: api.admin.getApplications,
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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => api.admin.updateReseller(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-resellers"] });
      toast.success("Reseller permissions updated successfully");
      setOpenApps(null);
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

      <Card className="mt-6 !p-0 overflow-hidden border-border/40">
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-card/20 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 border-b border-white/5">
              <tr>
                <th className="py-5 px-6 font-display">Reseller</th>
                <th className="px-6 font-display">Allowed Products</th>
                <th className="px-6 font-display">Permissions</th>
                <th className="px-6 font-display">Credits</th>
                <th className="px-6 font-display">Joined</th>
                <th className="px-6 text-right font-display">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {resellers?.map((r: any) => {
                const allowedApps = r.permissions?.allowed_apps;
                const canCreateCustom = r.permissions?.can_create_custom_keys;
                const canGenLifetime = r.permissions?.can_gen_lifetime;
                
                return (
                  <tr key={r.id} className="group hover:bg-primary/[0.02] transition-colors">
                    <td className="py-6 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm border border-primary/20 shadow-[0_0_15px_var(--primary-glow)] uppercase">
                          {(r.username || "?").charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-foreground/90 tracking-tight">{r.username}</div>
                          <div className="text-xs text-muted-foreground/60">{r.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6">
                      {!allowedApps ? (
                        <Badge tone="success" className="text-[9px] font-bold uppercase tracking-wider">All Products</Badge>
                      ) : allowedApps.length === 0 ? (
                        <Badge tone="danger" className="text-[9px] font-bold uppercase tracking-wider">No Products</Badge>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {allowedApps.map((id: number) => {
                            const app = applications?.find((a: any) => a.id === id);
                            return (
                              <Badge key={id} tone="primary" className="text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-wider">
                                {app ? app.app_name : `App ${id}`}
                              </Badge>
                            );
                          })}
                        </div>
                      )}
                    </td>
                    <td className="px-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-block h-2 w-2 rounded-full ${canCreateCustom ? "bg-primary shadow-[0_0_8px_var(--primary)]" : "bg-zinc-600"}`} />
                          <span className="text-xs font-semibold text-foreground/80">Custom Keys: {canCreateCustom ? "Yes" : "No"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-block h-2 w-2 rounded-full ${canGenLifetime ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-zinc-600"}`} />
                          <span className="text-xs font-semibold text-foreground/80">Lifetime Keys: {canGenLifetime ? "Yes" : "No"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6">
                      <Badge tone={r.credits > 0 ? "success" : "muted"} className="font-bold px-3 py-1 text-xs">
                        {r.credits}
                      </Badge>
                    </td>
                    <td className="px-6 text-muted-foreground font-medium">
                      {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6">
                      <div className="flex justify-end gap-2">
                        <Btn variant="outline" onClick={() => setOpenTopup({ id: r.id, name: r.username })}>Top up</Btn>
                        <Btn variant="outline" onClick={() => {
                          setOpenApps({ 
                            id: r.id, 
                            name: r.username, 
                            allowedApps: r.permissions?.allowed_apps || null 
                          });
                          setTempAllowedApps(r.permissions?.allowed_apps || []);
                          setIsAllApps(!r.permissions?.allowed_apps);
                          setCanCreateCustomKeys(!!r.permissions?.can_create_custom_keys);
                          setCanGenLifetime(!!r.permissions?.can_gen_lifetime);
                        }}>Permissions</Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {resellers?.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    No resellers found
                  </td>
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

      {/* App & Feature Permissions Modal */}
      <AnimatePresence>
        {openApps && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              className="glass-strong w-full max-w-md rounded-2xl p-7 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Permissions: {openApps.name}</h3>
                <button onClick={() => setOpenApps(null)} className="rounded-lg p-2 hover:bg-card"><X size={16} /></button>
              </div>
              <div className="space-y-6">
                
                {/* Feature Permissions Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Allowed Features</h4>
                  
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/45 bg-card/20">
                    <div>
                      <span className="text-sm font-semibold block text-white/95">Allow Custom Keys</span>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">Let reseller input custom license strings</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCanCreateCustomKeys(!canCreateCustomKeys)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                        canCreateCustomKeys ? "bg-primary" : "bg-zinc-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          canCreateCustomKeys ? "translate-x-4.5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/45 bg-card/20">
                    <div>
                      <span className="text-sm font-semibold block text-white/95">Allow Lifetime Keys</span>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">Let reseller generate keys &gt; 3650 days</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCanGenLifetime(!canGenLifetime)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                        canGenLifetime ? "bg-primary" : "bg-zinc-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          canGenLifetime ? "translate-x-4.5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Product Access Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Product Access</h4>
                  
                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/45 bg-card/20">
                    <span className="text-sm font-semibold text-white/95">Access to all applications</span>
                    <input type="checkbox" checked={isAllApps} onChange={(e) => {
                      setIsAllApps(e.target.checked);
                      if (e.target.checked) {
                        setTempAllowedApps([]);
                      }
                    }} className="h-4 w-4 rounded border-border/60 text-primary accent-primary" />
                  </div>

                  {!isAllApps && (
                    <div className="space-y-2 mt-2 max-h-48 overflow-y-auto scrollbar-thin pr-1">
                      {applications?.map((app: any) => {
                        const checked = tempAllowedApps.includes(app.id);
                        return (
                          <div key={app.id} className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-card/10 hover:bg-card/30 transition-colors">
                            <span className="text-xs font-medium">{app.app_name} <span className="text-[10px] text-muted-foreground">(v{app.app_version})</span></span>
                            <input type="checkbox" checked={checked} onChange={() => {
                              if (checked) {
                                setTempAllowedApps(tempAllowedApps.filter(id => id !== app.id));
                              } else {
                                setTempAllowedApps([...tempAllowedApps, app.id]);
                              }
                            }} className="h-4 w-4 rounded border-border/60 text-primary accent-primary" />
                          </div>
                        );
                      })}
                      {applications?.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">No active applications found</p>
                      )}
                    </div>
                  )}
                </div>

                <Btn className="w-full justify-center py-6 mt-6" onClick={() => updateMutation.mutate({ 
                  id: openApps.id, 
                  data: { 
                    allowed_apps: isAllApps ? null : tempAllowedApps,
                    can_create_custom_keys: canCreateCustomKeys,
                    can_gen_lifetime: canGenLifetime
                  } 
                })} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : "Save Permissions"}
                </Btn>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
