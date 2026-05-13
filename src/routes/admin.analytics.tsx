import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, StatCard } from "@/components/admin/ui";
import { Eye, MousePointer, ShoppingCart, Users, Loader2 } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const Route = createFileRoute("/admin/analytics")({ component: Analytics });

function Analytics() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: api.admin.getStats,
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const traffic = Array.from({ length: 30 }, (_, i) => ({ 
    name: `${i+1}`, 
    visits: (stats?.total_users / 30) * (1 + Math.random()), 
    sales: (stats?.active_licenses / 30) * (1 + Math.random()) 
  }));

  const appUsage = [
    { name: "Active", value: stats?.active_licenses || 0, color: "var(--primary)" },
    { name: "Total Users", value: stats?.total_users || 0, color: "var(--accent)" },
    { name: "Apps", value: stats?.total_applications || 0, color: "var(--neon)" },
  ];

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Track traffic, sales, and app usage." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Platform Users" value={stats?.total_users.toLocaleString()} delta="Real-time" icon={Users} />
        <StatCard label="Active Licenses" value={stats?.active_licenses.toLocaleString()} delta="Real-time" icon={ShoppingCart} accent="accent" />
        <StatCard label="Total Revenue" value={`$${stats?.total_revenue.toLocaleString()}`} delta="Total" icon={ShoppingCart} />
        <StatCard label="Applications" value={stats?.total_applications.toString()} delta="Live" icon={Eye} accent="warning" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="mb-4 font-semibold text-white">Estimated Traffic & Sales (30d)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={traffic}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--primary)" stopOpacity={0} /></linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity={0.4} /><stop offset="100%" stopColor="var(--accent)" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid stroke="var(--primary-border, oklch(0.7 0.1 250 / 0.1))" vertical={false} />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--primary-border)", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="visits" stroke="var(--primary)" fill="url(#g1)" strokeWidth={2} />
              <Area type="monotone" dataKey="sales" stroke="var(--accent)" fill="url(#g2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="mb-4 font-semibold">Platform Share</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={appUsage} dataKey="value" innerRadius={50} outerRadius={90} paddingAngle={3}>
                {appUsage.map((a, i) => <Cell key={i} fill={a.color} stroke="none" />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
