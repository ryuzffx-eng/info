import { createFileRoute } from "@tanstack/react-router";
import { Users, Key, DollarSign, AppWindow, Activity, TrendingUp, Loader2 } from "lucide-react";
import { PageHeader, StatCard, Card, Badge } from "@/components/admin/ui";
import { LineChart, Line, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: api.admin.getStats,
    refetchInterval: 30000,
  });

  console.log("[Dashboard] State:", { isLoading, isError: !!error, error });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Connecting to API...</p>
      </div>
    );
  }

  if (error) {
    const isAuthError = (error as Error).message.includes("401") || (error as Error).message.includes("credentials");
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 rounded-full bg-destructive/10 p-3 text-destructive">
          {isAuthError ? <Key size={32} /> : <Activity size={32} />}
        </div>
        <h3 className="text-lg font-semibold">{isAuthError ? "Authentication Required" : "Connection Failed"}</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs">
          {isAuthError ? "You need to be logged in to access the admin console." : (error as Error).message}
        </p>
        <div className="mt-6 flex gap-3">
          {isAuthError ? (
            <Link to="/login" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]">
              Go to Login
            </Link>
          ) : (
            <button 
              onClick={() => window.location.reload()}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Retry Connection
            </button>
          )}
        </div>
      </div>
    );
  }

  const revenueData = Array.from({ length: 12 }, (_, i) => ({ name: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i], value: (stats?.total_revenue / 12) * (1 + Math.random() * 0.5) }));
  const userData = Array.from({ length: 7 }, (_, i) => ({ name: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"][i], users: (stats?.total_users / 7) * (1 + Math.random() * 0.5) }));

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Welcome back. Here's what's happening today." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={stats?.total_users.toLocaleString()} delta="+0% this month" icon={Users} />
        <StatCard label="Active Licenses" value={stats?.active_licenses.toLocaleString()} delta="+0% vs last week" icon={Key} accent="accent" />
        <StatCard label="Revenue" value={`$${stats?.total_revenue.toLocaleString()}`} delta="+0% MoM" icon={DollarSign} />
        <StatCard label="Applications" value={stats?.total_applications.toString()} delta="Live" icon={AppWindow} accent="warning" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Revenue Overview</h3>
              <p className="text-xs text-muted-foreground">Estimate based on total</p>
            </div>
            <Badge>Real-time</Badge>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--primary-border, oklch(0.7 0.1 250 / 0.1))" vertical={false} />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--primary-border)", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <div className="mb-5">
            <h3 className="font-semibold text-white">Users</h3>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Total platform users</p>
          </div>
          <div className="flex items-baseline gap-2">
            <div className="font-display text-5xl font-bold neon-text">{stats?.total_users}</div>
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={userData}>
              <Line type="monotone" dataKey="users" stroke="var(--primary)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="mb-4 font-semibold text-white text-lg">User Growth</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={userData}>
              <CartesianGrid stroke="var(--primary-border, oklch(0.7 0.1 250 / 0.1))" vertical={false} />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--primary-border)", borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="users" fill="var(--accent)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <Activity size={16} className="text-primary" />
            <h3 className="font-semibold">Recent Activity</h3>
          </div>
          <ul className="space-y-3.5">
            {stats?.recent_activities?.map((a: any, i: number) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{a.who ? a.who[0].toUpperCase() : "S"}</div>
                <div className="flex-1">
                  <div><span className="font-medium">{a.who || "System"}</span> <span className="text-muted-foreground">{a.what}</span></div>
                  <div className="text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(a.when))} ago</div>
                </div>
              </li>
            ))}
            {stats?.recent_activities?.length === 0 && (
              <li className="py-4 text-center text-sm text-muted-foreground">No recent activity</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
