import { createFileRoute } from "@tanstack/react-router";
import { Plus, Pause, Trash2, Copy, Loader2, RefreshCcw, X, ChevronDown, Info, RefreshCw, Check, Calendar, Clock, Shield, Hash, Zap, Activity } from "lucide-react";
import { PageHeader, Card, Badge, Btn, ConfirmModal } from "@/components/admin/ui";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/admin/licenses")({ component: Licenses });

function Licenses() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [infoLicense, setInfoLicense] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { data: licenses, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-licenses"],
    queryFn: api.admin.getLicenses,
  });

  const { data: apps } = useQuery({
    queryKey: ["admin-apps"],
    queryFn: api.admin.getApplications,
  });

  const generateMutation = useMutation({
    mutationFn: (data: any) => api.reseller.generateLicenses(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-licenses"] });
      toast.success("License(s) generated successfully");
      setIsModalOpen(false);
    },
    onError: (err: Error) => {
      toast.error(`Failed to generate: ${err.message}`);
    }
  });

  const resetHwidMutation = useMutation({
    mutationFn: (id: number) => api.admin.resetLicenseHwid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-licenses"] });
      toast.success("HWID reset successfully");
      setInfoLicense(null);
    },
    onError: (err: Error) => toast.error(`Failed: ${err.message}`)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.admin.deleteLicense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-licenses"] });
      toast.success("License deleted");
      setDeleteId(null);
    },
    onError: (err: Error) => {
      toast.error(`Failed: ${err.message}`);
      setDeleteId(null);
    }
  });

  const formatDaysLeft = (expiry: string) => {
    if (!expiry) return null;
    const now = new Date();
    const exp = new Date(expiry);
    const diffTime = exp.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "Expired";
    return `${diffDays} days left`;
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
      <PageHeader
        title="Licenses"
        subtitle="Generate and manage license keys."
        action={
          <div className="flex gap-2">
            <Btn variant="outline" onClick={() => refetch()}><RefreshCcw size={14} /></Btn>
            <Btn onClick={() => setIsModalOpen(true)}>
              <Plus size={14} /> Generate License
            </Btn>
          </div>
        }
      />
      {/* Desktop Table */}
      <Card className="hidden md:block !p-0 overflow-hidden border-border/40">
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-card/20 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 border-b border-white/5">
              <tr>
                <th className="py-5 px-6 w-16 font-display">#</th>
                <th className="px-6 font-display"><div className="flex items-center gap-2"><Hash size={12} /> License key</div></th>
                <th className="px-6 font-display"><div className="flex items-center gap-2"><Zap size={12} /> Application</div></th>
                <th className="px-6 font-display"><div className="flex items-center gap-2"><Activity size={12} /> Status</div></th>
                <th className="px-6 font-display"><div className="flex items-center gap-2"><Clock size={12} /> Expiry</div></th>
                <th className="px-6 font-display"><div className="flex items-center gap-2"><Calendar size={12} /> Created</div></th>
                <th className="px-6 text-right font-display">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {licenses?.map((l: any, idx: number) => (
                <tr key={l.key} className="group hover:bg-primary/[0.02] transition-colors">
                  <td className="py-6 px-6 font-mono text-xs text-muted-foreground">
                    {(idx + 1).toString().padStart(2, '0')}
                  </td>
                  <td className="px-6">
                    <div className="flex items-center gap-2 group/key">
                      <div className="bg-background/60 border border-border/40 rounded-lg px-4 py-2.5 font-mono text-xs tracking-wider text-foreground/90 shadow-inner group-hover/key:border-primary/30 transition-all">
                        {l.key}
                      </div>
                      <CopyIconBtn value={l.key} />
                    </div>
                  </td>
                  <td className="px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm border border-primary/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        {(l.app_name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-foreground/90 tracking-tight">{l.app_name || "Unknown"}</div>
                        <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">Plan: {l.plan_name || "Standard"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6">
                    <div className={`inline-flex items-center justify-center px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                        l.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" :
                        l.status === "used" ? "bg-primary/10 text-primary border-primary/20" :
                        l.status === "paused" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                        "bg-white/5 text-muted-foreground border-white/5"
                      }`}>
                      {l.status}
                    </div>
                  </td>
                  <td className="px-6">
                    <div>
                      <div className="font-bold text-foreground/90">{l.expiry ? new Date(l.expiry).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "Never"}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{formatDaysLeft(l.expiry) || "No limit"}</div>
                    </div>
                  </td>
                  <td className="px-6">
                    <div className="text-muted-foreground/80">
                      {l.created_at ? new Date(l.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : "N/A"}
                    </div>
                  </td>
                  <td className="px-6">
                    <div className="flex justify-end items-center gap-4">
                      <button onClick={() => setInfoLicense(l)} className="text-muted-foreground hover:text-primary transition-colors"><Info size={18} /></button>
                      <button onClick={() => resetHwidMutation.mutate(l.id)} className="text-emerald-500/80 hover:text-emerald-400 transition-colors" title="Reset HWID"><RefreshCw size={18} /></button>
                      <button onClick={() => setDeleteId(l.id)} className="text-red-500/80 hover:text-red-400 transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {licenses?.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-muted/10 flex items-center justify-center text-muted-foreground/40"><Info size={24} /></div>
                      <div className="text-muted-foreground font-medium">No licenses found</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile Grid Layout */}
      <div className="md:hidden space-y-4">
        {licenses?.map((l: any, idx: number) => (
          <div key={l.key} className="bg-secondary/40 backdrop-blur-xl rounded-xl border border-white/[0.03] p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-900/80 text-primary font-bold text-lg border border-white/5">
                  {(l.app_name || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-lg font-bold text-white tracking-tight">{l.app_name || "Unknown"}</div>
                  <div className="text-[10px] font-bold text-primary uppercase tracking-widest mt-0.5">{l.plan_name || "Standard"} Plan</div>
                </div>
              </div>
              <div className={`inline-flex items-center justify-center px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                l.status === "active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : 
                l.status === "paused" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" : 
                "bg-zinc-900 text-zinc-500 border border-white/5"
              }`}>
                {l.status}
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">License Key</div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-medium text-white bg-black/60 px-4 py-2.5 rounded-lg border border-white/5 shadow-inner">{l.key}</span>
                  <CopyIconBtn value={l.key} />
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Expiration</div>
                <div className="text-right">
                   <div className="text-sm font-bold text-white">{l.expiry ? new Date(l.expiry).toLocaleDateString() : "Lifetime"}</div>
                   <div className="text-[10px] font-medium text-zinc-500 mt-1 uppercase tracking-tighter">{formatDaysLeft(l.expiry) || "No limit"}</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Created</div>
                <div className="text-right">
                   <div className="text-sm font-bold text-white">{l.created_at ? new Date(l.created_at).toLocaleDateString() : "N/A"}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">Actions</div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setInfoLicense(l)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900/60 text-zinc-400 border border-white/5 active:bg-white/10 transition-all"><Info size={18} /></button>
                  <button onClick={() => resetHwidMutation.mutate(l.id)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900/60 text-emerald-500/80 border border-white/5 active:bg-emerald-500/20 transition-all"><RefreshCw size={18} /></button>
                  <button onClick={() => setDeleteId(l.id)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900/60 text-red-500/80 border border-white/5 active:bg-red-500/20 transition-all"><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {licenses?.length === 0 && (
           <div className="bg-secondary/20 rounded-xl p-12 text-center border border-white/5">
              <div className="text-zinc-500 font-medium italic">No licenses found</div>
           </div>
        )}
      </div>

      <GenerateLicenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGenerate={(data) => generateMutation.mutate(data)}
        loading={generateMutation.isPending}
        apps={apps || []}
      />

      <LicenseInfoModal
        license={infoLicense}
        onClose={() => setInfoLicense(null)}
        onResetHwid={() => resetHwidMutation.mutate(infoLicense.id)}
        resetLoading={resetHwidMutation.isPending}
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

function GenerateLicenseModal({ isOpen, onClose, onGenerate, loading, apps }: { isOpen: boolean; onClose: () => void; onGenerate: (data: any) => void; loading: boolean; apps: any[] }) {
  const [appId, setAppId] = useState("");
  const [duration, setDuration] = useState("31");
  const [amount, setAmount] = useState("1");
  const [style, setStyle] = useState("ALPHANUMERIC");
  const [isAppSelectOpen, setIsAppSelectOpen] = useState(false);

  // Reset appId when apps load or modal opens
  useEffect(() => {
    if (apps.length > 0 && !appId) setAppId(apps[0].id.toString());
  }, [apps]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-md">
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong w-full max-w-xl rounded-3xl p-10 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold">Generate Licenses</h3>
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
                  <button onClick={() => setStyle("ALPHANUMERIC")} className={`flex flex-col items-center gap-1 rounded-xl border py-4 px-2 transition-all ${style === "ALPHANUMERIC" ? "border-primary bg-primary/10 text-primary" : "border-border/60 bg-card/40 text-muted-foreground hover:border-primary/30"}`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Standard</span>
                  </button>
                  <button onClick={() => setStyle("NUMERIC")} className={`flex flex-col items-center gap-1 rounded-xl border py-4 px-2 transition-all ${style === "NUMERIC" ? "border-primary bg-primary/10 text-primary" : "border-border/60 bg-card/40 text-muted-foreground hover:border-primary/30"}`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Numeric</span>
                  </button>
                  <button onClick={() => setStyle("DASHED")} className={`flex flex-col items-center gap-1 rounded-xl border py-4 px-2 transition-all ${style === "DASHED" ? "border-primary bg-primary/10 text-primary" : "border-border/60 bg-card/40 text-muted-foreground hover:border-primary/30"}`}>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Dashed</span>
                  </button>
                </div>
              </div>

              <Btn className="w-full justify-center py-6 mt-4" onClick={() => onGenerate({ app_id: parseInt(appId), duration_days: parseInt(duration), amount: parseInt(amount), key_style: style })} disabled={loading || !appId}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Generate Now"}
              </Btn>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
function LicenseInfoModal({ license, onClose, onResetHwid, resetLoading }: { license: any; onClose: () => void; onResetHwid: () => void; resetLoading: boolean }) {
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
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Security Management</p>
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
                className={license.status === 'active' ? 'text-emerald-400' : license.status === 'paused' ? 'text-yellow-400' : 'text-red-400'} />
              <InfoItem label="PLAN TYPE" value={license.plan_name || "Standard"} icon={<Zap size={14} />} />
            </div>

            <InfoItem label="HARDWARE ID (HWID)" value={license.hwid || "Not bound yet"} icon={<Shield size={14} />} mono copyable={!!license.hwid} />

            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="CREATED ON" value={license.created_at ? new Date(license.created_at).toLocaleDateString() : "N/A"} icon={<Calendar size={14} />} />
              <InfoItem label="DURATION" value={`${license.duration_days} Days`} icon={<Clock size={14} />} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="LAST USED" value={license.last_used ? new Date(license.last_used).toLocaleDateString() : "Never"} icon={<Activity size={14} />} />
              <InfoItem label="EXPIRY DATE" value={license.expiry ? new Date(license.expiry).toLocaleDateString() : "N/A"} icon={<Calendar size={14} />} />
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                onClick={onResetHwid} 
                disabled={resetLoading || !license.hwid}
                className="flex-1 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center gap-2 text-xs font-bold hover:bg-primary/20 active:scale-[0.98] transition-all disabled:opacity-50 group text-primary"
              >
                {resetLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />}
                Reset Hardware Lock
              </button>
              <button 
                onClick={onClose}
                className="px-6 h-12 rounded-xl bg-card border border-border/60 text-muted-foreground text-xs font-bold hover:bg-card/80 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function InfoItem({ label, value, mono, copyable, icon, className }: { label: string; value: string; mono?: boolean; copyable?: boolean; icon?: React.ReactNode; className?: string }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]">
      <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60 mb-2">
        {icon && <span className="opacity-50">{icon}</span>}
        {label}
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className={`text-xs font-bold truncate tracking-tight ${mono ? "font-mono" : ""} ${className || "text-foreground/90"}`}>{value}</div>
        {copyable && <CopyIconBtn value={value} />}
      </div>
    </div>
  );
}

function CopyIconBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    const fallbackCopy = (text: string) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast.error("Failed to copy");
      }
      document.body.removeChild(textArea);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(value).then(() => {
        setCopied(true);
        toast.success("Copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => fallbackCopy(value));
    } else {
      fallbackCopy(value);
    }
  };

  return (
    <button onClick={copy} className="text-muted-foreground/40 hover:text-primary transition-all scale-90 hover:scale-100">
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div key="check" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
            <Check size={16} className="text-primary" />
          </motion.div>
        ) : (
          <motion.div key="copy" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
            <Copy size={16} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
