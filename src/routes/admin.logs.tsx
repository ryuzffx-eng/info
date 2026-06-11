import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Badge, Btn } from "@/components/admin/ui";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  Loader2, 
  ScrollText, 
  Webhook, 
  Save, 
  Search, 
  Key, 
  Users, 
  Activity, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  AlertTriangle,
  Flame
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/logs")({ component: Logs });

function Logs() {
  const [activeTab, setActiveTab] = useState<"logs" | "webhooks">("logs");
  const [logsSubTab, setLogsSubTab] = useState<"all" | "license" | "users" | "bypass">("all");
  const [webhooksSubTab, setWebhooksSubTab] = useState<"general" | "licenses" | "users" | "bypass">("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const [webhooksState, setWebhooksState] = useState({
    webhook_url: "",
    webhook_web_login: "",
    webhook_software_login: "",
    webhook_system_logs: "",
    webhook_licenses: "",
    webhook_users: "",
    webhook_bypass: "",
    webhook_bot_name: "",
    webhook_bot_avatar: "",
    discord_log_web_login: "true",
    discord_log_licenses: "true",
    discord_log_users: "true",
    discord_log_bypass: "true",

    // Separate license webhooks
    webhook_license_creation: "",
    webhook_license_delete: "",
    webhook_license_used: "",
    webhook_license_reset_hwid: "",
    discord_log_license_creation: "true",
    discord_log_license_delete: "true",
    discord_log_license_used: "true",
    discord_log_license_reset_hwid: "true",

    // Separate user webhooks
    webhook_user_auth: "",
    discord_log_user_auth: "true",

    // Separate bypass webhooks
    webhook_bypass_add: "",
    webhook_bypass_search: "",
    webhook_bypass_blacklist: "",
    webhook_bypass_delete: "",
    webhook_bypass_extend: "",
    discord_log_bypass_add: "true",
    discord_log_bypass_search: "true",
    discord_log_bypass_blacklist: "true",
    discord_log_bypass_delete: "true",
    discord_log_bypass_extend: "true",

    // UID Login webhooks
    webhook_uid_login_success: "",
    webhook_uid_login_failed: "",
    discord_log_uid_login_success: "true",
    discord_log_uid_login_failed: "true"
  });

  const { data: logs, isLoading: isLogsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ["admin-logs"],
    queryFn: api.admin.getLogs,
  });

  const { data: bypassLogs, isLoading: isBypassLogsLoading, refetch: refetchBypass } = useQuery({
    queryKey: ["admin-bypass-logs"],
    queryFn: () => api.bypass.getLogs(undefined, 100),
    enabled: activeTab === "logs" && logsSubTab === "bypass"
  });

  const { data: settings, isLoading: isSettingsLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: api.admin.getSettings,
  });

  useEffect(() => {
    if (settings) {
      setWebhooksState({
        webhook_url: settings.webhook_url ?? "",
        webhook_web_login: settings.webhook_web_login ?? "",
        webhook_software_login: settings.webhook_software_login ?? "",
        webhook_system_logs: settings.webhook_system_logs ?? "",
        webhook_licenses: settings.webhook_licenses ?? "",
        webhook_users: settings.webhook_users ?? "",
        webhook_bypass: settings.webhook_bypass ?? "",
        webhook_bot_name: settings.webhook_bot_name ?? "",
        webhook_bot_avatar: settings.webhook_bot_avatar ?? "",
        discord_log_web_login: settings.discord_log_web_login ?? "true",
        discord_log_licenses: settings.discord_log_licenses ?? "true",
        discord_log_users: settings.discord_log_users ?? "true",
        discord_log_bypass: settings.discord_log_bypass ?? "true",

        // Separate license webhooks
        webhook_license_creation: settings.webhook_license_creation ?? "",
        webhook_license_delete: settings.webhook_license_delete ?? "",
        webhook_license_used: settings.webhook_license_used ?? "",
        webhook_license_reset_hwid: settings.webhook_license_reset_hwid ?? "",
        discord_log_license_creation: settings.discord_log_license_creation ?? "true",
        discord_log_license_delete: settings.discord_log_license_delete ?? "true",
        discord_log_license_used: settings.discord_log_license_used ?? "true",
        discord_log_license_reset_hwid: settings.discord_log_license_reset_hwid ?? "true",

        // Separate user webhooks
        webhook_user_auth: settings.webhook_user_auth ?? "",
        discord_log_user_auth: settings.discord_log_user_auth ?? "true",

        // Separate bypass webhooks
        webhook_bypass_add: settings.webhook_bypass_add ?? "",
        webhook_bypass_search: settings.webhook_bypass_search ?? "",
        webhook_bypass_blacklist: settings.webhook_bypass_blacklist ?? "",
        webhook_bypass_delete: settings.webhook_bypass_delete ?? "",
        webhook_bypass_extend: settings.webhook_bypass_extend ?? "",
        discord_log_bypass_add: settings.discord_log_bypass_add ?? "true",
        discord_log_bypass_search: settings.discord_log_bypass_search ?? "true",
        discord_log_bypass_blacklist: settings.discord_log_bypass_blacklist ?? "true",
        discord_log_bypass_delete: settings.discord_log_bypass_delete ?? "true",
        discord_log_bypass_extend: settings.discord_log_bypass_extend ?? "true",

        // UID Login webhooks
        webhook_uid_login_success: settings.webhook_uid_login_success ?? "",
        webhook_uid_login_failed: settings.webhook_uid_login_failed ?? "",
        discord_log_uid_login_success: settings.discord_log_uid_login_success ?? "true",
        discord_log_uid_login_failed: settings.discord_log_uid_login_failed ?? "true"
      });
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: (data: Record<string, string>) => api.admin.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Webhook settings updated successfully!");
    },
    onError: (err: any) => {
      toast.error(`Failed to update settings: ${err.message}`);
    }
  });

  const handleSave = () => {
    mutation.mutate(webhooksState);
  };

  const updateWebhook = (key: keyof typeof webhooksState, val: string) => {
    setWebhooksState(prev => ({ ...prev, [key]: val }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const triggerRefresh = () => {
    if (logsSubTab === "bypass") {
      refetchBypass();
    }
    refetchLogs();
    toast.success("Logs reloaded.");
  };

  // Filter Logic for system logs
  const filterSystemLogs = (items: any[]) => {
    if (!items) return [];
    
    let filtered = items;
    
    // Sub-tab classification
    if (logsSubTab === "license") {
      filtered = items.filter((l: any) => {
        const msg = l.message.toLowerCase();
        const action = l.context?.action;
        const isLicenseAction = action && ["creation", "delete", "used", "reset_hwid"].includes(action);
        const hasLicenseContext = l.context && (l.context.license_id || l.context.key || l.context.license_key || l.context.app_id);
        return isLicenseAction || hasLicenseContext || msg.includes("license") || msg.includes("credits") || msg.includes("generated") || msg.includes("hwid reset");
      });
    } else if (logsSubTab === "users") {
      filtered = items.filter((l: any) => {
        const msg = l.message.toLowerCase();
        const action = l.context?.action;
        const isUserAction = action && ["login", "signup", "promote_reseller", "add_credits"].includes(action);
        const hasUserContext = l.context && (l.context.target_user || l.context.deleted_user || l.context.user_id || l.context.email);
        return isUserAction || hasUserContext || msg.includes("user") || msg.includes("admin") || msg.includes("reseller") || msg.includes("logged in") || msg.includes("registered") || msg.includes("signed up");
      });
    } else if (logsSubTab === "bypass") {
      filtered = items.filter((l: any) => {
        const msg = l.message.toLowerCase();
        const action = l.context?.action;
        const isBypassAction = action && ["add", "delete", "extend", "blacklist", "search"].includes(action);
        const hasBypassContext = l.context && (l.context.uid || l.context.region);
        return isBypassAction || hasBypassContext || msg.includes("uid") || msg.includes("whitelist") || msg.includes("blacklist") || msg.includes("bypass") || msg.includes("whitelisted") || msg.includes("blacklisted") || msg.includes("banned") || msg.includes("unbanned");
      });
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((l: any) => {
        const msgMatch = l.message.toLowerCase().includes(q);
        const levelMatch = l.level.toLowerCase().includes(q);
        const contextMatch = l.context ? JSON.stringify(l.context).toLowerCase().includes(q) : false;
        return msgMatch || levelMatch || contextMatch;
      });
    }

    return filtered;
  };

  // Filter for client bypass login events
  const filterBypassLoginLogs = (items: any[]) => {
    if (!items) return [];
    if (!searchQuery.trim()) return items;
    
    const q = searchQuery.toLowerCase();
    return items.filter((r: any) => {
      return (
        (r.uid && r.uid.toLowerCase().includes(q)) ||
        (r.ip && r.ip.toLowerCase().includes(q)) ||
        (r.country && r.country.toLowerCase().includes(q)) ||
        (r.region && r.region.toLowerCase().includes(q)) ||
        (r.status && r.status.toLowerCase().includes(q)) ||
        (r.token && r.token.toLowerCase().includes(q))
      );
    });
  };

  const processedSystemLogs = filterSystemLogs(logs || []);
  const processedBypassLoginLogs = filterBypassLoginLogs(bypassLogs || []);

  const isLoading = activeTab === "logs" ? isLogsLoading : isSettingsLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader title="Logs" subtitle="System events, audit trail, and webhook integrations." />
        
        {/* Navigation Tabs */}
        <div className="flex rounded-xl bg-card/60 p-1 border border-white/[0.04] backdrop-blur-xl">
          <button
            onClick={() => setActiveTab("logs")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "logs"
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            <ScrollText size={14} /> Audit & Activity Logs
          </button>
          <button
            onClick={() => setActiveTab("webhooks")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              activeTab === "webhooks"
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                : "text-muted-foreground hover:text-white"
            }`}
          >
            <Webhook size={14} /> Discord Webhooks
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : activeTab === "logs" ? (
        <div className="space-y-5">
          {/* Enhanced Sub-tab Bar & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/40 border border-white/[0.04] p-3 rounded-2xl backdrop-blur-xl">
            {/* Sub Tabs */}
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setLogsSubTab("all")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  logsSubTab === "all"
                    ? "bg-white/[0.08] text-white border border-white/[0.08]"
                    : "text-muted-foreground hover:text-white hover:bg-white/[0.02] border border-transparent"
                }`}
              >
                <ScrollText size={13} />
                All Logs
              </button>
              <button
                onClick={() => setLogsSubTab("license")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  logsSubTab === "license"
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-white hover:bg-white/[0.02] border border-transparent"
                }`}
              >
                <Key size={13} />
                License Audits
              </button>
              <button
                onClick={() => setLogsSubTab("users")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  logsSubTab === "users"
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : "text-muted-foreground hover:text-white hover:bg-white/[0.02] border border-transparent"
                }`}
              >
                <Users size={13} />
                User Audits
              </button>
              <button
                onClick={() => setLogsSubTab("bypass")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                  logsSubTab === "bypass"
                    ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                    : "text-muted-foreground hover:text-white hover:bg-white/[0.02] border border-transparent"
                }`}
              >
                <Activity size={13} />
                Bypass Activity
              </button>
            </div>

            {/* Actions: Search & Reload */}
            <div className="flex items-center gap-3">
              <div className="relative w-full sm:w-60">
                <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-border/60 bg-background/40 text-xs outline-none focus:border-primary/50 transition-all font-medium text-zinc-300 placeholder:text-zinc-600 focus:bg-background/80"
                />
              </div>
              <button
                onClick={triggerRefresh}
                className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-card/60 border border-white/[0.04] text-muted-foreground hover:text-white hover:bg-card/90 transition-all active:scale-95"
                title="Refresh Logs"
              >
                <RefreshCw size={13} />
              </button>
            </div>
          </div>

          {/* Logs View Grid */}
          <div className="space-y-6">
            {/* System Audit Logs Section */}
            <Card className="overflow-hidden !p-0">
              <div className="flex items-center justify-between border-b border-white/[0.04] px-5 py-4 bg-card/25">
                <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                  {logsSubTab === "all" ? "System Audit Trail" : `${logsSubTab.charAt(0).toUpperCase() + logsSubTab.slice(1)} Audit Logs`}
                </span>
                <Badge tone="muted" className="text-[10px] font-bold px-2 py-0.5">
                  {processedSystemLogs.length} events
                </Badge>
              </div>
              <div className="scrollbar-thin max-h-[500px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-[var(--bg-deep)]/90 backdrop-blur-xl text-left text-xs uppercase tracking-wider text-muted-foreground backdrop-blur border-b border-white/[0.02]">
                    <tr>
                      <th className="px-5 py-3 font-bold">Time</th>
                      <th className="px-3 font-bold">Level</th>
                      <th className="px-3 font-bold">Action / Message</th>
                      <th className="px-5 font-bold text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono text-xs divide-y divide-border/20">
                    {processedSystemLogs.map((l: any, i: number) => (
                      <tr key={i} className="hover:bg-white/[0.01] transition-all">
                        <td className="whitespace-nowrap px-5 py-3.5 text-zinc-500 font-sans">
                          {new Date(l.created_at).toLocaleString()}
                        </td>
                        <td className="px-3">
                          <Badge 
                            tone={l.level.toLowerCase() === "error" ? "danger" : l.level.toLowerCase() === "warning" || l.level.toLowerCase() === "warn" ? "warning" : "muted"} 
                            className="text-[9px] px-2 py-0.5 font-bold uppercase"
                          >
                            {l.level}
                          </Badge>
                        </td>
                        <td className="px-3 py-3.5 text-zinc-300 font-sans font-medium">
                          {l.message}
                        </td>
                        <td className="px-5 py-3.5 text-right font-sans">
                          {l.context ? (
                            <div className="inline-flex flex-wrap gap-1 justify-end max-w-md">
                              {Object.entries(l.context).map(([k, v]: [string, any]) => (
                                <span key={k} className="inline-flex items-center gap-1 rounded bg-white/[0.03] border border-white/[0.04] px-1.5 py-0.5 text-[10px] text-zinc-400 font-mono">
                                  <span className="text-zinc-600">{k}:</span>
                                  <span className="text-zinc-300 max-w-[120px] truncate" title={String(v)}>
                                    {typeof v === "object" ? JSON.stringify(v) : String(v)}
                                  </span>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-zinc-600 italic">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {processedSystemLogs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-20 text-center text-muted-foreground italic font-sans">No audit events matching criteria.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Special Client Bypass Intercept Activity (Only visible in Bypass sub-tab) */}
            {logsSubTab === "bypass" && (
              <Card className="overflow-hidden !p-0 border border-purple-500/10 shadow-[0_0_20px_rgba(168,85,247,0.02)]">
                <div className="flex items-center justify-between border-b border-purple-500/10 px-5 py-4 bg-purple-950/5">
                  <div className="flex items-center gap-2">
                    <Flame size={14} className="text-purple-400 animate-pulse" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-purple-400">
                      Real-time Bypass Intercept Activity
                    </span>
                  </div>
                  <Badge tone="muted" className="text-[10px] font-bold px-2 py-0.5 border border-purple-500/20 bg-purple-500/5 text-purple-300">
                    {processedBypassLoginLogs.length} clients logged
                  </Badge>
                </div>
                
                {isBypassLogsLoading ? (
                  <div className="flex py-20 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                  </div>
                ) : (
                  <div className="scrollbar-thin max-h-[500px] overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-[var(--bg-deep)]/90 backdrop-blur-xl text-left text-xs uppercase tracking-wider text-muted-foreground backdrop-blur border-b border-white/[0.02]">
                        <tr>
                          <th className="px-5 py-3 font-bold">Timestamp</th>
                          <th className="px-3 font-bold">UID</th>
                          <th className="px-3 font-bold">IP & Location</th>
                          <th className="px-3 font-bold">Status</th>
                          <th className="px-5 font-bold">Auth payload</th>
                        </tr>
                      </thead>
                      <tbody className="font-mono text-xs divide-y divide-border/20">
                        {processedBypassLoginLogs.map((r: any) => {
                          const isSuccess = r.status?.includes("WHITELIST") || r.status?.includes("ALLOWED");
                          const isExpired = r.status?.includes("EXPIRED");
                          const isBlocked = r.status?.includes("BLACKLISTED") || r.status?.includes("BLOCKED");
                          
                          return (
                            <tr key={r.id} className="hover:bg-white/[0.01] transition-all">
                              <td className="whitespace-nowrap px-5 py-3 text-zinc-500 font-sans">
                                {r.ts ? new Date(r.ts * 1000).toLocaleString() : "Unknown"}
                              </td>
                              <td className="px-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-zinc-300 font-bold font-mono">{r.uid}</span>
                                  <button
                                    onClick={() => copyToClipboard(r.uid, `uid-${r.id}`)}
                                    className="p-1 rounded text-zinc-600 hover:text-white hover:bg-white/5 transition-all"
                                    title="Copy UID"
                                  >
                                    {copiedId === `uid-${r.id}` ? <Check size={11} className="text-primary" /> : <Copy size={11} />}
                                  </button>
                                </div>
                              </td>
                              <td className="px-3 font-sans">
                                <div className="text-zinc-300 font-mono text-[11px]">{r.ip || "Unknown"}</div>
                                <div className="text-[10px] text-zinc-500 font-medium">
                                  {r.city || r.country ? `${r.city || "Unknown"}, ${r.country || "Unknown"}` : "Location Unknown"}
                                </div>
                              </td>
                              <td className="px-3">
                                <Badge 
                                  tone={isSuccess ? "success" : isExpired ? "warning" : isBlocked ? "danger" : "muted"} 
                                  className="text-[9px] px-2 py-0.5 font-bold uppercase"
                                >
                                  {r.status || "Unknown"}
                                </Badge>
                              </td>
                              <td className="px-5 py-3 text-zinc-400 font-sans">
                                <div className="space-y-1">
                                  {r.open_id && (
                                    <div className="flex items-center gap-1 text-[10px]">
                                      <span className="text-zinc-600 font-mono">OpenID:</span>
                                      <span className="font-mono text-zinc-300 max-w-[120px] truncate" title={r.open_id}>{r.open_id}</span>
                                      <button onClick={() => copyToClipboard(r.open_id, `oid-${r.id}`)} className="text-zinc-700 hover:text-zinc-300"><Copy size={9} /></button>
                                    </div>
                                  )}
                                  {r.token && (
                                    <div className="flex items-center gap-1 text-[10px]">
                                      <span className="text-zinc-600 font-mono">Token:</span>
                                      <span className="font-mono text-purple-400 max-w-[120px] truncate" title={r.token}>{r.token}</span>
                                      <button onClick={() => copyToClipboard(r.token, `tok-${r.id}`)} className="text-zinc-700 hover:text-zinc-300"><Copy size={9} /></button>
                                    </div>
                                  )}
                                  {!r.open_id && !r.token && <span className="text-zinc-600 italic text-[11px]">No token payload</span>}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                        {processedBypassLoginLogs.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-20 text-center text-muted-foreground italic font-sans">No client intercept logs captured.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6 w-full">
          {/* Sub Tabs for Webhooks */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.05] pb-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setWebhooksSubTab("general")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  webhooksSubTab === "general"
                    ? "bg-zinc-800 text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                    : "text-muted-foreground hover:bg-zinc-900/50 hover:text-white"
                }`}
              >
                <Webhook size={14} />
                General & Branding
              </button>
              <button
                type="button"
                onClick={() => setWebhooksSubTab("licenses")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  webhooksSubTab === "licenses"
                    ? "bg-zinc-800 text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                    : "text-muted-foreground hover:bg-zinc-900/50 hover:text-white"
                }`}
              >
                <Key size={14} />
                License Webhooks
              </button>
              <button
                type="button"
                onClick={() => setWebhooksSubTab("users")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  webhooksSubTab === "users"
                    ? "bg-zinc-800 text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                    : "text-muted-foreground hover:bg-zinc-900/50 hover:text-white"
                }`}
              >
                <Users size={14} />
                User Webhooks
              </button>
              <button
                type="button"
                onClick={() => setWebhooksSubTab("bypass")}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  webhooksSubTab === "bypass"
                    ? "bg-zinc-800 text-white shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
                    : "text-muted-foreground hover:bg-zinc-900/50 hover:text-white"
                }`}
              >
                <Activity size={14} />
                Bypass Webhooks
              </button>
            </div>
          </div>

          {webhooksSubTab === "general" && (
            <div className="grid gap-6 lg:grid-cols-3 max-w-6xl w-full">
              {/* Webhook URLs Endpoints */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <div className="flex items-center gap-3 border-b border-white/[0.05] pb-4 mb-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Webhook size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">General Endpoints</h3>
                      <p className="text-[11px] text-zinc-500 font-medium">Configure primary webhook channels and core dashboard system alerts.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <WebhookField 
                      label="Global Webhook (All Events Fallback)" 
                      description="Receives all logs, events, and actions. You can use this single webhook for everything, or as a global backup."
                      placeholder="https://discord.com/api/webhooks/... , https://discord.com/api/webhooks/..." 
                      value={webhooksState.webhook_url} 
                      onChangeText={(val) => updateWebhook("webhook_url", val)} 
                    />
                    <div className="grid gap-6 md:grid-cols-2">
                      <WebhookField 
                        label="Web Login Webhook" 
                        description="Triggered when administrators or resellers sign into the web panel dashboard."
                        placeholder="https://discord.com/api/webhooks/..." 
                        value={webhooksState.webhook_web_login} 
                        onChangeText={(val) => updateWebhook("webhook_web_login", val)} 
                      />
                      <WebhookField 
                        label="Software Login Webhook" 
                        description="Triggered on bypass software client/proxy checks and executions."
                        placeholder="https://discord.com/api/webhooks/..." 
                        value={webhooksState.webhook_software_login} 
                        onChangeText={(val) => updateWebhook("webhook_software_login", val)} 
                      />
                    </div>
                    <WebhookField 
                      label="System Logs Webhook" 
                      description="Triggered on all other non-categorized administrative and system changes."
                      placeholder="https://discord.com/api/webhooks/..." 
                      value={webhooksState.webhook_system_logs} 
                      onChangeText={(val) => updateWebhook("webhook_system_logs", val)} 
                    />
                  </div>
                </Card>
              </div>

              {/* Sender Customization & Filters */}
              <div className="space-y-6 flex flex-col justify-between">
                <div className="space-y-6">
                  <Card>
                    <div className="flex items-center gap-3 border-b border-white/[0.05] pb-4 mb-5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                        <Activity size={18} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">Bot Identity</h3>
                        <p className="text-[11px] text-zinc-500 font-medium">Customize the name and profile image of the webhook bot.</p>
                      </div>
                    </div>

                    <div className="space-y-5">
                      <WebhookField 
                        label="Custom Bot Username" 
                        description="Overrides default sender username for all Discord webhooks."
                        placeholder="e.g. Emerite Logs" 
                        value={webhooksState.webhook_bot_name} 
                        onChangeText={(val) => updateWebhook("webhook_bot_name", val)} 
                      />
                      <WebhookField 
                        label="Custom Bot Avatar URL" 
                        description="Overrides default sender avatar picture. Must be a direct image URL."
                        placeholder="https://example.com/logo.png" 
                        value={webhooksState.webhook_bot_avatar} 
                        onChangeText={(val) => updateWebhook("webhook_bot_avatar", val)} 
                      />
                    </div>
                  </Card>

                  <Card>
                    <div className="flex items-center gap-3 border-b border-white/[0.05] pb-4 mb-5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <ShieldCheck size={18} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">Logging Toggles</h3>
                        <p className="text-[11px] text-zinc-500 font-medium">Select which categories of system activity trigger webhooks.</p>
                      </div>
                    </div>

                    <div className="grid gap-3">
                      <ToggleRow 
                        label="Web Logins" 
                        checked={webhooksState.discord_log_web_login !== "false"} 
                        onChange={(checked) => updateWebhook("discord_log_web_login", checked ? "true" : "false")} 
                      />
                    </div>
                  </Card>
                </div>

                <div className="pt-2">
                  <Btn onClick={handleSave} disabled={mutation.isPending} className="w-full flex items-center justify-center gap-2 py-3.5 shadow-[var(--shadow-glow)]">
                    {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save Discord Settings
                  </Btn>
                </div>
              </div>
            </div>
          )}

          {webhooksSubTab === "licenses" && (
            <div className="grid gap-6 lg:grid-cols-3 max-w-6xl w-full">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <div className="flex items-center gap-3 border-b border-white/[0.05] pb-4 mb-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Key size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">License Webhooks</h3>
                      <p className="text-[11px] text-zinc-500 font-medium">Configure granular Discord alert webhooks for each licensing action.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <WebhookField 
                      label="License Creation Webhook URL" 
                      description="Enter the channel webhook URL specifically for license creation."
                      placeholder="https://discord.com/api/webhooks/..." 
                      value={webhooksState.webhook_license_creation} 
                      onChangeText={(val) => updateWebhook("webhook_license_creation", val)} 
                    />
                    <WebhookField 
                      label="License Deletion Webhook URL" 
                      description="Enter the channel webhook URL specifically for license deletion."
                      placeholder="https://discord.com/api/webhooks/..." 
                      value={webhooksState.webhook_license_delete} 
                      onChangeText={(val) => updateWebhook("webhook_license_delete", val)} 
                    />
                    <WebhookField 
                      label="License Used Webhook URL" 
                      description="Enter the channel webhook URL specifically for software client logins."
                      placeholder="https://discord.com/api/webhooks/..." 
                      value={webhooksState.webhook_license_used} 
                      onChangeText={(val) => updateWebhook("webhook_license_used", val)} 
                    />
                    <WebhookField 
                      label="HWID Reset Webhook URL" 
                      description="Enter the channel webhook URL specifically for license HWID resets."
                      placeholder="https://discord.com/api/webhooks/..." 
                      value={webhooksState.webhook_license_reset_hwid} 
                      onChangeText={(val) => updateWebhook("webhook_license_reset_hwid", val)} 
                    />
                  </div>
                </Card>
              </div>

              <div className="space-y-6 flex flex-col justify-between">
                <Card>
                  <div className="flex items-center gap-3 border-b border-white/[0.05] pb-4 mb-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">Logging Toggles</h3>
                      <p className="text-[11px] text-zinc-500 font-medium">Mute or activate license logging alerts individually.</p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <ToggleRow 
                      label="Log License Creation" 
                      checked={webhooksState.discord_log_license_creation !== "false"} 
                      onChange={(checked) => updateWebhook("discord_log_license_creation", checked ? "true" : "false")} 
                    />
                    <ToggleRow 
                      label="Log License Deletion" 
                      checked={webhooksState.discord_log_license_delete !== "false"} 
                      onChange={(checked) => updateWebhook("discord_log_license_delete", checked ? "true" : "false")} 
                    />
                    <ToggleRow 
                      label="Log License Usage" 
                      checked={webhooksState.discord_log_license_used !== "false"} 
                      onChange={(checked) => updateWebhook("discord_log_license_used", checked ? "true" : "false")} 
                    />
                    <ToggleRow 
                      label="Log HWID Resets" 
                      checked={webhooksState.discord_log_license_reset_hwid !== "false"} 
                      onChange={(checked) => updateWebhook("discord_log_license_reset_hwid", checked ? "true" : "false")} 
                    />
                  </div>
                </Card>

                <div className="pt-2">
                  <Btn onClick={handleSave} disabled={mutation.isPending} className="w-full flex items-center justify-center gap-2 py-3.5 shadow-[var(--shadow-glow)]">
                    {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save Discord Settings
                  </Btn>
                </div>
              </div>
            </div>
          )}

          {webhooksSubTab === "users" && (
            <div className="grid gap-6 lg:grid-cols-3 max-w-6xl w-full">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <div className="flex items-center gap-3 border-b border-white/[0.05] pb-4 mb-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Users size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">User Webhooks</h3>
                      <p className="text-[11px] text-zinc-500 font-medium">Configure Discord alerts for user account actions.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <WebhookField 
                      label="User Auth Webhook URL" 
                      description="Enter the channel webhook URL specifically for user profile signups and logins."
                      placeholder="https://discord.com/api/webhooks/..." 
                      value={webhooksState.webhook_user_auth} 
                      onChangeText={(val) => updateWebhook("webhook_user_auth", val)} 
                    />
                  </div>
                </Card>
              </div>

              <div className="space-y-6 flex flex-col justify-between">
                <Card>
                  <div className="flex items-center gap-3 border-b border-white/[0.05] pb-4 mb-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">Logging Toggles</h3>
                      <p className="text-[11px] text-zinc-500 font-medium">Mute or activate user account alert notifications.</p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <ToggleRow 
                      label="Log User Auth Events" 
                      checked={webhooksState.discord_log_user_auth !== "false"} 
                      onChange={(checked) => updateWebhook("discord_log_user_auth", checked ? "true" : "false")} 
                    />
                  </div>
                </Card>

                <div className="pt-2">
                  <Btn onClick={handleSave} disabled={mutation.isPending} className="w-full flex items-center justify-center gap-2 py-3.5 shadow-[var(--shadow-glow)]">
                    {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save Discord Settings
                  </Btn>
                </div>
              </div>
            </div>
          )}

          {webhooksSubTab === "bypass" && (
            <div className="grid gap-6 lg:grid-cols-3 max-w-6xl w-full">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <div className="flex items-center gap-3 border-b border-white/[0.05] pb-4 mb-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Activity size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">Bypass Webhooks</h3>
                      <p className="text-[11px] text-zinc-500 font-medium">Configure granular Discord alert webhooks for each bypass management action.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <WebhookField 
                      label="Bypass UID Whitelist Add Webhook URL" 
                      description="Enter the channel webhook URL specifically for whitelisting a player's UID."
                      placeholder="https://discord.com/api/webhooks/..." 
                      value={webhooksState.webhook_bypass_add} 
                      onChangeText={(val) => updateWebhook("webhook_bypass_add", val)} 
                    />
                    <WebhookField 
                      label="Bypass UID Search Webhook URL" 
                      description="Enter the channel webhook URL specifically for searching a player's UID."
                      placeholder="https://discord.com/api/webhooks/..." 
                      value={webhooksState.webhook_bypass_search} 
                      onChangeText={(val) => updateWebhook("webhook_bypass_search", val)} 
                    />
                    <WebhookField 
                      label="Bypass UID Blacklist Webhook URL" 
                      description="Enter the channel webhook URL specifically for blacklisting/banning a player's UID."
                      placeholder="https://discord.com/api/webhooks/..." 
                      value={webhooksState.webhook_bypass_blacklist} 
                      onChangeText={(val) => updateWebhook("webhook_bypass_blacklist", val)} 
                    />
                    <WebhookField 
                      label="Bypass UID Whitelist Delete Webhook URL" 
                      description="Enter the channel webhook URL specifically for deleting whitelisted/blacklisted player UID access."
                      placeholder="https://discord.com/api/webhooks/..." 
                      value={webhooksState.webhook_bypass_delete} 
                      onChangeText={(val) => updateWebhook("webhook_bypass_delete", val)} 
                    />
                    <WebhookField 
                      label="Bypass UID Extend Webhook URL" 
                      description="Enter the channel webhook URL specifically for extending whitelisted player UID access."
                      placeholder="https://discord.com/api/webhooks/..." 
                      value={webhooksState.webhook_bypass_extend} 
                      onChangeText={(val) => updateWebhook("webhook_bypass_extend", val)} 
                    />
                    <WebhookField 
                      label="Bypass UID Login Success Webhook URL" 
                      description="Enter the channel webhook URL specifically for whitelisted client login intercepts."
                      placeholder="https://discord.com/api/webhooks/..." 
                      value={webhooksState.webhook_uid_login_success} 
                      onChangeText={(val) => updateWebhook("webhook_uid_login_success", val)} 
                    />
                    <WebhookField 
                      label="Bypass UID Login Failed Webhook URL" 
                      description="Enter the channel webhook URL specifically for expired, blacklisted, or unknown client logins."
                      placeholder="https://discord.com/api/webhooks/..." 
                      value={webhooksState.webhook_uid_login_failed} 
                      onChangeText={(val) => updateWebhook("webhook_uid_login_failed", val)} 
                    />
                  </div>
                </Card>
              </div>

              <div className="space-y-6 flex flex-col justify-between">
                <Card>
                  <div className="flex items-center gap-3 border-b border-white/[0.05] pb-4 mb-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">Logging Toggles</h3>
                      <p className="text-[11px] text-zinc-500 font-medium">Mute or activate bypass event alerts individually.</p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <ToggleRow 
                      label="Log Whitelist Add" 
                      checked={webhooksState.discord_log_bypass_add !== "false"} 
                      onChange={(checked) => updateWebhook("discord_log_bypass_add", checked ? "true" : "false")} 
                    />
                    <ToggleRow 
                      label="Log UID Search" 
                      checked={webhooksState.discord_log_bypass_search !== "false"} 
                      onChange={(checked) => updateWebhook("discord_log_bypass_search", checked ? "true" : "false")} 
                    />
                    <ToggleRow 
                      label="Log Blacklist Events" 
                      checked={webhooksState.discord_log_bypass_blacklist !== "false"} 
                      onChange={(checked) => updateWebhook("discord_log_bypass_blacklist", checked ? "true" : "false")} 
                    />
                    <ToggleRow 
                      label="Log UID Delete" 
                      checked={webhooksState.discord_log_bypass_delete !== "false"} 
                      onChange={(checked) => updateWebhook("discord_log_bypass_delete", checked ? "true" : "false")} 
                    />
                    <ToggleRow 
                      label="Log Access Extension" 
                      checked={webhooksState.discord_log_bypass_extend !== "false"} 
                      onChange={(checked) => updateWebhook("discord_log_bypass_extend", checked ? "true" : "false")} 
                    />
                    <ToggleRow 
                      label="Log UID Login Success" 
                      checked={webhooksState.discord_log_uid_login_success !== "false"} 
                      onChange={(checked) => updateWebhook("discord_log_uid_login_success", checked ? "true" : "false")} 
                    />
                    <ToggleRow 
                      label="Log UID Login Failed" 
                      checked={webhooksState.discord_log_uid_login_failed !== "false"} 
                      onChange={(checked) => updateWebhook("discord_log_uid_login_failed", checked ? "true" : "false")} 
                    />
                  </div>
                </Card>

                <div className="pt-2">
                  <Btn onClick={handleSave} disabled={mutation.isPending} className="w-full flex items-center justify-center gap-2 py-3.5 shadow-[var(--shadow-glow)]">
                    {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    Save Discord Settings
                  </Btn>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center justify-between rounded-xl border px-4 py-3 backdrop-blur-xl transition-all duration-300 active:scale-95 cursor-pointer ${
        checked
          ? "border-primary/30 bg-primary/10 text-primary shadow-[0_0_15px_var(--primary-glow)] hover:border-primary/50 hover:bg-primary/15"
          : "border-border/60 bg-card/20 text-muted-foreground hover:border-white/20 hover:text-foreground hover:bg-card/40"
      }`}
    >
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-2">
        <div className="relative flex h-2 w-2">
          {checked && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
          )}
          <span className={`relative inline-flex h-2 w-2 rounded-full ${checked ? "bg-primary" : "bg-zinc-600"}`}></span>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider">{checked ? "Active" : "Muted"}</span>
      </div>
    </button>
  );
}

function WebhookField({ label, description, value, placeholder, onChangeText }: { label: string; description: string; value: string; placeholder: string; onChangeText: (val: string) => void }) {
  return (
    <div className="space-y-1.5">
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
        <input 
          type="text" 
          value={value} 
          placeholder={placeholder} 
          onChange={(e) => onChangeText(e.target.value)} 
          className="mt-2 w-full rounded-xl border border-border/60 bg-background/40 px-4 py-3 text-sm outline-none focus:border-primary/50 transition-all font-mono text-zinc-300 placeholder:text-zinc-600 focus:bg-background/80"
        />
      </label>
      <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">{description}</p>
    </div>
  );
}
