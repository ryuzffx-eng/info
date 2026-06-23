import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { PageHeader, StatCard, Card, Btn, Badge } from "@/components/admin/ui";
import { Wallet, Key, ShoppingCart, TrendingUp, Plus, Copy, Loader2, ArrowRight, CreditCard, Coins, QrCode, Sparkles, Zap } from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, CartesianGrid } from "recharts";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion } from "framer-motion";

export const Route = createFileRoute("/reseller/")({ component: ResellerHome });

const sales = Array.from({ length: 14 }, (_, i) => ({ d: `${i+1}`, v: 5 + Math.random() * 25 }));

const PAYMENT_METHODS = [
  {
    id: "razorpay",
    label: "Razorpay",
    sub: "UPI / Cards / Netbanking",
    icon: CreditCard,
    color: "from-blue-950/40 to-black border-blue-500/20",
    dot: "bg-blue-500",
    badge: "INR • Instant",
  },
  {
    id: "binance",
    label: "Binance Pay",
    sub: "C2C USDT Transfer",
    icon: Coins,
    color: "from-amber-950/30 to-black border-amber-500/20",
    dot: "bg-amber-500",
    badge: "USDT • Auto-Verify",
  },
  {
    id: "crypto",
    label: "Crypto Transfer",
    sub: "TRC20 / ERC20 / BEP20",
    icon: QrCode,
    color: "from-teal-950/20 to-black border-teal-500/20",
    dot: "bg-teal-500",
    badge: "USDT • Auto-Verify",
  },
];

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

  const { data: plans } = useQuery<any[]>({
    queryKey: ["reseller-topup-plans"],
    queryFn: () => api.reseller.getTopupPlans(),
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
  const balance = profile?.credits || 0;
  const isAdmin = profile?.role === "admin";

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Reseller Hub" 
        subtitle={isAdmin ? "Global Administrative Overview." : "Manage your credits, keys, and customers."}
        action={<Btn onClick={() => navigate({ to: "/reseller/licenses" })}><Plus size={14} /> Generate license</Btn>} 
      />

      {/* Stat Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Balance (USD)" 
          value={isAdmin ? "Unlimited" : `$${balance.toFixed(2)}`} 
          delta={isAdmin ? "Admin Privileges" : "Top up anytime"} 
          icon={Wallet} 
        />
        <StatCard 
          label="Keys generated" 
          value={totalKeys.toLocaleString()} 
          delta={isAdmin ? "Global System Count" : "Lifetime generated"} 
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
          delta={isAdmin ? "Global Sales Vol" : "Based on issued keys"} 
          icon={TrendingUp} 
          accent="warning" 
        />
      </div>

      {/* Main grid */}
      <div className="grid gap-5 lg:grid-cols-3">
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
                  <span className="capitalize text-primary">{k.status}</span>
                </div>
              </li>
            ))}
            {recentKeys.length === 0 && (
              <div className="text-center py-8 text-xs text-muted-foreground italic">No keys generated yet.</div>
            )}
          </ul>
        </Card>
      </div>

      {/* ── TOP UP SECTION ── */}
      {!isAdmin && (
        <div className="space-y-4">
          {/* Section header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Zap size={15} className="text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wider">Quick Top Up</h2>
                <p className="text-[10px] text-zinc-500 font-semibold">Add credit balance instantly</p>
              </div>
            </div>
            <Link
              to="/reseller/topup"
              className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
            >
              Full Checkout <ArrowRight size={11} />
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {/* Balance card */}
            <Card className="relative overflow-hidden border-primary/20 flex flex-col justify-between">
              <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/10 blur-2xl opacity-60" />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Wallet size={14} className="text-primary" />
                  </div>
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Current Balance</span>
                </div>
                <div className="font-display text-4xl font-black text-white mb-1">${balance.toFixed(2)}</div>
                <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">USD Available</div>
              </div>
              <div className="mt-5">
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {plans && plans.slice(0, 4).map((plan: any) => (
                    <Link
                      key={plan.id}
                      to="/reseller/topup"
                      className="py-2 px-2 rounded-xl border border-white/5 bg-white/[0.02] hover:border-primary/30 hover:bg-primary/5 text-center text-[10px] font-extrabold text-zinc-400 hover:text-primary transition-all flex flex-col"
                    >
                      <span className="text-white">${plan.amount}</span>
                      <span className="text-[9px] text-primary">{plan.credits} cr</span>
                    </Link>
                  ))}
                  {(!plans || plans.length === 0) && [10, 25, 50, 100].map(amt => (
                    <Link
                      key={amt}
                      to="/reseller/topup"
                      className="py-2 px-2 rounded-xl border border-white/5 bg-white/[0.02] hover:border-primary/30 hover:bg-primary/5 text-center text-[10px] font-extrabold text-zinc-400 hover:text-primary transition-all"
                    >
                      ${amt}
                    </Link>
                  ))}
                </div>
                <Link to="/reseller/topup">
                  <button className="w-full py-2.5 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                    <Sparkles size={12} /> Top Up Now <ArrowRight size={11} />
                  </button>
                </Link>
              </div>
            </Card>

            {/* Payment methods quick-view */}
            <Card className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-sm text-white">Payment Methods</h3>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Instant Credit</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {PAYMENT_METHODS.map((pm) => {
                  const Icon = pm.icon;
                  return (
                    <Link key={pm.id} to="/reseller/topup">
                      <motion.div
                        whileHover={{ scale: 1.02, y: -2 }}
                        transition={{ duration: 0.2 }}
                        className={`p-4 rounded-2xl bg-gradient-to-b ${pm.color} border relative overflow-hidden cursor-pointer h-full`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`h-2 w-2 rounded-full ${pm.dot} animate-pulse`} />
                          <Icon size={14} className="text-zinc-300" />
                        </div>
                        <div className="font-bold text-xs text-white mb-0.5">{pm.label}</div>
                        <div className="text-[10px] text-zinc-500 font-semibold mb-2">{pm.sub}</div>
                        <div className="inline-flex items-center gap-1 bg-black/30 border border-white/5 rounded-lg px-1.5 py-0.5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-primary">{pm.badge}</span>
                        </div>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
              <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-[10px] text-zinc-500 font-semibold text-center">
                All payments are <span className="text-primary">auto-verified</span> within seconds. Credits appear instantly after confirmation.
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
