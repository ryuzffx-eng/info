import { createFileRoute } from "@tanstack/react-router";
import { 
  Search, Ban, RefreshCw, Trash2, Loader2, ShieldCheck, 
  User as UserIcon, Eye, X, Mail, Calendar, Shield, Activity,
  CheckCircle2, AlertCircle, Bell, BellOff
} from "lucide-react";
import { PageHeader, Card, Badge, Btn, CustomSelect } from "@/components/admin/ui";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/admin/users")({ component: UsersPage });

function UsersPage() {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const queryClient = useQueryClient();
  
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: api.admin.getUsers,
  });

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: api.admin.getSettings,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: (data: Record<string, string>) => api.admin.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Discord log settings updated!");
    },
    onError: (err: any) => {
      toast.error(`Failed to update settings: ${err.message}`);
    }
  });

  const updateUser = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => api.admin.updateUser(id, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(res.msg);
      setSelectedUser(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteUser = useMutation({
    mutationFn: (id: number) => api.admin.deleteUser(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success(res.msg);
      setSelectedUser(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const filtered = users?.filter((u: any) => {
    const matchesQuery = u.username.toLowerCase().includes(q.toLowerCase()) || 
      u.email.toLowerCase().includes(q.toLowerCase());
    
    if (statusFilter === "Active") return matchesQuery && u.is_active;
    if (statusFilter === "Banned") return matchesQuery && !u.is_active;
    return matchesQuery;
  }) || [];

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
        title="Users" 
        subtitle="Manage all registered users and their permissions." 
        action={
          settings && (
            <button
              onClick={() => {
                const isActive = settings.discord_log_users !== "false";
                const newSettings = { ...settings, discord_log_users: isActive ? "false" : "true" };
                updateSettingsMutation.mutate(newSettings);
              }}
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold backdrop-blur-xl transition-all duration-300 active:scale-95 cursor-pointer ${
                settings.discord_log_users !== "false"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:border-emerald-500/50 hover:bg-emerald-500/15"
                  : "border-border/60 bg-card/40 text-muted-foreground hover:border-white/20 hover:text-foreground"
              }`}
            >
              {settings.discord_log_users !== "false" ? (
                <>
                  <Bell size={14} className="animate-bounce" />
                  <div className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
                  </div>
                  <span>Discord Logs: Active</span>
                </>
              ) : (
                <>
                  <BellOff size={14} className="text-zinc-500" />
                  <span className="h-2 w-2 rounded-full bg-zinc-600"></span>
                  <span>Discord Logs: Muted</span>
                </>
              )}
            </button>
          )
        }
      />
      <Card>
        <div className="mb-5 flex items-center gap-3">
          <div className="relative max-w-sm flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search users..."
              className="w-full rounded-lg border border-border/60 bg-background/40 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary/50 transition-all focus:bg-background/60" />
          </div>
          <CustomSelect value={statusFilter} onChange={setStatusFilter} options={["All statuses", "Active", "Banned"]} className="h-9" />
        </div>
        
        {/* Desktop Table */}
        <div className="hidden md:block scrollbar-thin overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
              <tr className="border-b border-border/40">
                <th className="py-5 pr-4 font-bold">User</th>
                <th className="px-4 font-bold">Role</th>
                <th className="px-4 font-bold">Joined</th>
                <th className="px-4 font-bold">Status</th>
                <th className="pl-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((u: any) => (
                <tr key={u.id} className="group transition-colors hover:bg-white/[0.02]">
                  <td className="py-5 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt={u.username} className="h-10 w-10 rounded-full object-cover border border-white/10" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-white uppercase">
                            {u.username[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white tracking-tight">{u.username}</span>
                          <div className="flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-1.5 py-0.5">
                            <span className="text-[8px] font-black text-primary uppercase tracking-widest">Verified</span>
                          </div>
                        </div>
                        <div className="text-[11px] text-zinc-500 font-medium">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4">
                    <div className="flex items-center gap-2">
                      {u.role === "admin" ? <Shield size={12} className="text-primary" /> : <UserIcon size={12} className="text-zinc-500" />}
                      <span className={`text-[10px] font-black uppercase tracking-widest ${u.role === "admin" ? "text-primary" : "text-zinc-500"}`}>
                        {u.role}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 text-xs text-muted-foreground/80 font-medium">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4">
                    <Badge tone={u.is_active ? "primary" : "danger"} className="font-black text-[9px] px-2.5 py-1">
                      {u.is_active ? "Active" : "Banned"}
                    </Badge>
                  </td>
                  <td className="pl-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setSelectedUser(u)} className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 text-zinc-500 hover:text-primary transition-all border border-white/5"><Eye size={14} /></button>
                      <button 
                        onClick={() => {
                          if (confirm("Are you sure?")) {
                            deleteUser.mutate(u.id);
                          }
                        }}
                        disabled={deleteUser.isPending}
                        className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/5 text-zinc-500 hover:text-red-500 transition-all border border-white/5"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Grid Layout */}
        <div className="md:hidden space-y-4">
          {filtered.map((u: any) => (
            <div key={u.id} className="bg-secondary/40 backdrop-blur-xl rounded-xl border border-white/[0.03] p-5 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {u.avatar_url ? (
                      <img src={u.avatar_url} alt={u.username} className="h-12 w-12 rounded-full object-cover border border-white/10 shadow-lg" />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-brand text-xs font-bold text-white uppercase shadow-lg">
                        {u.username[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                       <span className="font-bold text-white tracking-tight">{u.username}</span>
                       {u.role === "admin" && <Shield size={12} className="text-primary" />}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-medium truncate max-w-[120px]">{u.email}</div>
                  </div>
                </div>
                <Badge tone={u.is_active ? "primary" : "danger"} className="font-black text-[9px] px-3 py-1">
                  {u.is_active ? "ACTIVE" : "BANNED"}
                </Badge>
              </div>

              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Role</div>
                  <div className="text-[10px] font-black text-white bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 uppercase tracking-[0.1em]">{u.role}</div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Joined</div>
                  <div className="text-xs font-semibold text-zinc-400">{new Date(u.created_at).toLocaleDateString()}</div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Actions</div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedUser(u)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900/60 text-zinc-400 border border-white/5 active:bg-white/10 transition-all shadow-xl"><Eye size={18} /></button>
                    <button 
                      onClick={() => {
                        if (confirm("Delete this user?")) {
                          deleteUser.mutate(u.id);
                        }
                      }}
                      disabled={deleteUser.isPending}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900/60 text-red-500/80 border border-white/5 active:bg-red-500/20 transition-all shadow-xl"
                    >
                      {deleteUser.isPending ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="bg-secondary/20 rounded-xl p-10 text-center border border-white/5">
              <div className="text-zinc-500 text-sm italic">No users found</div>
            </div>
          )}
        </div>
      </Card>

      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md" 
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl"
            >
              <button onClick={() => setSelectedUser(null)} className="absolute right-4 top-4 text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>

              <div className="mb-6 flex flex-col items-center text-center">
                <div className="relative mb-4">
                  {selectedUser.avatar_url ? (
                    <img src={selectedUser.avatar_url} className="h-20 w-20 rounded-full border-2 border-primary/20 shadow-xl" />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-2xl font-bold text-primary-foreground shadow-xl">
                      {selectedUser.username[0].toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 border-2 border-zinc-950 shadow-lg">
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white">{selectedUser.username}</h3>
                <div className="flex items-center gap-1.5 text-sm text-zinc-400 mt-1">
                  <Mail size={14} /> {selectedUser.email}
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-white/[0.03] p-3 border border-white/[0.05]">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs">
                    <Shield size={14} /> Role
                  </div>
                  <button 
                    onClick={() => updateUser.mutate({ id: selectedUser.id, data: { role: selectedUser.role === 'admin' ? 'user' : 'admin' }})}
                    className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1 text-xs font-bold text-primary border border-primary/20 hover:bg-primary/20 transition-all"
                  >
                    <RefreshCw size={12} className={updateUser.isPending ? "animate-spin" : ""} />
                    {selectedUser.role.toUpperCase()}
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-white/[0.03] p-3 border border-white/[0.05]">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs">
                    <Activity size={14} /> Status
                  </div>
                  <button 
                    onClick={() => updateUser.mutate({ id: selectedUser.id, data: { is_active: !selectedUser.is_active }})}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1 text-xs font-bold border transition-all ${selectedUser.is_active ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'}`}
                  >
                    <Ban size={12} />
                    {selectedUser.is_active ? "ACTIVE" : "BANNED"}
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl bg-white/[0.03] p-3 border border-white/[0.05]">
                  <div className="flex items-center gap-2 text-zinc-400 text-xs">
                    <Calendar size={14} /> Joined On
                  </div>
                  <div className="text-xs font-medium text-white">
                    {new Date(selectedUser.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 flex gap-3">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 rounded-xl bg-zinc-900 py-2.5 text-xs font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all"
                >
                  Close Preview
                </button>
                <button 
                  onClick={() => {
                    if (confirm("Permanently delete this user? This cannot be undone.")) {
                      deleteUser.mutate(selectedUser.id);
                    }
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-red-500/10 px-4 py-2.5 text-xs font-bold text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
