import { createFileRoute } from "@tanstack/react-router";
import { Plus, Power, Wrench, Copy, X, Loader2, Key, RotateCw, Info, Check, Trash2, AppWindow } from "lucide-react";
import { PageHeader, Card, Badge, Btn, ConfirmModal } from "@/components/admin/ui";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, API_BASE_URL } from "@/lib/api";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/admin/applications")({ component: Applications });

function Applications() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [credsOpen, setCredsOpen] = useState<any>(null);
  const [appName, setAppName] = useState("");
  const [appVersion, setAppVersion] = useState("1.0");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: apps = [], isLoading } = useQuery({
    queryKey: ["admin-apps"],
    queryFn: () => api.admin.getApplications(),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.admin.createApplication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-apps"] });
      toast.success("Application created successfully");
      setOpen(false);
      setAppName("");
    },
    onError: (err: Error) => {
      toast.error(`Creation failed: ${err.message}`);
    }
  });

  const toggleMaintenance = useMutation({
    mutationFn: (id: number) => api.admin.toggleMaintenance(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-apps"] });
      toast.success("Maintenance status updated");
    }
  });

  const refreshSecret = useMutation({
    mutationFn: (id: number) => api.admin.refreshSecret(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-apps"] });
      setCredsOpen((prev: any) => ({ ...prev, secret_key: data.secret_key }));
      toast.success("Secret refreshed");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.admin.deleteApplication(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-apps"] });
      toast.success("Application deleted");
      setDeleteId(null);
    },
    onError: (err: Error) => {
      toast.error(`Delete failed: ${err.message}`);
      setDeleteId(null);
    }
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const apiUrl = API_BASE_URL;

  return (
    <div>
      <PageHeader title="Applications" subtitle="Manage your software applications and secret keys."
        action={<Btn onClick={() => setOpen(true)}><Plus size={14} /> New application</Btn>} />
      
      <div className="grid gap-4 sm:grid-cols-2">
        {apps.map((a: any) => (
          <Card key={a.id}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{a.app_name}</h3>
                <p className="text-xs text-muted-foreground">{a.app_version} • {a.app_id}</p>
              </div>
              <Badge tone={!a.maintenance_mode ? "primary" : "warning"}>{!a.maintenance_mode ? "Operational" : "Maintenance"}</Badge>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <Btn variant="primary" className="flex-1 justify-center" onClick={() => setCredsOpen(a)}>
                <Key size={12} /> View Credentials
              </Btn>
              <Btn variant="outline" onClick={() => toggleMaintenance.mutate(a.id)} disabled={toggleMaintenance.isPending}>
                <Wrench size={12} /> {a.maintenance_mode ? "Operational" : "Maintenance"}
              </Btn>
              <Btn variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" 
                onClick={() => setDeleteId(a.id)}
                disabled={deleteMutation.isPending}>
                <Trash2 size={12} />
              </Btn>
            </div>
          </Card>
        ))}
        {apps.length === 0 && (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            No applications found. Create your first one to get started.
          </div>
        )}
      </div>

      {/* New Application Modal */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong w-full max-w-md rounded-2xl p-7 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">New Application</h3>
                <button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-card"><X size={16} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">App Name</label>
                  <input value={appName} onChange={(e) => setAppName(e.target.value)} placeholder="e.g. Phantom Loader" 
                    className="mt-2 w-full rounded-xl border border-border/60 bg-card/40 p-3 text-sm outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Version</label>
                  <input value={appVersion} onChange={(e) => setAppVersion(e.target.value)} placeholder="1.0.0" 
                    className="mt-2 w-full rounded-xl border border-border/60 bg-card/40 p-3 text-sm outline-none focus:border-primary/50" />
                </div>
                <Btn className="w-full justify-center py-6 mt-4" onClick={() => mutation.mutate({ app_name: appName, app_version: appVersion })} disabled={mutation.isPending || !appName}>
                  {mutation.isPending ? <Loader2 size={16} className="animate-spin" /> : "Create Application"}
                </Btn>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Credentials Modal (as per screenshot) */}
      <AnimatePresence>
        {credsOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong w-full max-w-lg rounded-2xl p-7 shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-xl font-bold">Application Credentials</h3>
                <button onClick={() => setCredsOpen(null)} className="rounded-lg p-2 hover:bg-card"><X size={16} /></button>
              </div>
              <p className="text-xs text-muted-foreground mb-6">Simply replace the placeholder code in the example with these</p>

              <div className="space-y-4">
                <CredField label="APPLICATION NAME" value={credsOpen.app_name} />
                <CredField label="API URL" value={apiUrl} />
                <CredField label="APPLICATION SECRET" value={credsOpen.secret_key} />
                <CredField label="APPLICATION VERSION" value={credsOpen.app_version} />

                <Btn variant="primary" className="bg-orange-600 hover:bg-orange-700 text-white shadow-none mt-2" 
                  onClick={() => refreshSecret.mutate(credsOpen.id)} disabled={refreshSecret.isPending}>
                  <RotateCw size={14} className={refreshSecret.isPending ? "animate-spin" : ""} /> Refresh Application Secret
                </Btn>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={deleteId !== null} 
        onClose={() => setDeleteId(null)} 
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Application"
        message="Are you sure you want to delete this application? This action cannot be undone and will invalidate all related licenses."
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

function CredField({ label, value }: { label: string; value: string }) {
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
        toast.success(`${label} copied`);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast.error("Failed to copy");
      }
      document.body.removeChild(textArea);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(value).then(() => {
        setCopied(true);
        toast.success(`${label} copied`);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => fallbackCopy(value));
    } else {
      fallbackCopy(value);
    }
  };

  return (
    <div className="group relative rounded-xl border border-border/60 bg-card/40 p-4 transition-all hover:border-primary/30">
      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{label}</div>
      <div className="flex items-center justify-between gap-4 overflow-hidden">
        <div className="font-display font-bold text-lg overflow-x-auto whitespace-nowrap scrollbar-none py-1">{value}</div>
        <button onClick={copy} className="shrink-0 rounded-lg p-2 hover:bg-card text-muted-foreground hover:text-primary transition-all bg-card/50 active:scale-95">
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
      </div>
    </div>
  );
}
