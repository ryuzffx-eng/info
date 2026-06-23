import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { PageHeader, StatCard, Card, Btn, Badge } from "@/components/admin/ui";
import { Wallet, Key, ShoppingCart, TrendingUp, Plus, Copy, Loader2, ArrowRight, CreditCard, Coins, QrCode, Sparkles, Zap } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion } from "framer-motion";

export const Route = createFileRoute("/reseller/")({ component: ResellerHome });

const sales = Array.from({ length: 14 }, (_, i) => ({ d: `${i + 1}`, v: 5 + Math.random() * 25 }));

const METHODS = [
  { id: "razorpay", label: "Razorpay", sub: "UPI / Cards / INR", icon: CreditCard, dot: "bg-blue-500", badge: "Instant", color: "border-blue-500/20 from-blue-950/30" },
  { id: "binance",  label: "Binance Pay", sub: "C2C USDT", icon: Coins, dot: "bg-amber-400", badge: "Auto-Verify", color: "border-amber-500/20 from-amber-950/20" },
  { id: "crypto",   label: "Crypto", sub: "TRC20 / ERC20", icon: QrCode, dot: "bg-teal-400", badge: "Auto-Verify", color: "border-teal-500/20 from-teal-950/15" },
];

function ResellerHome() {
  const navigate = useNavigate();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["reseller-profile"],
    queryFn: () => api.reseller.getProfile(),
    retry: false,
  });

  const { data: licensesData, isLoading: licensesLoading } = useQuery({
    queryKey: ["reseller-licenses-summary"],
    queryFn: () => api.reseller.getMyLicenses({ limit: 5 }),
    retry: false,
  });

  const { data: plans } = useQuery<any[]>({
    queryKey: ["reseller-topup-plans"],
    queryFn: () => api.reseller.getTopupPlans(),
  });

  if (profileLoading || licensesLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  const recentKeys     = licensesData?.items || [];
  const totalKeys      = licensesData?.total || 0;
  const activeCustomers = licensesData?.active_customers || 0;
  const estimatedRevenue = licensesData?.estimated_revenue || 0;
  const balance        = profile?.credits || 0;
  const isAdmin        = profile?.role === "admin";

  const quickAmounts = plans?.slice(0, 4) ?? [{ id: 10, amount: 10, credits: 10 }, { id: 25, amount: 25, credits: 25 }, { id: 50, amount: 50, credits: 50 }, { id: 100, amount: 100, credits: 100 }];

  return (
    <div className="space-y-5 pb-24 sm:pb-8">
      <PageHeader
        title="Reseller Hub"
        subtitle={isAdmin ? "Global Administrative Overview." : "Manage your credits, keys, and customers."}
        action={<Btn onClick={() => navigate({ to: "/reseller/licenses" })}><Plus size={14} /> Generate</Btn>}
      />

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Balance (USD)" value={isAdmin ? "∞" : `$${balance.toFixed(2)}`} delta={isAdmin ? "Admin" : "Top up anytime"} icon={Wallet} />
        <StatCard label="Keys" value={totalKeys.toLocaleString()} delta={isAdmin ? "System total" : "Lifetime"} icon={Key} accent="accent" />
        <StatCard label="Customers" value={activeCustomers.toLocaleString()} delta="Bound HWIDs" icon={ShoppingCart} />
        <StatCard label="Revenue" value={`$${estimatedRevenue.toLocaleString()}`} delta={isAdmin ? "Global vol." : "Est. earnings"} icon={TrendingUp} accent="warning" />
      </div>

      {/* ── Chart + Recent Keys ── */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 !p-4 sm:!p-6">
          <h3 className="mb-4 text-sm font-semibold">Sales (14d)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={sales}>
              <defs>
                <linearGradient id="rs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.78 0.19 158)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="oklch(0.78 0.19 158)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="oklch(0.3 0.04 165 / 0.3)" vertical={false} />
              <XAxis dataKey="d" stroke="oklch(0.7 0.04 160)" fontSize={10} />
              <Tooltip contentStyle={{ background: "oklch(0.21 0.03 165)", border: "1px solid oklch(0.3 0.04 165)", borderRadius: 12, fontSize: 12 }} />
              <Area type="monotone" dataKey="v" stroke="oklch(0.78 0.19 158)" fill="url(#rs)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="!p-4 sm:!p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Recent Keys</h3>
            <Badge>{recentKeys.length > 0 ? `+${recentKeys.length}` : "0"}</Badge>
          </div>
          <ul className="space-y-2">
            {recentKeys.map((k: any) => (
              <li key={k.key} className="rounded-xl border border-border/40 bg-background/30 p-3 text-xs hover:border-primary/20 transition-all">
                <div className="flex items-center justify-between gap-2">
                  <code className="font-mono truncate flex-1 text-[10px]">{k.key}</code>
                  <button onClick={() => { navigator.clipboard.writeText(k.key); toast.success("Copied"); }} className="shrink-0">
                    <Copy size={11} className="text-primary" />
                  </button>
                </div>
                <div className="mt-1 text-[10px] text-muted-foreground flex justify-between">
                  <span>{k.app_name} · {k.duration}d</span>
                  <span className="text-primary capitalize">{k.status}</span>
                </div>
              </li>
            ))}
            {recentKeys.length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground italic">No keys yet.</div>
            )}
          </ul>
        </Card>
      </div>

      {/* ── Top Up Section (non-admin only) ── */}
      {!isAdmin && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Zap size={13} className="text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wide">Quick Top Up</h2>
                <p className="text-[10px] text-zinc-600 font-semibold">Add credit instantly</p>
              </div>
            </div>
            <Link to="/reseller/topup" className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
              Full page <ArrowRight size={10} />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {/* Balance + quick-pick */}
            <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-zinc-950 to-black p-5 flex flex-col sm:col-span-2 lg:col-span-1">
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/10 blur-2xl" />
              <div className="relative mb-4">
                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <Wallet size={10} /> Balance
                </div>
                <div className="text-3xl font-black text-white">${balance.toFixed(2)}</div>
                <div className="text-[10px] text-zinc-600 font-bold mt-0.5">USD Available</div>
              </div>

              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {quickAmounts.map((plan: any) => (
                  <Link key={plan.id} to="/reseller/topup" className="py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-primary/30 hover:bg-primary/5 text-center text-[10px] font-black text-zinc-500 hover:text-primary transition-all flex flex-col gap-0.5">
                    <span className="text-white text-xs">${plan.amount}</span>
                    <span className="text-[8px] text-primary">{plan.credits}cr</span>
                  </Link>
                ))}
              </div>

              <Link to="/reseller/topup" className="w-full">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="w-full h-10 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_0_20px_var(--primary-glow)]"
                >
                  <Sparkles size={12} /> Top Up Now <ArrowRight size={11} />
                </motion.button>
              </Link>
            </div>

            {/* Payment methods */}
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {METHODS.map((pm) => {
                const Icon = pm.icon;
                return (
                  <Link key={pm.id} to="/reseller/topup">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`h-full p-4 rounded-2xl bg-gradient-to-b ${pm.color} to-black border relative overflow-hidden cursor-pointer flex flex-col sm:flex-col`}
                    >
                      <div className="flex items-center gap-2.5 sm:flex-col sm:items-start sm:gap-2 flex-1">
                        <div className="flex items-center gap-2 sm:mb-1">
                          <span className={`h-1.5 w-1.5 rounded-full ${pm.dot} animate-pulse`} />
                          <Icon size={14} className="text-zinc-300" />
                        </div>
                        <div className="flex-1 sm:flex-none">
                          <div className="font-bold text-xs text-white leading-tight">{pm.label}</div>
                          <div className="text-[10px] text-zinc-500 font-semibold">{pm.sub}</div>
                        </div>
                      </div>
                      <div className="mt-2 sm:mt-3 inline-flex items-center gap-1 bg-black/30 border border-white/[0.06] rounded-lg px-2 py-0.5 self-start">
                        <span className="text-[9px] font-black uppercase tracking-wider text-primary">{pm.badge}</span>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>

          <p className="text-center text-[10px] text-zinc-600 font-semibold">
            All payments are <span className="text-primary">auto-verified</span> · Credits appear instantly after confirmation
          </p>
        </div>
      )}
    </div>
  );
}
