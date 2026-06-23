import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageHeader, StatCard, Card, Btn, Badge } from "@/components/admin/ui";
import { Wallet, Key, ShoppingCart, TrendingUp, Plus, Copy, Loader2 } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const Route = createFileRoute("/reseller/")({ component: ResellerHome });

const sales = Array.from({ length: 14 }, (_, i) => ({ d: `${i+1}`, v: 5 + Math.random() * 25 }));

function ResellerHome() {
  const navigate = useNavigate();

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["reseller-profile"],
    queryFn: () => api.reseller.getProfile(),
    retry: false
  });

  const { data: licensesData, isLoading: isLicensesLoading } = useQuery({
    queryKey: ["reseller-licenses-summary"],
    queryFn: () => api.reseller.getMyLicenses({ limit: 5 }),
    retry: false
  });

  if (isProfileLoading || isLicensesLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  const recentKeys = licensesData?.items || [];
  const totalKeys = licensesData?.total || 0;
  const activeCustomers = licensesData?.active_customers || 0;
  const estimatedRevenue = licensesData?.estimated_revenue || 0;

  return (
    <div>
      <PageHeader 
        title="Reseller Hub" 
        subtitle={profile?.role === "admin" ? "Global Administrative Overview." : "Manage your credits, keys, and customers."}
        action={<Btn onClick={() => navigate({ to: "/reseller/licenses" })}><Plus size={14} /> Generate license</Btn>} 
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Credit balance" 
          value={profile?.role === "admin" ? "Unlimited" : (profile?.credits || 0).toLocaleString()} 
          delta={profile?.role === "admin" ? "Admin Privileges" : "Top up anytime"} 
          icon={Wallet} 
        />
        <StatCard 
          label="Keys generated" 
          value={totalKeys.toLocaleString()} 
          delta={profile?.role === "admin" ? "Global System Count" : "Lifetime generated"} 
          icon={Key} 
          accent="accent" 
        />
        <StatCard 
          label="Active customers" 
          value={activeCustomers.toLocaleString()} 
          delta="Bound Hardware IDs"
          icon={ShoppingCart} 
        />
        <StatCard 
          label="Estimated Revenue" 
          value={`$${estimatedRevenue.toLocaleString()}`} 
          delta={profile?.role === "admin" ? "Global Sales Vol" : "Based on issued keys"} 
          icon={TrendingUp} 
          accent="warning" 
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="mb-4 font-semibold">Sales (14d)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={sales}>
              <defs><linearGradient id="rs" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="oklch(0.78 0.19 158)" stopOpacity={0.4} /><stop offset="100%" stopColor="oklch(0.78 0.19 158)" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid stroke="oklch(0.3 0.04 165 / 0.3)" vertical={false} />
              <XAxis dataKey="d" stroke="oklch(0.7 0.04 160)" fontSize={11} />
              <Tooltip contentStyle={{ background: "oklch(0.21 0.03 165)", border: "1px solid oklch(0.3 0.04 165)", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="v" stroke="oklch(0.78 0.19 158)" fill="url(#rs)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Recent keys</h3>
            <Badge>{recentKeys.length > 0 ? `+${recentKeys.length}` : "0"}</Badge>
          </div>
          <ul className="space-y-2.5">
            {recentKeys.map((k: any) => (
              <li key={k.key} className="rounded-lg border border-border/40 bg-background/30 p-3 text-xs hover:border-primary/20 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <code className="font-mono">{k.key}</code>
                  <button onClick={() => { navigator.clipboard.writeText(k.key); toast.success("Copied key"); }}><Copy size={11} className="text-primary" /></button>
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>{k.app_name} • {k.duration} Days</span>
                  <span className={`capitalize ${k.status === 'active' ? 'text-primary' : 'text-primary'}`}>{k.status}</span>
                </div>
              </li>
            ))}
            {recentKeys.length === 0 && (
              <div className="text-center py-8 text-xs text-muted-foreground italic">
                No keys generated yet.
              </div>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}

