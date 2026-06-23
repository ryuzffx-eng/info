import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card } from "@/components/admin/ui";
import {
  Wallet, CreditCard, Loader2, Check, ArrowRight, ArrowLeft,
  QrCode, Coins, Copy, RefreshCw, Clock, Zap,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/reseller/topup")({ component: ResellerTopup });

const PRESET_AMOUNTS = [10, 25, 50, 100, 250];

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if ((window as any).Razorpay) { resolve(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

function CopyBtn({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(value);
        setCopied(true);
        toast.success(label ? `${label} copied!` : "Copied!");
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex-shrink-0 h-9 w-9 rounded-lg glass border-white/10 hover:border-primary/30 flex items-center justify-center text-zinc-400 hover:text-primary transition-all cursor-pointer"
      title="Copy"
    >
      {copied ? <Check size={13} className="text-primary" /> : <Copy size={13} />}
    </button>
  );
}

/* ─── Active Order Screen ─────────────────────────────────── */
function ActiveOrderView({ order, onCancel }: { order: any; onCancel: () => void }) {
  const queryClient = useQueryClient();
  const [timeLeft, setTimeLeft] = useState(1200);
  const isBinance = order.payment_method === "binance_pay";
  const networkLabel = isBinance ? "BINANCE PAY" : (order.network?.toUpperCase() ?? "CRYPTO");

  useEffect(() => { setTimeLeft(1200); }, [order.order_id]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  useEffect(() => {
    let alive = true;
    const poll = async () => {
      try {
        const res = await api.reseller.verifyAutoPayment(order.order_id);
        if (res.status === "completed" && alive) {
          queryClient.invalidateQueries({ queryKey: ["reseller-profile"] });
          toast.success(res.msg || "Payment verified! Credits added.");
          onCancel();
        }
      } catch {}
    };
    poll(); // Initial check
    const interval = setInterval(poll, 5000);
    return () => { alive = false; clearInterval(interval); };
  }, [order.order_id]);

  const urgent = timeLeft < 300;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-lg mx-auto"
    >
      <button
        onClick={onCancel}
        className="mb-4 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-all cursor-pointer"
      >
        <ArrowLeft size={13} /> Back
      </button>

      <div className="flex items-center gap-2.5 mb-5">
        <div className="h-2 w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_var(--primary-glow)]" />
        <h2 className="text-base font-black uppercase tracking-wider text-white">
          {isBinance ? "Binance Pay Transfer" : "USDT Crypto Transfer"}
        </h2>
        <span className="ml-auto glass rounded-full px-2.5 py-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
          {networkLabel}
        </span>
      </div>

      {/* Card */}
      <div className="glass-card rounded-2xl overflow-hidden p-5 space-y-4">

        {/* Amount banner */}
        <div className="-mx-5 -mt-5 p-5 border-b border-white/[0.07] bg-gradient-to-r from-primary/8 to-transparent flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Send Exactly</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono tracking-tight">{order.amount?.toFixed(4)}</span>
              <span className="text-lg font-black text-primary">USDT</span>
            </div>
            <div className="text-[10px] text-zinc-600 mt-0.5 font-semibold">≈ ${order.amount?.toFixed(2)} USD credit</div>
          </div>
          <CopyBtn value={order.amount?.toFixed(4)} label="Amount" />
        </div>

        {/* QR Code */}
        {order.qr_url && (
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="absolute -top-1.5 -left-1.5 w-5 h-5 border-t-2 border-l-2 border-primary rounded-tl-lg z-10" />
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 border-t-2 border-r-2 border-primary rounded-tr-lg z-10" />
              <div className="absolute -bottom-1.5 -left-1.5 w-5 h-5 border-b-2 border-l-2 border-primary rounded-bl-lg z-10" />
              <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 border-b-2 border-r-2 border-primary rounded-br-lg z-10" />
              <div className="h-40 w-40 bg-white rounded-xl p-2">
                <img src={order.qr_url} alt="QR Code" className="h-full w-full object-contain select-none" />
              </div>
            </div>
            <p className="mt-3 text-[10px] text-zinc-600 font-semibold">Scan with your crypto wallet</p>
          </div>
        )}

        {/* Address */}
        <div className="glass rounded-xl p-3.5 space-y-1.5">
          <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
            {isBinance ? "Binance UID (Payee)" : "USDT Deposit Address"}
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-[11px] font-mono font-bold text-white break-all leading-relaxed">
              {order.wallet_address}
            </code>
            <CopyBtn value={order.wallet_address} label={isBinance ? "UID" : "Address"} />
          </div>
        </div>

        {/* Order ID */}
        <div className="glass rounded-xl p-3.5 space-y-1.5">
          <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Payment Note / Order ID</div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-[11px] font-mono font-bold text-white truncate">{order.order_id}</code>
            <CopyBtn value={order.order_id} label="Order ID" />
          </div>
        </div>

        {/* Timer */}
        <div className={`glass rounded-xl p-3 flex items-center justify-between ${urgent ? "border-red-500/30" : "border-primary/15"}`}>
          <div className="flex items-center gap-2">
            {urgent
              ? <Clock size={13} className="text-red-400 animate-pulse" />
              : <Loader2 size={13} className="animate-spin text-primary" />
            }
            <span className={`text-[10px] font-black uppercase tracking-wider ${urgent ? "text-red-400" : "text-primary"}`}>
              {urgent ? "Expiring Soon" : "Monitoring Transfers"}
            </span>
          </div>
          <span className={`font-mono text-sm font-black ${urgent ? "text-red-400" : "text-white"}`}>
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-3 gap-1.5">
          {["1. Send", "2. Verify", "3. Credit"].map((step, i) => (
            <div key={step} className={`glass rounded-lg py-2.5 text-center text-[10px] font-black uppercase tracking-wider ${i === 0 ? "border-primary/40 text-primary" : "text-zinc-600"}`}>
              {step}
            </div>
          ))}
        </div>

        <p className="text-[10px] text-zinc-600 font-semibold leading-relaxed text-center">
          {isBinance
            ? "Send via Binance C2C to the UID above. Include Order ID as payment note."
            : "Send USDT on the correct network. Auto-detected on confirmation."}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Main Topup Component ───────────────────────────────── */
function ResellerTopup() {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [method, setMethod] = useState<"razorpay" | "binance" | "crypto">("razorpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [cryptoNetwork, setCryptoNetwork] = useState<"trc20" | "erc20" | "bep20">("trc20");

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["reseller-profile"],
    queryFn: () => api.reseller.getProfile(),
  });

  const { data: plans, isLoading: isPlansLoading } = useQuery<any[]>({
    queryKey: ["reseller-topup-plans"],
    queryFn: () => api.reseller.getTopupPlans(),
  });

  useEffect(() => {
    if (plans && plans.length > 0 && amount === 50 && !customAmount) {
      const def = plans.find((p) => p.amount === 50) || plans[0];
      setAmount(def.amount);
    }
  }, [plans]);

  const activeAmount = customAmount ? parseFloat(customAmount) || 0 : amount;

  const calculateCredits = (amt: number) => {
    const selectedPlan = plans?.find((p) => p.amount === amt);
    let baseCredits = selectedPlan ? selectedPlan.credits : amt;
    if (profile?.topup_bonus_enabled && amt <= profile.topup_bonus_threshold && amt > 0) {
      const bonus = Math.floor(baseCredits * (profile.topup_bonus_percent / 100));
      return { base: baseCredits, bonus, total: baseCredits + bonus };
    }
    return { base: baseCredits, bonus: 0, total: baseCredits };
  };

  const { base: baseCredits, bonus: bonusCredits, total: activeCredits } = calculateCredits(activeAmount);

  const handleCheckout = async () => {
    if (isNaN(activeAmount) || activeAmount <= 0) { toast.error("Please enter a valid amount"); return; }
    setIsProcessing(true);

    if (method === "razorpay") {
      try {
        const loaded = await loadRazorpayScript();
        if (!loaded) { toast.error("Failed to load Razorpay."); setIsProcessing(false); return; }
        const orderData = await api.reseller.createRazorpayOrder(activeAmount);
        new (window as any).Razorpay({
          key: orderData.key_id, amount: orderData.amount, currency: orderData.currency,
          name: "Emerite Store", description: `Top up $${activeAmount.toFixed(2)}`,
          order_id: orderData.order_id,
          handler: async (response: any) => {
            setIsProcessing(true);
            try {
              const r = await api.reseller.verifyRazorpayPayment({ ...response, amount: activeAmount });
              queryClient.invalidateQueries({ queryKey: ["reseller-profile"] });
              toast.success(r.msg || "Top up successful!");
            } catch (e: any) { toast.error(e.message || "Verification failed"); }
            finally { setIsProcessing(false); }
          },
          prefill: { name: profile?.username || "", email: profile?.email || "" },
          theme: { color: "#3B82F6" },
          modal: { ondismiss: () => setIsProcessing(false) },
        }).open();
      } catch (e: any) { toast.error(e.message || "Failed to create order"); setIsProcessing(false); }
      return;
    }

    if (method === "binance") {
      try {
        const d = await api.reseller.createBinanceOrder(activeAmount);
        setActiveOrder({ ...d, payment_method: "binance_pay" });
        toast.success("Binance Pay order created!");
      } catch (e: any) { toast.error(e.message || "Failed"); }
      finally { setIsProcessing(false); }
      return;
    }

    if (method === "crypto") {
      try {
        const d = await api.reseller.createCryptoOrder({ amount: activeAmount, network: cryptoNetwork });
        setActiveOrder({ ...d, payment_method: "crypto" });
        toast.success("Crypto transfer initialized!");
      } catch (e: any) { toast.error(e.message || "Failed"); }
      finally { setIsProcessing(false); }
      return;
    }
  };

  if (isProfileLoading || isPlansLoading) {
    return <div className="flex h-[70vh] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
  }

  if (activeOrder) {
    return (
      <div className="py-4 sm:py-8">
        <AnimatePresence mode="wait">
          <ActiveOrderView order={activeOrder} onCancel={() => setActiveOrder(null)} />
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="pb-24 sm:pb-8">
      <PageHeader title="Top Up Balance" subtitle="Fund your reseller account to generate license keys." />

      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">

        {/* ── LEFT ── */}
        <div className="space-y-4">

          {/* Balance */}
          <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/20 blur-2xl pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg glass flex items-center justify-center border-primary/20">
                  <Wallet size={14} className="text-primary" />
                </div>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Balance</span>
              </div>
              <div className="text-3xl font-black text-white">
                {profile?.role === "admin" ? "Unlimited" : `$${(profile?.credits || 0).toFixed(2)}`}
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5 font-bold uppercase tracking-wider">
                {profile?.role === "admin" ? "Admin Account" : "USD Available"}
              </div>
            </div>
          </div>

          {/* Packages */}
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Select Package</h3>
            <div className="grid grid-cols-3 gap-2">
              {(plans && plans.length > 0 ? plans : PRESET_AMOUNTS.map((a) => ({ id: a, amount: a, credits: a }))).map((plan: any) => {
                const bonusInfo = calculateCredits(plan.amount);
                return (
                  <button
                    key={plan.id}
                    onClick={() => { setAmount(plan.amount); setCustomAmount(""); }}
                    className={`py-3 px-1 rounded-xl text-center border transition-all flex flex-col items-center gap-0.5 cursor-pointer ${
                      !customAmount && amount === plan.amount
                        ? "border-primary bg-primary/10 text-primary shadow-[0_0_16px_var(--primary-glow)] border-primary/50"
                        : "glass text-zinc-500 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <span className="font-black text-sm">${plan.amount}</span>
                    <span className="text-[9px] font-black text-primary">
                      {plan.credits} cr
                      {bonusInfo.bonus > 0 && <span className="text-emerald-400 ml-0.5">+{bonusInfo.bonus}</span>}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative mt-3">
              <input
                type="number"
                placeholder="Custom amount"
                value={customAmount}
                onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }}
                className="glass-input w-full h-11 rounded-xl px-4 text-sm text-white font-bold outline-none placeholder:text-zinc-600"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-600">USD</span>
            </div>

            {profile?.topup_bonus_enabled && (
              <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                  🎁 active bonus: +{profile.topup_bonus_percent}% credits
                </span>
                <span className="text-[9px] text-zinc-500 font-semibold block mt-0.5">
                  Applied to all deposits up to ${profile.topup_bonus_threshold}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="space-y-4">

          {/* Method tabs + info */}
          <div className="glass-card rounded-2xl p-4 space-y-4">
            <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Payment Method</h3>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "razorpay", label: "Razorpay", sub: "UPI / Cards", icon: CreditCard },
                { id: "binance",  label: "Binance",  sub: "C2C USDT",   icon: Coins },
                { id: "crypto",   label: "Crypto",   sub: "TRC20/ERC20", icon: QrCode },
              ].map((m) => {
                const Icon = m.icon;
                const active = method === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id as any)}
                    className={`relative flex flex-col items-center justify-center gap-1.5 rounded-xl py-3.5 px-2 border transition-all cursor-pointer ${
                      active ? "border-primary/40 bg-primary/8 text-white" : "glass text-zinc-500 hover:border-white/15 hover:text-zinc-300"
                    }`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${active ? "border-primary/30 bg-primary/10 text-primary" : "glass text-zinc-500"}`}>
                      <Icon size={15} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider leading-none">{m.label}</span>
                    <span className="text-[8px] font-semibold text-zinc-600 leading-none">{m.sub}</span>
                    {active && <div className="h-0.5 w-6 rounded-full bg-primary shadow-[0_0_8px_var(--primary-glow)]" />}
                  </button>
                );
              })}
            </div>

            {/* Info panels */}
            <AnimatePresence mode="wait">
              {method === "razorpay" && (
                <motion.div key="rzp" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="glass rounded-xl p-4 space-y-3 border-blue-500/15"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                    <span className="text-[11px] font-bold text-zinc-300">UPI / Netbanking / Cards</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="glass rounded-lg p-2.5">
                      <div className="text-zinc-500 mb-0.5">Rate</div>
                      <div className="font-bold text-white">1 USD = 100 INR</div>
                    </div>
                    <div className="glass rounded-lg p-2.5">
                      <div className="text-zinc-500 mb-0.5">You Pay</div>
                      <div className="font-bold text-blue-400">₹{(activeAmount * 100).toLocaleString("en-IN")}</div>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-600">Secure Razorpay checkout. Credits credited instantly.</p>
                </motion.div>
              )}

              {method === "binance" && (
                <motion.div key="bnb" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="glass rounded-xl p-4 space-y-3 border-amber-500/15"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[11px] font-bold text-zinc-300">Binance C2C Pay to UID</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="glass rounded-lg p-2.5">
                      <div className="text-zinc-500 mb-0.5">Currency</div>
                      <div className="font-bold text-amber-400">USDT (1:1)</div>
                    </div>
                    <div className="glass rounded-lg p-2.5">
                      <div className="text-zinc-500 mb-0.5">You Send</div>
                      <div className="font-bold text-white">{activeAmount.toFixed(2)} USDT</div>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-600">Auto-detected via Binance Open API within seconds.</p>
                </motion.div>
              )}

              {method === "crypto" && (
                <motion.div key="crypto" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="glass rounded-xl p-4 space-y-3 border-teal-500/15"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                    <span className="text-[11px] font-bold text-zinc-300">Select Blockchain Network</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(["trc20", "erc20", "bep20"] as const).map((net) => (
                      <button key={net} onClick={() => setCryptoNetwork(net)}
                        className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                          cryptoNetwork === net ? "border-teal-500/50 bg-teal-500/10 text-teal-400" : "glass text-zinc-600 hover:border-white/15"
                        }`}
                      >
                        {net === "bep20" ? "BSC" : net}
                      </button>
                    ))}
                  </div>
                  <div className="glass rounded-lg p-2.5 text-center text-[10px] text-zinc-600 font-semibold">
                    ⚠️ Only send on the selected network or funds will be lost
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Summary + Pay */}
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-4 mb-4">
              <div>
                <div className="text-[10px] text-zinc-600 uppercase font-black tracking-wider">Total</div>
                <div className="text-2xl font-black text-white">${activeAmount.toFixed(2)}</div>
              </div>
              <div className="border-l border-white/[0.08] pl-4">
                <div className="text-[10px] text-zinc-600 uppercase font-black tracking-wider">Credits</div>
                <div className="text-2xl font-black text-primary">
                  {activeCredits}
                  {bonusCredits > 0 && (
                    <span className="text-xs text-emerald-400 ml-1.5 font-black">({baseCredits} + {bonusCredits} bonus)</span>
                  )}
                </div>
              </div>
              <div className="ml-auto flex items-center gap-1 text-[10px] font-bold text-primary glass rounded-full px-2.5 py-1 border-primary/20">
                <Zap size={10} /> Instant
              </div>
            </div>

            <button
              disabled={isProcessing || activeAmount <= 0}
              onClick={handleCheckout}
              className="w-full h-12 rounded-xl bg-primary text-black font-black text-sm uppercase tracking-wider hover:bg-primary/90 disabled:opacity-40 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_24px_var(--primary-glow)]"
            >
              {isProcessing ? (
                <><Loader2 size={15} className="animate-spin" /> Processing...</>
              ) : (
                <>
                  {method === "razorpay" && <><CreditCard size={15} /> Pay with Razorpay</>}
                  {method === "binance"  && <><Coins size={15} /> Pay with Binance</>}
                  {method === "crypto"   && <><QrCode size={15} /> Send USDT</>}
                  <ArrowRight size={14} />
                </>
              )}
            </button>

            <p className="text-[10px] text-zinc-600 text-center mt-3 font-semibold">
              Secured & auto-verified · Credits appear instantly
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
