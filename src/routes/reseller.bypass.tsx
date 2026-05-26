import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, Copy, Loader2, RefreshCcw, X, ChevronDown, Info, RefreshCw, Check, Calendar, Clock, Shield, Hash, Zap, Activity, Ban, Trash, Search, Filter } from "lucide-react";
import { PageHeader, Card, Badge, Btn, ConfirmModal, CustomSelect } from "@/components/admin/ui";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type BypassSearch = {
  tab?: "whitelist" | "blacklist" | "logs";
};

export const Route = createFileRoute("/reseller/bypass")({
  validateSearch: (search: Record<string, unknown>): BypassSearch => {
    return {
      tab: (search.tab as any) || "whitelist",
    };
  },
  component: ResellerBypass,
});

function ResellerBypass() {
  const { tab } = Route.useSearch();
  const navigate = Route.useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"whitelist" | "blacklist" | "logs">(tab || "whitelist");

  useEffect(() => {
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [tab]);

  const handleTabChange = (newTab: "whitelist" | "blacklist" | "logs") => {
    setActiveTab(newTab);
    navigate({ search: { tab: newTab } });
  };

  const [isWlModalOpen, setIsWlModalOpen] = useState(false);
  const [isBlModalOpen, setIsBlModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isPurgeOpen, setIsPurgeOpen] = useState(false);
  const [selectedWl, setSelectedWl] = useState<any>(null);
  const [extendDuration, setExtendDuration] = useState("30d");
  
  // Search / Filters
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [isRegionSelectOpen, setIsRegionSelectOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isStatusSelectOpen, setIsStatusSelectOpen] = useState(false);

  const REGIONS = ["GLOBAL", "ME", "IND", "ID", "VN", "TH", "BD", "PK", "TW", "EU", "CIS", "NA", "SAC", "BR"];

  // Custom Dropdown Form States
  const [wlRegion, setWlRegion] = useState("GLOBAL");
  const [wlDuration, setWlDuration] = useState("30d");
  const [isWlRegionOpen, setIsWlRegionOpen] = useState(false);
  const [isWlDurationOpen, setIsWlDurationOpen] = useState(false);

  // Details Modal State
  const [selectedLogDetails, setSelectedLogDetails] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const DURATIONS = [
    { value: "12h", label: "12 Hours" },
    { value: "1d", label: "1 Day" },
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
    { value: "lifetime", label: "Lifetime" }
  ];
  
  // UID Checking State
  const [checkInput, setCheckInput] = useState("");
  const [checkResult, setCheckResult] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Queries
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["bypass-stats"],
    queryFn: () => api.bypass.getStats(),
  });

  const { data: whitelist, isLoading: wlLoading, refetch: refetchWl } = useQuery({
    queryKey: ["bypass-whitelist"],
    queryFn: () => api.bypass.getWhitelist(),
  });

  const { data: blacklist, isLoading: blLoading, refetch: refetchBl } = useQuery({
    queryKey: ["bypass-blacklist"],
    queryFn: () => api.bypass.getBlacklist(),
  });

  const { data: logs, isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ["bypass-logs"],
    queryFn: () => api.bypass.getLogs(undefined, 100),
  });

  // Mutations
  const addWhitelistMutation = useMutation({
    mutationFn: (data: any) => api.bypass.addToWhitelist(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bypass-whitelist"] });
      queryClient.invalidateQueries({ queryKey: ["bypass-stats"] });
      toast.success("UID successfully added to whitelist");
      setIsWlModalOpen(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to add UID")
  });

  const removeWhitelistMutation = useMutation({
    mutationFn: (uid: string) => api.bypass.removeFromWhitelist(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bypass-whitelist"] });
      queryClient.invalidateQueries({ queryKey: ["bypass-stats"] });
      toast.success("UID successfully removed from whitelist");
    },
    onError: (err: any) => toast.error(err.message || "Failed to remove UID")
  });

  const addBlacklistMutation = useMutation({
    mutationFn: (data: any) => api.bypass.addToBlacklist(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bypass-blacklist"] });
      queryClient.invalidateQueries({ queryKey: ["bypass-whitelist"] });
      queryClient.invalidateQueries({ queryKey: ["bypass-stats"] });
      toast.success("UID successfully blacklisted");
      setIsBlModalOpen(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to blacklist UID")
  });

  const removeBlacklistMutation = useMutation({
    mutationFn: (uid: string) => api.bypass.removeFromBlacklist(uid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bypass-blacklist"] });
      queryClient.invalidateQueries({ queryKey: ["bypass-stats"] });
      toast.success("UID successfully unbanned");
    },
    onError: (err: any) => toast.error(err.message || "Failed to unban UID")
  });

  const extendWhitelistMutation = useMutation({
    mutationFn: ({ uid, duration }: { uid: string; duration: string }) => api.bypass.extendWhitelist(uid, duration),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bypass-whitelist"] });
      toast.success("Whitelist duration extended");
      setIsExtendModalOpen(false);
      setSelectedWl(null);
    },
    onError: (err: any) => toast.error(err.message || "Failed to extend duration")
  });

  const purgeExpiredMutation = useMutation({
    mutationFn: () => api.bypass.purgeExpired(),
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["bypass-whitelist"] });
      queryClient.invalidateQueries({ queryKey: ["bypass-stats"] });
      toast.success(res.msg || "Purged expired entries");
      setIsPurgeOpen(false);
    },
    onError: (err: any) => toast.error(err.message || "Failed to purge expired UIDs")
  });

  // Handle manual UID check
  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInput.trim()) return;
    setIsChecking(true);
    try {
      const res = await api.bypass.checkUid(checkInput.trim());
      setCheckResult(res);
    } catch (err: any) {
      toast.error(err.message || "Failed to check UID");
    } finally {
      setIsChecking(false);
    }
  };

  const handleRefreshAll = () => {
    refetchWl();
    refetchBl();
    refetchLogs();
    queryClient.invalidateQueries({ queryKey: ["bypass-stats"] });
    toast.success("Data refreshed");
  };

  // Filter whitelist
  const filteredWhitelist = whitelist?.filter((wl: any) => {
    const matchesSearch = wl.uid.includes(search) || (wl.name || "").toLowerCase().includes(search.toLowerCase());
    const matchesRegion = regionFilter === "all" || wl.region === regionFilter;
    return matchesSearch && matchesRegion;
  });

  // Filter blacklist
  const filteredBlacklist = blacklist?.filter((bl: any) => {
    return bl.uid.includes(search) || (bl.reason || "").toLowerCase().includes(search.toLowerCase());
  });

  // Filter logs
  const filteredLogs = logs?.filter((log: any) => {
    const matchesSearch = log.uid.includes(search) || 
                          (log.ip || "").includes(search) || 
                          (log.country || "").toLowerCase().includes(search.toLowerCase()) || 
                          (log.city || "").toLowerCase().includes(search.toLowerCase());
    const matchesRegion = regionFilter === "all" || log.region === regionFilter;
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    return matchesSearch && matchesRegion && matchesStatus;
  });

  // Format time helpers
  const formatTime = (ts: number) => {
    return new Date(ts * 1000).toLocaleString();
  };

  return (
    <div>
      <PageHeader
        title="Reseller Bypass Panel"
        subtitle="Manage client UIDs, track whitelists, and view activity logs."
        action={
          <div className="flex gap-2">
            <Btn variant="outline" onClick={handleRefreshAll}><RefreshCcw size={14} /></Btn>
            <Btn onClick={() => setIsWlModalOpen(true)}>
              <Plus size={14} /> Whitelist UID
            </Btn>
            <Btn className="bg-red-500 hover:bg-red-600 text-white border-none" onClick={() => setIsBlModalOpen(true)}>
              <Ban size={14} /> Ban UID
            </Btn>
          </div>
        }
      />

      {/* Stats Section */}
      <div className="mb-8 grid grid-cols-2 md:grid-cols-6 gap-4">
        <MiniStatCard label="Total Logins" value={stats?.total ?? 0} icon={Zap} accent="primary" />
        <MiniStatCard label="Allowed" value={stats?.allowed ?? 0} icon={Check} accent="success" />
        <MiniStatCard label="Blocked" value={stats?.blocked ?? 0} icon={Ban} accent="danger" />
        <MiniStatCard label="Whitelisted" value={stats?.whitelisted ?? 0} icon={Shield} accent="primary" />
        <MiniStatCard label="Blacklisted" value={stats?.blacklisted ?? 0} icon={X} accent="danger" />
        <MiniStatCard label="Logins (24h)" value={stats?.recent_24h ?? 0} icon={Activity} accent="success" />
      </div>

      {/* Action Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Check UID Status Card */}
        <Card className="bg-card/30 border-border/40">
          <h3 className="text-base font-bold mb-3 flex items-center gap-2 text-white">
            <Search size={16} className="text-primary" />
            Check UID Status
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Query the database to check a player's whitelist or blacklist status.</p>
          <form onSubmit={handleCheck} className="flex gap-3">
            <input 
              type="text" 
              placeholder="Enter UID..." 
              value={checkInput}
              onChange={(e) => setCheckInput(e.target.value)}
              className="flex-1 rounded-xl border border-border/60 bg-black/40 px-4 py-2.5 text-sm outline-none focus:border-primary/50 text-white font-mono"
            />
            <Btn type="submit" className="px-6" disabled={isChecking}>
              {isChecking ? <Loader2 size={14} className="animate-spin" /> : "Check UID"}
            </Btn>
          </form>

          {/* Check Result display */}
          {checkResult && (
            <div className="mt-4 p-4 rounded-xl border border-white/5 bg-black/25 text-xs space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="font-semibold text-muted-foreground">UID:</span>
                <span className="font-mono font-bold text-white">{checkResult.uid}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-muted-foreground">Status:</span>
                <Badge tone={
                  checkResult.status === "whitelisted" ? "primary" :
                  checkResult.status === "blacklisted" ? "danger" : "muted"
                }>
                  {checkResult.status?.toUpperCase()}
                </Badge>
              </div>
              {checkResult.status === "whitelisted" && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-muted-foreground">Region:</span>
                    <span className="text-white font-bold">{checkResult.region}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-muted-foreground">Expires:</span>
                    <span className="text-primary font-bold">{checkResult.expiry_formatted}</span>
                  </div>
                </>
              )}
              {checkResult.status === "blacklisted" && (
                <div className="flex flex-col gap-1 mt-1">
                  <span className="font-semibold text-muted-foreground">Ban Reason:</span>
                  <span className="text-red-400 font-bold bg-red-500/10 p-2 rounded-lg">{checkResult.reason}</span>
                </div>
              )}
              {checkResult.status === "not_found" && (
                <p className="text-muted-foreground italic text-center py-2">Not in Database.</p>
              )}
            </div>
          )}
        </Card>

        {/* Bypass Control Card */}
        <Card className="bg-card/30 border-border/40 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold mb-3 flex items-center gap-2 text-white">
              <Trash2 size={16} className="text-red-400" />
              Bypass Database Maintenance
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Clean up expired whitelist records to keep the database optimized and ensure fast response times for active requests.</p>
          </div>
          <div className="pt-2">
            <Btn variant="outline" className="w-full text-red-400 border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40 justify-center" onClick={() => setIsPurgeOpen(true)}>
              <Trash size={14} className="mr-2" /> Purge Expired UIDs
            </Btn>
          </div>
        </Card>
      </div>

      {/* Main Panel - Full Width */}
      <div className="space-y-6 mb-8">
          {/* Tabs header */}
          <div className="flex border-b border-border/40 gap-6">
            <button 
              onClick={() => handleTabChange("whitelist")}
              className={`pb-4 text-sm font-bold tracking-wider uppercase transition-all relative ${activeTab === "whitelist" ? "text-primary font-black" : "text-muted-foreground hover:text-foreground"}`}
            >
              Whitelist ({filteredWhitelist?.length ?? 0})
              {activeTab === "whitelist" && <motion.div layoutId="active-bypass-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
            <button 
              onClick={() => handleTabChange("blacklist")}
              className={`pb-4 text-sm font-bold tracking-wider uppercase transition-all relative ${activeTab === "blacklist" ? "text-primary font-black" : "text-muted-foreground hover:text-foreground"}`}
            >
              Blacklist ({filteredBlacklist?.length ?? 0})
              {activeTab === "blacklist" && <motion.div layoutId="active-bypass-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
            <button 
              onClick={() => handleTabChange("logs")}
              className={`pb-4 text-sm font-bold tracking-wider uppercase transition-all relative ${activeTab === "logs" ? "text-primary font-black" : "text-muted-foreground hover:text-foreground"}`}
            >
              Realtime Logs ({filteredLogs?.length ?? 0})
              {activeTab === "logs" && <motion.div layoutId="active-bypass-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
          </div>

          {/* Search and filters row */}
          <div className="flex flex-wrap md:flex-nowrap gap-4">
            <div className="relative flex-1">
              <input 
                type="text" 
                placeholder={activeTab === "logs" ? "Search by UID, IP or location..." : `Search ${activeTab}...`} 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-border/60 bg-card/40 p-3.5 pl-10 text-sm outline-none focus:border-primary/50 text-white"
              />
              <div className="absolute left-3.5 top-4 text-muted-foreground/50">
                <Search size={14} />
              </div>
            </div>

            {(activeTab === "whitelist" || activeTab === "logs") && (
              <div className="relative min-w-[160px]">
                <button
                  onClick={() => setIsRegionSelectOpen(!isRegionSelectOpen)}
                  className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-card/40 p-3.5 text-sm transition-all hover:bg-card/60 text-white"
                >
                  <span className="font-bold">{regionFilter === "all" ? "All Regions" : regionFilter}</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isRegionSelectOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {isRegionSelectOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsRegionSelectOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-[calc(100%+8px)] z-20 w-full overflow-hidden rounded-xl border border-white/5 bg-card/90 p-1.5 backdrop-blur-xl shadow-2xl"
                      >
                        <button
                          onClick={() => { setRegionFilter("all"); setIsRegionSelectOpen(false); }}
                          className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-all font-bold ${regionFilter === "all" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}
                        >
                          All Regions
                        </button>
                        {REGIONS.map((reg: any) => (
                          <button
                            key={reg}
                            onClick={() => { setRegionFilter(reg); setIsRegionSelectOpen(false); }}
                            className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-all font-bold ${regionFilter === reg ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}
                          >
                            {reg}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

            {activeTab === "logs" && (
              <div className="relative min-w-[160px]">
                <button
                  onClick={() => setIsStatusSelectOpen(!isStatusSelectOpen)}
                  className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-card/40 p-3.5 text-sm transition-all hover:bg-card/60 text-white"
                >
                  <span className="font-bold">{statusFilter === "all" ? "All Statuses" : statusFilter.toUpperCase()}</span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${isStatusSelectOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {isStatusSelectOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsStatusSelectOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-[calc(100%+8px)] z-20 w-full overflow-hidden rounded-xl border border-white/5 bg-card/90 p-1.5 backdrop-blur-xl shadow-2xl"
                      >
                        {["all", "allowed", "blocked", "expired", "denied", "not_found"].map((st) => (
                          <button
                            key={st}
                            onClick={() => { setStatusFilter(st); setIsStatusSelectOpen(false); }}
                            className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-all font-bold ${statusFilter === st ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}
                          >
                            {st === "all" ? "All Statuses" : st.toUpperCase()}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* TAB 1: Whitelist */}
          {activeTab === "whitelist" && (
            <Card className="!p-0 border-border/40 overflow-hidden">
              {/* Desktop Whitelist Table */}
              <div className="hidden md:block overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm">
                  <thead className="bg-card/20 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground border-b border-white/5">
                    <tr>
                      <th className="py-5 px-6 w-16">#</th>
                      <th className="px-6">UID Key</th>
                      <th className="px-6">Region / Added By</th>
                      <th className="px-6">Status</th>
                      <th className="px-6">Expiry</th>
                      <th className="px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {wlLoading ? (
                      <tr>
                        <td colSpan={6} className="py-20 text-center">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                        </td>
                      </tr>
                    ) : filteredWhitelist && filteredWhitelist.length > 0 ? (
                      filteredWhitelist.map((item: any, idx: number) => (
                        <tr key={item.uid} className="group hover:bg-primary/[0.02] transition-colors">
                          <td className="py-6 px-6 font-mono text-xs text-muted-foreground">
                            {(idx + 1).toString().padStart(2, '0')}
                          </td>
                          <td className="px-6">
                            <div className="flex items-center gap-2 group/key">
                              <div className="bg-background/60 border border-border/40 rounded-lg px-4 py-2.5 font-mono text-xs tracking-wider text-foreground/90 shadow-inner group-hover/key:border-primary/30 transition-all">
                                {item.uid}
                              </div>
                              <button onClick={() => { navigator.clipboard.writeText(item.uid); toast.success("UID copied"); }} className="text-muted-foreground/40 hover:text-primary transition-all">
                                <Copy size={12} />
                              </button>
                              {item.name && <span className="text-[10px] font-semibold text-muted-foreground ml-1">({item.name})</span>}
                            </div>
                          </td>
                          <td className="px-6">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm border border-primary/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                {(item.region || "?").charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-foreground/90 tracking-tight">{item.region || "GLOBAL"}</div>
                                <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">By: {item.added_by || "Reseller"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6">
                            <div className={`inline-flex items-center justify-center px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                              item.is_valid ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" :
                              "bg-red-500/10 text-red-400 border-red-500/20"
                            }`}>
                              {item.is_valid ? "ACTIVE" : "EXPIRED"}
                            </div>
                          </td>
                          <td className="px-6">
                            <div className="flex flex-col">
                              <div className="font-bold text-foreground/90">{item.expiry === 0 ? "Never" : new Date(item.expiry * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5">{item.expiry_formatted || "No limit"}</div>
                            </div>
                          </td>
                          <td className="px-6">
                            <div className="flex justify-end items-center gap-4">
                              <button onClick={() => { setSelectedWl(item); setIsExtendModalOpen(true); }} className="text-muted-foreground hover:text-primary transition-colors" title="Extend Duration">
                                <Clock size={18} />
                              </button>
                              <button onClick={() => addBlacklistMutation.mutate({ uid: item.uid, reason: "Banned by Reseller" })} className="text-yellow-500/80 hover:text-yellow-400 transition-colors" title="Ban UID">
                                <Ban size={18} />
                              </button>
                              <button onClick={() => {
                                if (confirm(`Remove UID ${item.uid} from whitelist?`)) {
                                  removeWhitelistMutation.mutate(item.uid);
                                }
                              }} className="text-red-500/80 hover:text-red-400 transition-colors" title="Delete Whitelist">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-20 text-center text-muted-foreground italic">
                          No whitelisted UIDs found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Whitelist View */}
              <div className="md:hidden divide-y divide-border/20">
                {wlLoading ? (
                  <div className="py-20 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  </div>
                ) : filteredWhitelist && filteredWhitelist.length > 0 ? (
                  filteredWhitelist.map((item: any, idx: number) => (
                    <div key={item.uid} className="p-5 space-y-4 hover:bg-white/[0.01] transition-colors relative">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">
                            {(idx + 1).toString().padStart(2, '0')}
                          </span>
                          <span className="font-mono text-sm font-bold text-white tracking-wider">{item.uid}</span>
                          <button onClick={() => { navigator.clipboard.writeText(item.uid); toast.success("UID copied"); }} className="text-muted-foreground/40 hover:text-primary transition-all">
                            <Copy size={12} />
                          </button>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          item.is_valid ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}>
                          {item.is_valid ? "ACTIVE" : "EXPIRED"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-[10px] border border-primary/20">
                            {(item.region || "?").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-white block">{item.region || "GLOBAL"}</span>
                            <span className="text-[10px] text-muted-foreground/60 block">By: {item.added_by}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-white block">{item.expiry === 0 ? "Lifetime Access" : new Date(item.expiry * 1000).toLocaleDateString()}</span>
                          <span className="text-[10px] text-muted-foreground block">{item.expiry_formatted}</span>
                        </div>
                      </div>

                      <div className="flex justify-end gap-4 pt-1">
                        <button onClick={() => { setSelectedWl(item); setIsExtendModalOpen(true); }} className="text-muted-foreground hover:text-primary transition-all p-1" title="Extend Duration">
                          <Clock size={16} />
                        </button>
                        <button onClick={() => addBlacklistMutation.mutate({ uid: item.uid, reason: "Banned by Reseller" })} className="text-yellow-500/80 hover:text-yellow-400 transition-all p-1" title="Ban UID">
                          <Ban size={16} />
                        </button>
                        <button onClick={() => {
                          if (confirm(`Remove UID ${item.uid} from whitelist?`)) {
                            removeWhitelistMutation.mutate(item.uid);
                          }
                        }} className="text-red-500 hover:text-red-450 transition-all p-1" title="Delete Whitelist">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-muted-foreground italic text-sm">
                    No whitelisted UIDs found.
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* TAB 2: Blacklist */}
          {activeTab === "blacklist" && (
            <Card className="!p-0 border-border/40 overflow-hidden">
              {/* Desktop Blacklist Table */}
              <div className="hidden md:block overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm">
                  <thead className="bg-card/20 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground border-b border-white/5">
                    <tr>
                      <th className="py-5 px-6 w-16">#</th>
                      <th className="px-6">UID Key</th>
                      <th className="px-6">Ban Reason / Added By</th>
                      <th className="px-6">Status</th>
                      <th className="px-6">Banned Date</th>
                      <th className="px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {blLoading ? (
                      <tr>
                        <td colSpan={6} className="py-20 text-center">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                        </td>
                      </tr>
                    ) : filteredBlacklist && filteredBlacklist.length > 0 ? (
                      filteredBlacklist.map((item: any, idx: number) => (
                        <tr key={item.uid} className="group hover:bg-primary/[0.02] transition-colors">
                          <td className="py-6 px-6 font-mono text-xs text-muted-foreground">
                            {(idx + 1).toString().padStart(2, '0')}
                          </td>
                          <td className="px-6">
                            <div className="flex items-center gap-2 group/key">
                              <div className="bg-background/60 border border-border/40 rounded-lg px-4 py-2.5 font-mono text-xs tracking-wider text-red-400/90 shadow-inner transition-all">
                                {item.uid}
                              </div>
                              <button onClick={() => { navigator.clipboard.writeText(item.uid); toast.success("UID copied"); }} className="text-muted-foreground/40 hover:text-primary transition-all">
                                <Copy size={12} />
                              </button>
                            </div>
                          </td>
                          <td className="px-6">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400 font-bold text-sm border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                                B
                              </div>
                              <div>
                                <div className="font-bold text-foreground/90 tracking-tight">{item.reason || "No reason specified"}</div>
                                <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-0.5">By: {item.added_by || "Reseller"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6">
                            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-red-500/20 bg-red-500/10 text-red-450">
                              BANNED
                            </div>
                          </td>
                          <td className="px-6 font-mono text-xs text-muted-foreground">
                            {formatTime(item.added_at)}
                          </td>
                          <td className="px-6 text-right">
                            <Btn variant="outline" size="sm" className="text-emerald-450 border-emerald-500/25 hover:bg-emerald-500/10 hover:border-emerald-550" onClick={() => removeBlacklistMutation.mutate(item.uid)}>
                              Unban UID
                            </Btn>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-20 text-center text-muted-foreground italic">
                          No blacklisted UIDs found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Blacklist View */}
              <div className="md:hidden divide-y divide-border/20">
                {blLoading ? (
                  <div className="py-20 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  </div>
                ) : filteredBlacklist && filteredBlacklist.length > 0 ? (
                  filteredBlacklist.map((item: any, idx: number) => (
                    <div key={item.uid} className="p-5 space-y-4 hover:bg-white/[0.01] transition-colors relative">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">
                            {(idx + 1).toString().padStart(2, '0')}
                          </span>
                          <span className="font-mono text-sm font-bold text-red-455 tracking-wider">{item.uid}</span>
                          <button onClick={() => { navigator.clipboard.writeText(item.uid); toast.success("UID copied"); }} className="text-muted-foreground/40 hover:text-primary transition-all">
                            <Copy size={12} />
                          </button>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-500/20 bg-red-500/10 text-red-450">
                          BANNED
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/10 text-red-400 font-bold text-[10px] border border-red-500/20">
                            B
                          </div>
                          <div>
                            <span className="font-semibold text-white block">{item.reason || "No reason specified"}</span>
                            <span className="text-[10px] text-muted-foreground/60 block">By: {item.added_by}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-[10px] text-muted-foreground block">{formatTime(item.added_at)}</span>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <Btn variant="outline" size="sm" className="text-emerald-450 border-emerald-500/20 hover:bg-emerald-500/10" onClick={() => removeBlacklistMutation.mutate(item.uid)}>
                          Unban UID
                        </Btn>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-muted-foreground italic text-sm">
                    No blacklisted UIDs found.
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* TAB 3: Logs */}
          {activeTab === "logs" && (
            <Card className="!p-0 border-border/40 overflow-hidden">
              <div className="p-4 bg-card/20 border-b border-white/5 flex justify-between items-center">
                <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">Bypass Login Attempts</span>
                <Btn variant="outline" size="sm" onClick={() => refetchLogs()}>
                  <RefreshCw size={12} /> Refresh logs
                </Btn>
              </div>
              {/* Desktop Table view */}
              <div className="hidden md:block overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm">
                  <thead className="bg-card/20 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground border-b border-white/5">
                    <tr>
                      <th className="py-4 px-6 w-32">Status</th>
                      <th className="px-6">UID</th>
                      <th className="px-6">Region</th>
                      <th className="px-6">IP Address</th>
                      <th className="px-6">Location</th>
                      <th className="px-6">Open ID</th>
                      <th className="px-6">Token</th>
                      <th className="px-6 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {logsLoading ? (
                      <tr>
                        <td colSpan={8} className="py-20 text-center">
                          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                        </td>
                      </tr>
                    ) : filteredLogs && filteredLogs.length > 0 ? (
                      filteredLogs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-primary/[0.02] transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                log.status === "allowed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" :
                                log.status === "blocked" ? "bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]" :
                                "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                              }`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${
                                  log.status === "allowed" ? "bg-emerald-400 animate-pulse" :
                                  log.status === "blocked" ? "bg-red-400" : "bg-amber-400 animate-pulse"
                                }`} />
                                {log.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-white tracking-wider">{log.uid}</span>
                              <button onClick={() => { navigator.clipboard.writeText(log.uid); toast.success("UID copied"); }} className="text-muted-foreground/40 hover:text-primary transition-all" title="Copy UID">
                                <Copy size={12} />
                              </button>
                              <button onClick={() => { setSelectedLogDetails(log); setIsDetailsModalOpen(true); }} className="text-muted-foreground/40 hover:text-primary transition-all" title="View Details">
                                <Info size={12} />
                              </button>
                            </div>
                          </td>
                           <td className="px-6">
                            <span className="font-semibold text-white bg-white/5 border border-white/5 rounded px-2 py-0.5 text-xs">{log.region || "GLOBAL"}</span>
                          </td>
                          <td className="px-6 font-mono text-xs text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <span>{log.ip || "Unknown IP"}</span>
                              {log.ip && (
                                <button onClick={() => { navigator.clipboard.writeText(log.ip); toast.success("IP copied"); }} className="text-muted-foreground/30 hover:text-primary transition-all">
                                  <Copy size={10} />
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="px-6">
                            <div className="flex flex-col">
                              <span className="text-white text-xs font-semibold">{log.city || "Unknown City"}</span>
                              <span className="text-[10px] text-muted-foreground">{log.country || "Unknown Country"}</span>
                            </div>
                          </td>
                          <td className="px-6">
                            <div className="flex items-center gap-2 max-w-[150px]">
                              {log.open_id ? (
                                <>
                                  <span className="font-mono text-xs text-muted-foreground truncate" title={log.open_id}>{log.open_id}</span>
                                  <button onClick={() => { navigator.clipboard.writeText(log.open_id); toast.success("Open ID copied"); }} className="text-muted-foreground/30 hover:text-primary transition-all flex-shrink-0">
                                    <Copy size={10} />
                                  </button>
                                </>
                              ) : (
                                <span className="text-[10px] text-muted-foreground/40 italic">N/A</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6">
                            {log.token ? (
                              <button
                                onClick={() => {
                                  setSelectedLogDetails(log);
                                  setIsDetailsModalOpen(true);
                                }}
                                className="text-xs text-primary font-bold hover:underline"
                              >
                                View Token
                              </button>
                            ) : (
                              <span className="text-[10px] text-muted-foreground/40 italic">N/A</span>
                            )}
                          </td>
                          <td className="px-6 text-right font-mono text-xs text-muted-foreground">
                            <div className="flex flex-col items-end">
                              <span className="text-white font-semibold">{new Date(log.ts * 1000).toLocaleTimeString()}</span>
                              <span className="text-[10px] text-muted-foreground/60">{new Date(log.ts * 1000).toLocaleDateString()}</span>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="py-20 text-center text-muted-foreground italic">
                          No bypass attempts found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile List View */}
              <div className="md:hidden divide-y divide-border/20">
                {logsLoading ? (
                  <div className="py-20 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                  </div>
                ) : filteredLogs && filteredLogs.length > 0 ? (
                  filteredLogs.map((log: any, idx: number) => (
                    <div key={log.id} className="p-4 space-y-4 hover:bg-white/[0.01] transition-colors relative">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">
                            {(idx + 1).toString().padStart(2, '0')}
                          </span>
                          <span className="font-mono text-sm font-bold text-white tracking-wider">{log.uid}</span>
                          <button onClick={() => { navigator.clipboard.writeText(log.uid); toast.success("UID copied"); }} className="text-muted-foreground/40 hover:text-primary transition-all">
                            <Copy size={12} />
                          </button>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                          log.status === "allowed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                          log.status === "blocked" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}>
                          {log.status}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <div>
                          <span className="font-semibold text-white bg-white/5 border border-white/5 rounded px-2 py-0.5 text-xs mr-2">{log.region || "GLOBAL"}</span>
                          <span>{log.ip || "Unknown IP"}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-white block">{log.city || "Unknown City"}</span>
                          <span className="text-[10px] text-muted-foreground block">{log.country || "Unknown Country"}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs pt-1">
                        <span className="text-[10px] font-mono text-muted-foreground/60">{new Date(log.ts * 1000).toLocaleString()}</span>
                        <button
                          onClick={() => { setSelectedLogDetails(log); setIsDetailsModalOpen(true); }}
                          className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                        >
                          <Info size={12} /> View Details
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-muted-foreground italic text-sm">
                    No bypass attempts found.
                  </div>
                )}
              </div>
            </Card>
          )}

      </div>

      {/* --- Modals Section --- */}

      {/* Whitelist Add Modal */}
      <AnimatePresence>
        {isWlModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong w-full max-w-md rounded-3xl p-8 shadow-2xl bg-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Whitelist a UID</h3>
                <button onClick={() => setIsWlModalOpen(false)} className="rounded-lg p-2 hover:bg-card"><X size={18} /></button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                addWhitelistMutation.mutate({
                  uid: formData.get("uid"),
                  duration: wlDuration,
                  region: wlRegion,
                  name: formData.get("name")
                });
              }} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Player UID</label>
                  <input required name="uid" type="text" placeholder="e.g. 10023498"
                    className="mt-2 w-full rounded-xl border border-border/60 bg-card/40 p-3 text-sm outline-none focus:border-primary/50 text-white font-mono" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Player Note / Name</label>
                  <input name="name" type="text" placeholder="e.g. customer name"
                    className="mt-2 w-full rounded-xl border border-border/60 bg-card/40 p-3 text-sm outline-none focus:border-primary/50 text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Region</label>
                    <div className="relative mt-2">
                      <button
                        type="button"
                        onClick={() => setIsWlRegionOpen(!isWlRegionOpen)}
                        className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-card/40 p-3 text-sm transition-all focus:border-primary/50 text-white font-bold"
                      >
                        <span>{wlRegion}</span>
                        <ChevronDown size={14} className={`transition-transform duration-300 ${isWlRegionOpen ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {isWlRegionOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsWlRegionOpen(false)} />
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute left-0 top-[calc(100%+8px)] z-20 w-full overflow-hidden rounded-xl border border-border/60 bg-card/95 p-1.5 backdrop-blur-xl shadow-2xl max-h-48 overflow-y-auto scrollbar-thin"
                            >
                              {REGIONS.map((reg) => (
                                <button
                                  key={reg}
                                  type="button"
                                  onClick={() => {
                                    setWlRegion(reg);
                                    setIsWlRegionOpen(false);
                                  }}
                                  className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-all ${wlRegion === reg ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}
                                >
                                  {reg}
                                </button>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Duration</label>
                    <div className="relative mt-2">
                      <button
                        type="button"
                        onClick={() => setIsWlDurationOpen(!isWlDurationOpen)}
                        className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-card/40 p-3 text-sm transition-all focus:border-primary/50 text-white font-bold"
                      >
                        <span>{DURATIONS.find((d) => d.value === wlDuration)?.label || wlDuration}</span>
                        <ChevronDown size={14} className={`transition-transform duration-300 ${isWlDurationOpen ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {isWlDurationOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsWlDurationOpen(false)} />
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="absolute right-0 top-[calc(100%+8px)] z-20 w-full overflow-hidden rounded-xl border border-border/60 bg-card/95 p-1.5 backdrop-blur-xl shadow-2xl"
                            >
                              {DURATIONS.map((dur) => (
                                <button
                                  key={dur.value}
                                  type="button"
                                  onClick={() => {
                                    setWlDuration(dur.value);
                                    setIsWlDurationOpen(false);
                                  }}
                                  className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-all ${wlDuration === dur.value ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}
                                >
                                  {dur.label}
                                </button>
                              ))}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
                <Btn type="submit" className="w-full justify-center py-6 mt-4" disabled={addWhitelistMutation.isPending}>
                  {addWhitelistMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : "Confirm Whitelist"}
                </Btn>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Blacklist / Ban Modal */}
      <AnimatePresence>
        {isBlModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong w-full max-w-md rounded-3xl p-8 shadow-2xl bg-card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-red-400">Ban a UID</h3>
                <button onClick={() => setIsBlModalOpen(false)} className="rounded-lg p-2 hover:bg-card"><X size={18} /></button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                addBlacklistMutation.mutate({
                  uid: formData.get("uid"),
                  reason: formData.get("reason")
                });
              }} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-red-300">Target UID</label>
                  <input required name="uid" type="text" placeholder="e.g. 10023498"
                    className="mt-2 w-full rounded-xl border border-red-500/20 bg-card/40 p-3 text-sm outline-none focus:border-red-500/50 text-white font-mono" />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-red-300">Ban Reason</label>
                  <textarea required name="reason" rows={3} placeholder="Describe the reason for blacklisting..."
                    className="mt-2 w-full rounded-xl border border-red-500/20 bg-card/40 p-3 text-sm outline-none focus:border-red-500/50 text-white" />
                </div>
                <Btn type="submit" className="w-full justify-center py-6 mt-4 bg-red-500 hover:bg-red-600 text-white border-none shadow-none" disabled={addBlacklistMutation.isPending}>
                  {addBlacklistMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : "Enforce Ban"}
                </Btn>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Extend Duration Modal */}
      <AnimatePresence>
        {isExtendModalOpen && selectedWl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-strong w-full max-w-sm rounded-3xl p-8 shadow-2xl bg-card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Extend Access</h3>
                  <p className="text-xs text-muted-foreground mt-1">UID: <span className="font-mono font-bold text-white">{selectedWl.uid}</span></p>
                </div>
                <button onClick={() => { setIsExtendModalOpen(false); setSelectedWl(null); }} className="rounded-lg p-2 hover:bg-card"><X size={18} /></button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                extendWhitelistMutation.mutate({
                  uid: selectedWl.uid,
                  duration: formData.get("duration") as string
                });
              }} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current Expiry</label>
                  <div className="mt-2 text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-xl p-3">
                    {selectedWl.expiry_formatted}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Add Extra Duration</label>
                  <input type="hidden" name="duration" value={extendDuration} />
                  <CustomSelect
                    value={extendDuration}
                    onChange={setExtendDuration}
                    options={[
                      { label: "12 Hours", value: "12h" },
                      { label: "1 Day", value: "1d" },
                      { label: "7 Days", value: "7d" },
                      { label: "30 Days", value: "30d" },
                      { label: "90 Days", value: "90d" },
                      { label: "Upgrade to Lifetime", value: "lifetime" }
                    ]}
                    className="mt-2 w-full"
                  />
                </div>
                <Btn type="submit" className="w-full justify-center py-6 mt-4" disabled={extendWhitelistMutation.isPending}>
                  {extendWhitelistMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : "Confirm Extension"}
                </Btn>
              </form>
            </motion.div>
          </motion.div>
        )}

        {isDetailsModalOpen && selectedLogDetails && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-xl rounded-3xl border border-white/10 bg-card/90 p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Bypass Token Inspector</h3>
                  <p className="text-xs text-muted-foreground mt-1">Detailed packet payload and credentials for this bypass request</p>
                </div>
                <button
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="rounded-full bg-white/5 p-2 hover:bg-white/10 text-muted-foreground hover:text-white transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
                {/* Status & Region Card */}
                <div className="relative flex items-center justify-between rounded-xl border border-white/5 bg-black/40 p-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block mb-1">Status & Region</span>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                        selectedLogDetails.status === "allowed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        selectedLogDetails.status === "blocked" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {selectedLogDetails.status}
                      </span>
                      <span className="font-semibold text-white bg-white/5 border border-white/5 rounded-md px-2 py-0.5 text-xs">{selectedLogDetails.region || "GLOBAL"}</span>
                    </div>
                  </div>
                </div>

                {/* Player UID Card */}
                <div className="relative flex items-center justify-between rounded-xl border border-white/5 bg-black/40 p-4 transition-all hover:bg-black/60">
                  <div className="flex-1 min-w-0 pr-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block mb-1">Player UID</span>
                    <span className="font-mono text-sm font-bold text-white tracking-wider select-all block truncate">{selectedLogDetails.uid}</span>
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(selectedLogDetails.uid); toast.success("UID copied"); }}
                    className="text-muted-foreground/45 hover:text-primary transition-all p-2 rounded-lg hover:bg-white/5 flex-shrink-0"
                    title="Copy UID"
                  >
                    <Copy size={16} />
                  </button>
                </div>

                {/* IP & Location Card */}
                <div className="relative flex items-center justify-between rounded-xl border border-white/5 bg-black/40 p-4 transition-all hover:bg-black/60">
                  <div className="flex-1 min-w-0 pr-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block mb-1">IP & Geolocation</span>
                    <span className="font-mono text-sm font-bold text-white tracking-wider select-all block truncate">
                      {selectedLogDetails.ip || "Unknown IP"} • {[selectedLogDetails.city, selectedLogDetails.country].filter(Boolean).join(", ") || "Unknown Location"}
                    </span>
                  </div>
                  <button
                    onClick={() => { navigator.clipboard.writeText(selectedLogDetails.ip || ""); toast.success("IP copied"); }}
                    className="text-muted-foreground/45 hover:text-primary transition-all p-2 rounded-lg hover:bg-white/5 flex-shrink-0"
                    title="Copy IP"
                  >
                    <Copy size={16} />
                  </button>
                </div>

                {/* Timestamp Card */}
                <div className="relative flex items-center justify-between rounded-xl border border-white/5 bg-black/40 p-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block mb-1">Request Timestamp</span>
                    <span className="text-sm font-bold text-white tracking-wide block">{new Date(selectedLogDetails.ts * 1000).toLocaleString()}</span>
                  </div>
                </div>

                {/* Open ID Card */}
                <div className="relative flex items-center justify-between rounded-xl border border-white/5 bg-black/40 p-4 transition-all hover:bg-black/60">
                  <div className="flex-1 min-w-0 pr-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block mb-1">Open ID</span>
                    <span className="font-mono text-sm font-bold text-white tracking-wider select-all block truncate">
                      {selectedLogDetails.open_id || "N/A"}
                    </span>
                  </div>
                  {selectedLogDetails.open_id && (
                    <button
                      onClick={() => { navigator.clipboard.writeText(selectedLogDetails.open_id); toast.success("Open ID copied"); }}
                      className="text-muted-foreground/45 hover:text-primary transition-all p-2 rounded-lg hover:bg-white/5 flex-shrink-0"
                      title="Copy Open ID"
                    >
                      <Copy size={16} />
                    </button>
                  )}
                </div>

                {/* Access Token Card */}
                <div className="relative flex items-start justify-between rounded-xl border border-white/5 bg-black/40 p-4 transition-all hover:bg-black/60">
                  <div className="flex-1 min-w-0 pr-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 block mb-1">Access Token</span>
                    {selectedLogDetails.token ? (
                      <span className="font-mono text-xs font-semibold text-emerald-400 select-all block break-all whitespace-pre-wrap max-h-32 overflow-y-auto scrollbar-thin">
                        {selectedLogDetails.token}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/40 italic block mt-1">No token associated with this entry</span>
                    )}
                  </div>
                  {selectedLogDetails.token && (
                    <button
                      onClick={() => { navigator.clipboard.writeText(selectedLogDetails.token); toast.success("Access Token copied"); }}
                      className="text-muted-foreground/45 hover:text-primary transition-all p-2 rounded-lg hover:bg-white/5 flex-shrink-0 mt-1"
                      title="Copy Access Token"
                    >
                      <Copy size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Btn variant="outline" onClick={() => setIsDetailsModalOpen(false)}>Close Inspector</Btn>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={isPurgeOpen}
        onClose={() => setIsPurgeOpen(false)}
        onConfirm={() => purgeExpiredMutation.mutate()}
        loading={purgeExpiredMutation.isPending}
        title="Purge Expired UIDs"
        message="Are you sure you want to remove all expired bypass whitelist records? This action is permanent."
      />

    </div>
  );
}

// Mini components
function MiniStatCard({ label, value, icon: Icon, accent = "primary" }: { label: string; value: number | string; icon: any; accent?: "primary" | "success" | "danger" }) {
  const accentColors = {
    primary: "text-primary border-primary/20 bg-primary/5",
    success: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    danger: "text-red-400 border-red-500/20 bg-red-500/5"
  };
  
  return (
    <Card className={`flex flex-col p-4 border relative overflow-hidden backdrop-blur-xl ${accentColors[accent]}`}>
      <div className="absolute right-2 top-2 opacity-10">
        <Icon size={32} />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-1">{label}</span>
      <span className="text-xl font-bold font-display text-white">{value}</span>
    </Card>
  );
}
