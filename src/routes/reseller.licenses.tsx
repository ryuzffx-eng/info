import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, Copy, Loader2, RefreshCcw, X, ChevronDown, Info, RefreshCw, Check, Calendar, Clock, Shield, Hash, Zap, Activity } from "lucide-react";
import { PageHeader, Card, Badge, Btn, ConfirmModal } from "@/components/admin/ui";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/reseller/licenses")({ component: ResellerLicenses });

function ResellerLicenses() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [infoLicense, setInfoLicense] = useState<any>(null);
  const [newLicenses, setNewLicenses] = useState<any[] | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  
  // Filtering states
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [appFilter, setAppFilter] = useState("all");
  const [isStatusSelectOpen, setIsStatusSelectOpen] = useState(false);
  const [isAppFilterOpen, setIsAppFilterOpen] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["reseller-profile"],
    queryFn: () => api.reseller.getProfile(),
  });

  const { data: licenses, isLoading, error, refetch } = useQuery({
    queryKey: ["reseller-licenses"],
    queryFn: () => api.reseller.getMyLicenses(),
  });

  const { data: apps } = useQuery({
    queryKey: ["reseller-apps"],
    queryFn: () => api.reseller.getApplications(),
  });

  const generateMutation = useMutation({
    mutationFn: (data: any) => api.reseller.generateLicenses(data),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["reseller-licenses"] });
      queryClient.invalidateQueries({ queryKey: ["reseller-profile"] });
      toast.success("License(s) generated successfully");
      setIsModalOpen(false);
      
      if (res && res.keys) {
        setNewLicenses(res.keys.map((k: string) => ({ key: k })));
      } else if (res && Array.isArray(res)) {
        setNewLicenses(res);
      }
    },
    onError: (err: Error) => {
      toast.error(`Failed to generate: ${err.message}`);
    }
  });

  const resetHwidMutation = useMutation({
    mutationFn: (id: number) => api.admin.resetLicenseHwid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reseller-licenses"] });
      toast.success("HWID reset successfully");
      setInfoLicense(null);
    },
    onError: (err: Error) => toast.error(`Failed: ${err.message}`)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.admin.deleteLicense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reseller-licenses"] });
      toast.success("License deleted");
      setDeleteId(null);
    },
    onError: (err: Error) => {
      toast.error(`Failed: ${err.message}`);
      setDeleteId(null);
    }
  });

  const isAdmin = profile?.role === "admin";

  const filteredLicenses = licenses?.filter((l: any) => {
    const matchesSearch = l.key.toLowerCase().includes(search.toLowerCase()) || 
                         (l.app_name || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    const matchesApp = appFilter === "all" || l.app_id.toString() === appFilter;
    return matchesSearch && matchesStatus && matchesApp;
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
      <PageHeader
        title="Licenses"
        subtitle={isAdmin ? "Global administrative key tracker." : "Generate and track your sold keys."}
        action={
          <div className="flex gap-2">
            <Btn variant="outline" onClick={() => refetch()}><RefreshCcw size={14} /></Btn>
            <Btn onClick={() => setIsModalOpen(true)}>
              <Plus size={14} /> Generate key
            </Btn>
          </div>
        }
      />

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search keys..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border/60 bg-card/40 p-3.5 pl-10 text-sm outline-none focus:border-primary/50 transition-all"
          />
          <div className="absolute left-3.5 top-4 text-muted-foreground/50">
            <Hash size={14} />
          </div>
        </div>
        
        {/* Status Filter */}
        <div className="relative">
          <button
            onClick={() => setIsStatusSelectOpen(!isStatusSelectOpen)}
            className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-card/40 p-3.5 text-sm transition-all hover:bg-card/60"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
               <Activity size={14} />
               <span className="text-foreground/90 font-medium">{statusFilter === "all" ? "All Statuses" : statusFilter.toUpperCase()}</span>
            </div>
            <ChevronDown size={14} className={`transition-transform duration-300 text-muted-foreground ${isStatusSelectOpen ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {isStatusSelectOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsStatusSelectOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute left-0 top-[calc(100%+8px)] z-20 w-full overflow-hidden rounded-xl border border-white/5 bg-card/90 p-1.5 backdrop-blur-xl shadow-2xl"
                >
                  {["all", "active", "used", "paused", "expired", "banned"].map(s => (
                    <button
                      key={s}
                      onClick={() => {
                        setStatusFilter(s);
                        setIsStatusSelectOpen(false);
                      }}
                      className={`flex w-full items-center rounded-lg px-3 py-2.5 text-sm transition-all uppercase tracking-tighter font-bold ${statusFilter === s ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}
                    >
                      {s === "all" ? "All Statuses" : s}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* App Filter */}
        <div className="relative">
          <button
            onClick={() => setIsAppFilterOpen(!isAppFilterOpen)}
            className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-card/40 p-3.5 text-sm transition-all hover:bg-card/60"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
               <Zap size={14} />
               <span className="text-foreground/90 font-medium">{apps?.find(a => a.id.toString() === appFilter)?.app_name || "All Applications"}</span>
            </div>
            <ChevronDown size={14} className={`transition-transform duration-300 text-muted-foreground ${isAppFilterOpen ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {isAppFilterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsAppFilterOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute left-0 top-[calc(100%+8px)] z-20 w-full overflow-hidden rounded-xl border border-white/5 bg-card/90 p-1.5 backdrop-blur-xl shadow-2xl"
                >
                  <button
                    onClick={() => {
                      setAppFilter("all");
                      setIsAppFilterOpen(false);
                    }}
                    className={`flex w-full items-center rounded-lg px-3 py-2.5 text-sm transition-all font-bold ${appFilter === "all" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}
                  >
                    All Applications
                  </button>
                  {apps?.map(a => (
                    <button
                      key={a.id}
                      onClick={() => {
                        setAppFilter(a.id.toString());
                        setIsAppFilterOpen(false);
                      }}
                      className={`flex w-full items-center rounded-lg px-3 py-2.5 text-sm transition-all font-bold ${appFilter === a.id.toString() ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}
                    >
                      {a.app_name}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Card>
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="py-3 pr-4">Key</th>
                <th className="px-4">App</th>
                <th className="px-4">Duration</th>
                <th className="px-4">Status</th>
                <th className="px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLicenses?.map((l: any) => (
                <tr key={l.key} className="border-b border-border/40 hover:bg-card/40">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-xs">{l.key}</code>
                      <button onClick={() => { navigator.clipboard.writeText(l.key); toast.success("Copied key"); }}>
                        <Copy size={11} className="text-primary hover:scale-110 transition-transform" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4">
                    <div className="flex items-center gap-1.5">
                      {l.app_name}
                      {l.is_super_license && (
                        <span className="inline-flex px-1.5 py-0.5 rounded bg-amber-500/10 text-[9px] font-bold text-amber-400 border border-amber-500/20">
                          SUPER
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4">{l.is_super_license ? "Super (Unlimited)" : `${l.duration} Days`}</td>
                  <td className="px-4">
                    <Badge tone={l.status === "active" ? "primary" : l.status === "used" ? "success" : "muted"}>
                      {l.status}
                    </Badge>
                  </td>
                  <td className="px-4 text-right">
                    <div className="flex justify-end gap-2.5">
                      <button onClick={() => setInfoLicense(l)} className="text-muted-foreground hover:text-primary transition-colors"><Info size={14} /></button>
                      {isAdmin && (
                        <>
                          <button onClick={() => resetHwidMutation.mutate(l.id)} className="text-emerald-500 hover:text-emerald-400 transition-colors" title="Reset HWID"><RefreshCw size={14} /></button>
                          <button onClick={() => setDeleteId(l.id)} className="text-red-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredLicenses?.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground italic">
                    No keys found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <GenerateLicenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={(data) => generateMutation.mutate(data)}
        loading={generateMutation.isPending}
        apps={apps || []}
        profile={profile}
      />

      <NewLicensesModal
        isOpen={!!newLicenses}
        onClose={() => setNewLicenses(null)}
        licenses={newLicenses || []}
      />

      <LicenseInfoModal
        license={infoLicense}
        onClose={() => setInfoLicense(null)}
        onResetHwid={() => resetHwidMutation.mutate(infoLicense.id)}
        resetLoading={resetHwidMutation.isPending}
        isAdmin={isAdmin}
      />

      <ConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
        title="Delete License"
        message="Are you sure you want to delete this license? This action cannot be undone."
      />
    </div>
  );
}

function GenerateLicenseModal({ isOpen, onClose, onGenerate, loading, apps, profile }: { isOpen: boolean; onClose: () => void; onGenerate: (data: any) => void; loading: boolean; apps: any[]; profile: any }) {
  const [appId, setAppId] = useState("");
  const [duration, setDuration] = useState("30");
  const [amount, setAmount] = useState("1");
  const [style, setStyle] = useState("DASHED");
  const [isAppSelectOpen, setIsAppSelectOpen] = useState(false);
  const [isSuperLicense, setIsSuperLicense] = useState(false);

  useEffect(() => {
    if (apps.length > 0 && !appId) setAppId(apps[0].id.toString());
    if (!isOpen) setIsSuperLicense(false);
  }, [apps, isOpen]);

  const handleGenerate = () => {
    const qty = parseInt(amount);
    if (!profile) return;
    if (profile.role !== "admin" && profile.credits < qty) {
      toast.error("Insufficient reseller credits!");
      return;
    }
    onGenerate({
      app_id: parseInt(appId),
      duration_days: parseInt(duration),
      amount: qty,
      key_style: style,
      is_super_license: isSuperLicense
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-md">
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong w-full max-w-xl rounded-3xl p-10 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold">Generate Licenses</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Credits Remaining: <span className="text-primary font-bold">{profile?.role === 'admin' ? 'Unlimited' : profile?.credits}</span>
                </p>
              </div>
              <button onClick={onClose} className="rounded-lg p-2 hover:bg-card"><X size={20} /></button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Application</label>
                <div className="relative mt-2">
                  <button
                    onClick={() => setIsAppSelectOpen(!isAppSelectOpen)}
                    className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-card/40 p-3 text-sm transition-all focus:border-primary/50"
                  >
                    <span>{apps.find(a => a.id.toString() === appId)?.app_name || "Select App"}</span>
                    <ChevronDown size={14} className={`transition-transform ${isAppSelectOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {isAppSelectOpen && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsAppSelectOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute left-0 top-[calc(100%+8px)] z-20 w-full overflow-hidden rounded-xl border border-border/60 bg-card/90 p-1.5 backdrop-blur-xl shadow-2xl"
                        >
                          {apps.map(a => (
                            <button
                              key={a.id}
                              onClick={() => {
                                setAppId(a.id.toString());
                                setIsAppSelectOpen(false);
                              }}
                              className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-all ${appId === a.id.toString() ? "bg-primary/20 text-primary" : "hover:bg-card"}`}
                            >
                              {a.app_name}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Duration (Days)</label>
                  <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-border/60 bg-card/40 p-3 text-sm outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Amount</label>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-border/60 bg-card/40 p-3 text-sm outline-none focus:border-primary/50" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Key Style</label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setStyle("ALPHANUMERIC")} className={`flex flex-col items-center gap-1 rounded-xl border py-4 px-2 transition-all ${style === "ALPHANUMERIC" ? "border-primary bg-primary/10 text-primary" : "border-border/60 bg-card/40 text-muted-foreground hover:border-primary/30"}`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Standard</span>
                  </button>
                  <button type="button" onClick={() => setStyle("NUMERIC")} className={`flex flex-col items-center gap-1 rounded-xl border py-4 px-2 transition-all ${style === "NUMERIC" ? "border-primary bg-primary/10 text-primary" : "border-border/60 bg-card/40 text-muted-foreground hover:border-primary/30"}`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Numeric</span>
                  </button>
                  <button type="button" onClick={() => setStyle("DASHED")} className={`flex flex-col items-center gap-1 rounded-xl border py-4 px-2 transition-all ${style === "DASHED" ? "border-primary bg-primary/10 text-primary" : "border-border/60 bg-card/40 text-muted-foreground hover:border-primary/30"}`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Dashed</span>
                  </button>
                </div>
              </div>

              {profile?.role === "admin" && (
                <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-card/40 animate-fade-in">
                  <div>
                    <label className="text-sm font-bold text-foreground block">Super License</label>
                    <span className="text-xs text-muted-foreground block mt-0.5">Allows login on unlimited devices without HWID lock</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSuperLicense(!isSuperLicense)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      isSuperLicense ? "bg-primary" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isSuperLicense ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              )}

              <Btn className="w-full justify-center py-6 mt-4" onClick={handleGenerate} disabled={loading || !appId}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Generate Now"}
              </Btn>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function NewLicensesModal({ isOpen, onClose, licenses }: { isOpen: boolean, onClose: () => void, licenses: any[] }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-card border border-white/5 shadow-2xl p-8"
          >
            <div className="absolute top-0 right-0 p-4">
              <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col items-center text-center mb-8">
              <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 border border-emerald-500/20">
                <Zap size={32} />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground">Success!</h2>
              <p className="text-muted-foreground mt-1">Your new license keys are ready.</p>
            </div>

            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              {licenses.map((l, i) => (
                <div key={i} className="group relative flex items-center justify-between gap-4 p-4 rounded-xl bg-secondary/30 border border-white/5 hover:border-emerald-500/30 transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-black/40 flex items-center justify-center text-[10px] font-bold text-muted-foreground border border-white/5">{i + 1}</div>
                    <code className="text-sm font-mono font-bold text-foreground tracking-wider">{l.key}</code>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(l.key); toast.success("Key copied"); }}>
                    <Copy size={14} className="text-muted-foreground hover:text-primary" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-3">
              <Btn 
                variant="outline" 
                className="flex-1 h-12" 
                onClick={() => {
                  const allKeys = licenses.map(l => l.key).join('\n');
                  const blob = new Blob([allKeys], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `licenses_${new Date().toISOString().split('T')[0]}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);
                  toast.success("Downloaded TXT");
                }}
              >
                Download TXT
              </Btn>
              <Btn 
                variant="outline" 
                className="flex-1 h-12" 
                onClick={() => {
                  const allKeys = licenses.map(l => l.key).join('\n');
                  navigator.clipboard.writeText(allKeys).then(() => {
                    toast.success("All keys copied!");
                  });
                }}
              >
                Copy All
              </Btn>
              <Btn className="flex-1 h-12" onClick={onClose}>
                Done
              </Btn>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function LicenseInfoModal({ license, onClose, onResetHwid, resetLoading, isAdmin }: { license: any; onClose: () => void; onResetHwid: () => void; resetLoading: boolean; isAdmin: boolean }) {
  if (!license) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md">
        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-strong w-full max-w-lg rounded-2xl p-7 shadow-2xl relative overflow-hidden bg-card/60">
          
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display tracking-tight">License Details</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Security Settings</p>
              </div>
            </div>
            <button onClick={onClose} className="rounded-lg p-2 hover:bg-card/80 text-muted-foreground transition-all">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            <InfoItem label="LICENSE KEY" value={license.key} icon={<Hash size={14} />} mono copyable />
            
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="STATUS" value={license.status} icon={<Activity size={14} />} 
                className={license.status === 'active' ? 'text-emerald-400' : 'text-primary'} />
              <InfoItem label="DURATION" value={license.is_super_license ? "Super (Unlimited)" : `${license.duration} Days`} icon={<Clock size={14} />} />
            </div>

            <InfoItem label="HARDWARE ID (HWID)" value={license.hwid || "Not bound yet"} icon={<Shield size={14} />} mono copyable={!!license.hwid} />

            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="APPLICATION" value={license.app_name} icon={<Zap size={14} />} />
              <InfoItem label="CREATED ON" value={license.created_at ? new Date(license.created_at).toLocaleDateString() : "N/A"} icon={<Calendar size={14} />} />
            </div>

            <div className="pt-4 flex gap-3">
              {isAdmin && license.hwid && (
                <button 
                  onClick={onResetHwid} 
                  disabled={resetLoading}
                  className="flex-1 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center gap-2 text-xs font-bold hover:bg-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 group text-primary"
                >
                  {resetLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />}
                  Reset HWID Lock
                </button>
              )}
              <button 
                onClick={onClose}
                className="px-6 h-12 rounded-xl bg-card border border-border/60 text-muted-foreground text-xs font-bold hover:bg-card/80 transition-all flex-1"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function InfoItem({ label, value, mono, copyable, icon, className }: { label: string; value: string; mono?: boolean; copyable?: boolean; icon?: React.ReactNode; className?: string }) {
  const copy = () => {
    navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]">
      <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mb-2">
        {icon && <span className="opacity-50">{icon}</span>}
        {label}
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className={`text-xs font-bold truncate tracking-tight ${mono ? "font-mono" : ""} ${className || "text-foreground/90"}`}>{value}</div>
        {copyable && (
          <button onClick={copy} className="text-muted-foreground/40 hover:text-primary transition-all scale-90 hover:scale-100">
            <Copy size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
