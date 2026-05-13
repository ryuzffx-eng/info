import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatCard, Card, Btn, Badge } from "@/components/admin/ui";
import { Wallet, Key, ShoppingCart, TrendingUp, Plus, Copy } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";

export const Route = createFileRoute("/reseller/")({ component: ResellerHome });

const sales = Array.from({ length: 14 }, (_, i) => ({ d: `${i+1}`, v: 5 + Math.random() * 25 }));
const recentKeys = Array.from({ length: 5 }, () => ({
  key: `EMRT-${(Math.random()*1e16).toString(36).slice(0,4).toUpperCase()}-${(Math.random()*1e16).toString(36).slice(0,4).toUpperCase()}`,
  app: ["Phantom Loader", "Eclipse Suite"][Math.floor(Math.random()*2)],
  duration: ["30 days", "Lifetime"][Math.floor(Math.random()*2)],
}));

function ResellerHome() {
  return (
    <div>
      <PageHeader title="Reseller Hub" subtitle="Manage your credits, keys, and customers."
        action={<Btn><Plus size={14} /> Generate license</Btn>} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Credit balance" value="482" delta="Top up anytime" icon={Wallet} />
        <StatCard label="Keys generated" value="1,240" delta="+24 this week" icon={Key} accent="accent" />
        <StatCard label="Active customers" value="312" icon={ShoppingCart} />
        <StatCard label="Revenue (mo)" value="$3,820" delta="+12%" icon={TrendingUp} accent="warning" />
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
          <div className="mb-4 flex items-center justify-between"><h3 className="font-semibold">Recent keys</h3><Badge>+5</Badge></div>
          <ul className="space-y-2.5">
            {recentKeys.map(k => (
              <li key={k.key} className="rounded-lg border border-border/40 bg-background/30 p-3 text-xs">
                <div className="flex items-center justify-between">
                  <code className="font-mono">{k.key}</code>
                  <button onClick={() => { navigator.clipboard.writeText(k.key); toast.success("Copied"); }}><Copy size={11} className="text-primary" /></button>
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">{k.app} • {k.duration}</div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
