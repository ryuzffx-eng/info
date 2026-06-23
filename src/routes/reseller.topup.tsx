import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Btn } from "@/components/admin/ui";
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
  const handle = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(label ? `${label} copied!` : "Copied!");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      className="flex-shrink-0 h-8 w-8 rounded-lg bg-white/5 border border-white/10 hover:bg-primary/10 hover:border-primary/30 flex items-center justify-center text-zinc-400 hover:text-primary transition-all cursor-pointer"
      title="Copy"
    >
      {copied ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
    </button>
  );
}

/* ─── Active Order Screen ─────────────────────────────────── */
function ActiveOrderView({
  order,
  onCancel,
}: {
  order: any;
  onCancel: () => void;
}) {
  const queryClient = useQueryClient();
  const [timeLeft, setTimeLeft] = useState(1200);
  const [verifying, setVerifying] = useState(false);

  const isBinance = order.payment_method === "binance_pay";
  const networkLabel = isBinance ? "BINANCE PAY C2C" : (order.network?.toUpperCase() ?? "");
  const title = isBinance ? "Binance Pay Transfer" : "USDT Crypto Transfer";

  useEffect(() => {
    setTimeLeft(1200);
  }, [order.order_id]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft]);

  // Auto-poll
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
    const interval = setInterval(poll, 10000);
    return () => { alive = false; clearInterval(interval); };
  }, [order.order_id]);

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await api.reseller.verifyAutoPayment(order.order_id);
      if (res.status === "completed") {
        queryClient.invalidateQueries({ queryKey: ["reseller-profile"] });
        toast.success(res.msg || "Payment verified! Credits added.");
        onCancel();
      } else {
        toast.info(res.msg || "Payment not detected yet. Please wait.");
      }
    } catch (e: any) {
      toast.error(e.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const urgent = timeLeft < 300;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-lg mx-auto px-0 sm:px-4"
    >
      {/* Back */}
      <button
        onClick={onCancel}
        className="mb-4 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-all cursor-pointer"
      >
        <ArrowLeft size={13} /> Back
      </button>

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse shadow-[0_0_10px_var(--primary-glow)]" />
        <h2 className="text-base font-black uppercase tracking-wider text-white">{title}</h2>
        <span className="ml-auto text-[10px] font-bold bg-white/5 border border-white/10 rounded-full px-2.5 py-1 text-zinc-400 uppercase">
          {networkLabel}
        </span>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-zinc-950/80 backdrop-blur-md overflow-hidden">

        {/* Amount banner */}
        <div className="p-5 border-b border-white/[0.06] bg-gradient-to-r from-primary/5 to-transparent flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-0.5">Send Exactly</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-white font-mono">{order.amount?.toFixed(4)}</span>
              <span className="text-base font-black text-primary">USDT</span>
            </div>
            <div className="text-[10px] text-zinc-600 mt-0.5 font-semibold">
              ≈ ${order.amount?.toFixed(2)} USD credit
            </div>
          </div>
          <CopyBtn value={order.amount?.toFixed(4)} label="Amount" />
        </div>

        {/* QR + Address */}
        <div className="p-5 space-y-4">

          {/* QR Code */}
          {order.qr_url && (
            <div className="flex flex-col items-center">
              <div className="relative">
                {/* Corner brackets */}
                <div className="absolute -top-1.5 -left-1.5 w-5 h-5 border-t-2 border-l-2 border-primary rounded-tl-lg z-10" />
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 border-t-2 border-r-2 border-primary rounded-tr-lg z-10" />
                <div className="absolute -bottom-1.5 -left-1.5 w-5 h-5 border-b-2 border-l-2 border-primary rounded-bl-lg z-10" />
                <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 border-b-2 border-r-2 border-primary rounded-br-lg z-10" />
                <div className="h-40 w-40 sm:h-44 sm:w-44 bg-white rounded-xl p-2 overflow-hidden">
                  <img src={order.qr_url} alt="QR Code" className="h-full w-full object-contain select-none" />
                </div>
              </div>
              <p className="mt-3 text-[10px] text-zinc-600 font-semibold">Scan with your crypto wallet</p>
            </div>
          )}

          {/* Payee / Address */}
          <div className="rounded-xl bg-black/40 border border-white/[0.06] p-3.5 space-y-1">
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
          <div className="rounded-xl bg-black/40 border border-white/[0.06] p-3.5 space-y-1">
            <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Payment Note / Order ID</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-[11px] font-mono font-bold text-white truncate">{order.order_id}</code>
              <CopyBtn value={order.order_id} label="Order ID" />
            </div>
          </div>

          {/* Timer + monitoring */}
          <div className={`rounded-xl border p-3 flex items-center justify-between ${urgent ? "border-red-500/30 bg-red-500/5" : "border-primary/10 bg-primary/[0.03]"}`}>
            <div className="flex items-center gap-2">
              {urgent
                ? <Clock size={13} className="text-red-400 animate-pulse" />
                : <Loader2 size={13} className="animate-spin text-primary" />
              }
              <span className={`text-[10px] font-black uppercase tracking-wider ${urgent ? "text-red-400" : "text-primary"}`}>
                {urgent ? "Expiring Soon" : "Auto-Monitoring"}
              </span>
            </div>
            <span className={`font-mono text-sm font-black ${urgent ? "text-red-400" : "text-white"}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            {["1. Send", "2. Verify", "3. Credit"].map((step, i) => (
              <div
                key={step}
                className={`rounded-lg py-2.5 text-center text-[10px] font-black uppercase tracking-wider border ${
                  i === 0
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-white/[0.04] bg-white/[0.01] text-zinc-600"
                }`}
              >
                {step}
              </div>
            ))}
          </div>

          <p className="text-[10px] text-zinc-600 font-semibold leading-relaxed text-center">
            {isBinance
              ? "Send via Binance C2C to the UID above. Include the Order ID as payment note."
              : "Send USDT to the address above on the correct network. Deposits confirmed automatically."}
          </p>
        </div>

        {/* Verify button */}
        <div className="p-4 border-t border-white/[0.06]">
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="w-full h-12 rounded-xl bg-primary text-black font-black text-xs uppercase tracking-wider hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.15)]"
          >
            {verifying ? (
              <><Loader2 size={14} className="animate-spin" /> Verifying...</>
            ) : (
              <><RefreshCw size={14} /> Check Payment Now</>
            )}
          </button>
        </div>
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
  const selectedPlan = plans?.find((p) => p.amount === activeAmount);
  const activeCredits = selectedPlan ? selectedPlan.credits : activeAmount;

  const handleCheckout = async () => {
    if (isNaN(activeAmount) || activeAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setIsProcessing(true);

    /* ── Razorpay ── */
    if (method === "razorpay") {
      try {
        const loaded = await loadRazorpayScript();
        if (!loaded) { toast.error("Failed to load Razorpay. Check internet."); setIsProcessing(false); return; }
        const orderData = await api.reseller.createRazorpayOrder(activeAmount);
        const options = {
          key: orderData.key_id,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Emerite Store",
          description: `Top up $${activeAmount.toFixed(2)}`,
          order_id: orderData.order_id,
          handler: async (response: any) => {
            setIsProcessing(true);
            try {
              const verifyRes = await api.reseller.verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: activeAmount,
              });
              queryClient.invalidateQueries({ queryKey: ["reseller-profile"] });
              toast.success(verifyRes.msg || "Top up successful!");
            } catch (e: any) {
              toast.error(e.message || "Payment verification failed");
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: { name: profile?.username || "", email: profile?.email || "" },
          theme: { color: "#3B82F6" },
          modal: { ondismiss: () => setIsProcessing(false) },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (e: any) {
        toast.error(e.message || "Failed to create Razorpay order");
        setIsProcessing(false);
      }
      return;
    }

    /* ── Binance Pay ── */
    if (method === "binance") {
      try {
        const orderData = await api.reseller.createBinanceOrder(activeAmount);
        setActiveOrder({ ...orderData, payment_method: "binance_pay" });
        toast.success("Binance Pay order created!");
      } catch (e: any) {
        toast.error(e.message || "Failed to create Binance Pay order");
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    /* ── Crypto Transfer ── */
    if (method === "crypto") {
      try {
        const orderData = await api.reseller.createCryptoOrder({ amount: activeAmount, network: cryptoNetwork });
        setActiveOrder({ ...orderData, payment_method: "crypto" });
        toast.success("Crypto transfer initialized!");
      } catch (e: any) {
        toast.error(e.message || "Failed to initialize crypto transfer");
      } finally {
        setIsProcessing(false);
      }
      return;
    }
  };

  if (isProfileLoading || isPlansLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  /* ─── Active order view ── */
  if (activeOrder) {
    return (
      <div className="py-4 sm:py-6">
        <AnimatePresence mode="wait">
          <ActiveOrderView order={activeOrder} onCancel={() => setActiveOrder(null)} />
        </AnimatePresence>
      </div>
    );
  }

  /* ─── Checkout form ── */
  return (
    <div className="pb-24 sm:pb-8">
      <PageHeader
        title="Top Up Balance"
        subtitle="Fund your reseller account to generate license keys."
      />

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">

        {/* ── LEFT: Balance + Packages ── */}
        <div className="space-y-4">

          {/* Balance card */}
          <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-zinc-950 to-black p-5">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/15 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Wallet size={14} className="text-primary" />
                </div>
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Balance</span>
              </div>
              <div className="text-3xl font-black text-white">
                {profile?.role === "admin" ? "Unlimited" : `$${(profile?.credits || 0).toFixed(2)}`}
              </div>
              <div className="text-[10px] text-zinc-600 mt-0.5 font-bold uppercase tracking-wider">
                {profile?.role === "admin" ? "Admin Account" : "USD Available"}
              </div>
            </div>
          </div>

          {/* Packages */}
          <div className="rounded-2xl border border-white/[0.07] bg-zinc-950/60 p-4 space-y-3">
            <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Select Package</h3>
            <div className="grid grid-cols-3 sm:grid-cols-3 gap-2">
              {(plans && plans.length > 0 ? plans : PRESET_AMOUNTS.map((a) => ({ id: a, amount: a, credits: a }))).map((plan: any) => (
                <button
                  key={plan.id}
                  onClick={() => { setAmount(plan.amount); setCustomAmount(""); }}
                  className={`py-3 px-1 rounded-xl text-center border transition-all flex flex-col items-center justify-center cursor-pointer gap-0.5 ${
                    !customAmount && amount === plan.amount
                      ? "border-primary bg-primary/10 text-primary shadow-[0_0_16px_var(--primary-glow)]"
                      : "border-white/[0.06] bg-white/[0.02] text-zinc-500 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <span className="font-black text-sm">${plan.amount}</span>
                  <span className="text-[9px] font-black uppercase text-primary">{plan.credits} cr</span>
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <div className="relative">
              <input
                type="number"
                placeholder="Custom amount"
                value={customAmount}
                onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }}
                className="w-full h-11 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white font-bold outline-none focus:border-primary/40 placeholder:text-zinc-600 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-600">USD</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Method + Checkout ── */}
        <div className="space-y-4">

          {/* Method tabs — horizontal pill strip */}
          <div className="rounded-2xl border border-white/[0.07] bg-zinc-950/60 p-4 space-y-4">
            <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Payment Method</h3>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "razorpay", label: "Razorpay", sub: "UPI / Cards", icon: CreditCard, color: "from-blue-600", dot: "bg-blue-500" },
                { id: "binance", label: "Binance Pay", sub: "C2C USDT", icon: Coins, color: "from-amber-500", dot: "bg-amber-400" },
                { id: "crypto", label: "Crypto", sub: "TRC20 / ERC20", icon: QrCode, color: "from-teal-500", dot: "bg-teal-400" },
              ].map((m) => {
                const Icon = m.icon;
                const active = method === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m.id as any)}
                    className={`relative flex flex-col items-center justify-center gap-1.5 rounded-xl py-3.5 px-2 border transition-all cursor-pointer overflow-hidden ${
                      active
                        ? "border-primary/40 bg-primary/10 text-white"
                        : "border-white/[0.06] bg-white/[0.02] text-zinc-500 hover:border-white/15 hover:text-zinc-300"
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="method-bg"
                        className="absolute inset-0 bg-primary/5 rounded-xl"
                      />
                    )}
                    <div className="relative flex flex-col items-center gap-1">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${active ? "border-primary/30 bg-primary/10 text-primary" : "border-white/10 bg-white/[0.04] text-zinc-500"}`}>
                        <Icon size={15} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider leading-none">{m.label}</span>
                      <span className="text-[8px] font-semibold text-zinc-600 leading-none">{m.sub}</span>
                    </div>
                    {active && (
                      <div className={`h-1 w-6 rounded-full bg-primary shadow-[0_0_8px_var(--primary-glow)]`} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Method-specific info panel */}
            <AnimatePresence mode="wait">
              {method === "razorpay" && (
                <motion.div key="rzp" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="rounded-xl bg-blue-950/30 border border-blue-500/15 p-4 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                    <span className="text-[11px] font-bold text-zinc-300">UPI / Netbanking / Cards</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-lg bg-black/30 p-2.5 border border-white/[0.04]">
                      <div className="text-zinc-500 mb-0.5">Exchange Rate</div>
                      <div className="font-bold text-white">1 USD = 100 INR</div>
                    </div>
                    <div className="rounded-lg bg-black/30 p-2.5 border border-white/[0.04]">
                      <div className="text-zinc-500 mb-0.5">You Pay</div>
                      <div className="font-bold text-blue-400">₹{(activeAmount * 100).toLocaleString("en-IN")} INR</div>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-600 leading-relaxed">Secure checkout via Razorpay. Credits credited instantly after payment.</p>
                </motion.div>
              )}

              {method === "binance" && (
                <motion.div key="bnb" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="rounded-xl bg-amber-950/20 border border-amber-500/15 p-4 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-[11px] font-bold text-zinc-300">Binance C2C Pay to UID</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-lg bg-black/30 p-2.5 border border-white/[0.04]">
                      <div className="text-zinc-500 mb-0.5">Currency</div>
                      <div className="font-bold text-amber-400">USDT (1:1 USD)</div>
                    </div>
                    <div className="rounded-lg bg-black/30 p-2.5 border border-white/[0.04]">
                      <div className="text-zinc-500 mb-0.5">You Send</div>
                      <div className="font-bold text-white">{activeAmount.toFixed(2)} USDT</div>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-600 leading-relaxed">Payment is auto-detected via Binance Open API within seconds.</p>
                </motion.div>
              )}

              {method === "crypto" && (
                <motion.div key="crypto" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="rounded-xl bg-teal-950/15 border border-teal-500/15 p-4 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
                    <span className="text-[11px] font-bold text-zinc-300">Select Blockchain Network</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(["trc20", "erc20", "bep20"] as const).map((net) => (
                      <button
                        key={net}
                        onClick={() => setCryptoNetwork(net)}
                        className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                          cryptoNetwork === net
                            ? "border-teal-500/50 bg-teal-500/10 text-teal-400"
                            : "border-white/[0.06] bg-white/[0.02] text-zinc-600 hover:border-white/15"
                        }`}
                      >
                        {net === "bep20" ? "BSC/BEP20" : net}
                      </button>
                    ))}
                  </div>
                  <div className="text-[10px] text-zinc-600 font-semibold p-2.5 rounded-lg border border-teal-500/10 bg-teal-500/[0.03] text-center">
                    ⚠️ Only send on the selected network or funds will be lost
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Summary + Pay button */}
          <div className="rounded-2xl border border-white/[0.07] bg-zinc-950/60 p-4">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <div className="text-[10px] text-zinc-600 uppercase font-black tracking-wider">Checkout Total</div>
                <div className="text-2xl font-black text-white mt-0.5">${activeAmount.toFixed(2)}</div>
              </div>
              <div className="border-l border-white/[0.08] pl-4">
                <div className="text-[10px] text-zinc-600 uppercase font-black tracking-wider">Credits Received</div>
                <div className="text-2xl font-black text-primary mt-0.5">{activeCredits}</div>
              </div>
              <div className="ml-auto flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/5 border border-primary/15 rounded-full px-2.5 py-1">
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
                  {method === "binance" && <><Coins size={15} /> Pay with Binance</>}
                  {method === "crypto" && <><QrCode size={15} /> Send USDT</>}
                  <ArrowRight size={14} />
                </>
              )}
            </button>

            <p className="text-[10px] text-zinc-600 text-center mt-3 font-semibold">
              Secured & auto-verified. Credits appear instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
