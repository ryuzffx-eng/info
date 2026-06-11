import { createFileRoute, redirect } from "@tanstack/react-router";
import { DashboardShell } from "@/components/admin/DashboardShell";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Package, Key, Clock, ShieldCheck, Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const token = localStorage.getItem("access_token");
    if (!token) throw redirect({ to: "/login" });
  },
  component: CustomerDashboard,
});

function CustomerDashboard() {
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => api.auth.me(),
  });

  const { data: licenses, isLoading: isLicensesLoading } = useQuery({
    queryKey: ["my-licenses"],
    queryFn: () => api.auth.myLicenses(),
  });

  if (isUserLoading || isLicensesLoading) return <DashboardShell variant="user"><div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div></DashboardShell>;

  // If no licenses (not a buyer), redirect to store
  if (licenses && licenses.length === 0) {
    window.location.href = "/";
    return null;
  }

  return (
    <DashboardShell variant="user">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, <span className="neon-text">{user?.username}</span></h1>
          <p className="mt-2 text-muted-foreground text-sm">Manage your active software licenses and downloads.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard icon={Key} label="Active Licenses" value={licenses?.length || 0} color="primary" />
          <StatCard icon={Package} label="Total Products" value={new Set(licenses?.map((l: any) => l.software_id)).size} color="accent" />
          <StatCard icon={ShieldCheck} label="Security Status" value="Secure" color="primary" />
        </div>

        <div className="glass-strong rounded-2xl overflow-hidden border-white/5">
          <div className="border-b border-white/5 bg-white/5 px-6 py-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary/80">Active Subscriptions</h3>
          </div>
          <div className="p-0">
            {licenses?.map((license: any) => (
              <div key={license.id} className="flex items-center justify-between border-b border-white/5 px-6 py-5 last:border-0 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Key size={20} />
                  </div>
                  <div>
                    <div className="font-semibold">{license.software_name || "Premium Software"}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{license.key.slice(0, 8)}••••••••••••</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-primary">Active</div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1 uppercase tracking-tighter">
                    <Clock size={10} /> {license.expiry_date ? new Date(license.expiry_date).toLocaleDateString() : "Lifetime"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  const colorMap: any = {
    primary: "text-primary bg-primary/10 border-primary/20",
    accent: "text-accent bg-accent/10 border-accent/20",
    emerald: "text-primary bg-primary/10 border-primary/20",
  };

  return (
    <div className={`glass-strong flex items-center gap-5 rounded-2xl p-6 border-l-4 ${colorMap[color]}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background/50 shadow-inner">
        <Icon size={24} />
      </div>
      <div>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-widest mt-0.5">{label}</div>
      </div>
    </div>
  );
}
