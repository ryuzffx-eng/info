import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Btn, Badge } from "@/components/admin/ui";
import { Wallet, CreditCard, Gift, Loader2, Sparkles, Check, ArrowRight, QrCode, Coins, ExternalLink } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/reseller/topup")({ component: ResellerTopup });

const PRESET_AMOUNTS = [10, 25, 50, 100, 250];

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function ResellerTopup() {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [method, setMethod] = useState<"razorpay" | "binance" | "crypto">("razorpay");
  const [isProcessing, setIsProcessing] = useState(false);

  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [cryptoNetwork, setCryptoNetwork] = useState<"trc20" | "erc20" | "bep20">("trc20");
  const [timeLeft, setTimeLeft] = useState<number>(1200); // 20 minutes

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
      const defaultPlan = plans.find(p => p.amount === 50) || plans[0];
      setAmount(defaultPlan.amount);
    }
  }, [plans]);

  useEffect(() => {
    if (!activeOrder) return;
    setTimeLeft(1200); // reset to 20 mins
  }, [activeOrder]);

  useEffect(() => {
    if (!activeOrder || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeOrder, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Autopolling payment status every 10 seconds
  useEffect(() => {
    if (!activeOrder) return;

    let isSubscribed = true;
    const checkPayment = async () => {
      try {
        const verifyRes = await api.reseller.verifyAutoPayment(activeOrder.order_id);
        if (verifyRes.status === "completed") {
          if (isSubscribed) {
            queryClient.invalidateQueries({ queryKey: ["reseller-profile"] });
            toast.success(verifyRes.msg || "Payment verified and credited!");
            setActiveOrder(null);
          }
        }
      } catch (err) {
        // Silently ignore background polling exceptions
      }
    };

    const interval = setInterval(checkPayment, 10000);
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [activeOrder, queryClient]);

  const handleCheckout = async () => {
    const finalAmount = customAmount ? parseFloat(customAmount) : amount;
    if (isNaN(finalAmount) || finalAmount <= 0) {
      toast.error("Please enter a valid positive amount");
      return;
    }

    setIsProcessing(true);

    if (method === "razorpay") {
      try {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          toast.error("Failed to load Razorpay SDK. Please check your internet connection.");
          setIsProcessing(false);
          return;
        }

        const orderData = await api.reseller.createRazorpayOrder(finalAmount);
        
        const options = {
          key: orderData.key_id,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Emerite Store",
          description: `Top up reseller account with $${finalAmount.toFixed(2)}`,
          order_id: orderData.order_id,
          handler: async function (response: any) {
            setIsProcessing(true);
            try {
              const verifyRes = await api.reseller.verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: finalAmount
              });
              queryClient.invalidateQueries({ queryKey: ["reseller-profile"] });
              toast.success(verifyRes.msg || "Top up successful!");
            } catch (err: any) {
              toast.error(err.message || "Payment verification failed");
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            name: profile?.username || "",
            email: profile?.email || "",
          },
          theme: {
            color: "#3B82F6",
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (err: any) {
        toast.error(err.message || "Failed to create Razorpay order");
        setIsProcessing(false);
      }
      return;
    }

    if (method === "binance") {
      try {
        const orderData = await api.reseller.createBinanceOrder(finalAmount);
        setActiveOrder({
          ...orderData,
          payment_method: "binance_pay"
        });
        toast.success("Binance Pay transfer initialized!");
      } catch (err: any) {
        toast.error(err.message || "Failed to create Binance Pay order");
      } finally {
        setIsProcessing(false);
      }
      return;
    }

    if (method === "crypto") {
      try {
        const orderData = await api.reseller.createCryptoOrder({
          amount: finalAmount,
          network: cryptoNetwork
        });
        setActiveOrder({
          ...orderData,
          payment_method: "crypto"
        });
        toast.success("USDT Direct Transfer initialized!");
      } catch (err: any) {
        toast.error(err.message || "Failed to initialize Crypto Transfer");
      } finally {
        setIsProcessing(false);
      }
      return;
    }
  };

  const handleManualVerify = async () => {
    if (!activeOrder) return;
    setIsProcessing(true);
    try {
      const verifyRes = await api.reseller.verifyAutoPayment(activeOrder.order_id);
      if (verifyRes.status === "completed") {
        queryClient.invalidateQueries({ queryKey: ["reseller-profile"] });
        toast.success(verifyRes.msg || "Payment verified and credited!");
        setActiveOrder(null);
      } else {
        toast.info(verifyRes.msg || "Payment is still pending on the network.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to verify payment");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProfileLoading || isPlansLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeAmount = customAmount ? parseFloat(customAmount) || 0 : amount;
  const selectedPlan = plans?.find(p => p.amount === activeAmount);
  const activeCredits = selectedPlan ? selectedPlan.credits : activeAmount;

  if (activeOrder) {
    const isBinancePay = activeOrder.payment_method === "binance_pay";
    const title = isBinancePay ? "BINANCE PAY SECURE PAYMENT" : "USDT DIRECT TRANSFER";
    const networkName = isBinancePay ? "BINANCE PAY C2C" : activeOrder.network;
    const payeeLabel = isBinancePay ? "BINANCE UID (PAYEE)" : "USDT DEPOSIT ADDRESS";

    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_var(--primary-glow)]" />
          <h2 className="text-xl font-black uppercase tracking-wider text-white select-none">{title}</h2>
        </div>

        <Card className="relative p-8 md:p-12 overflow-hidden border-primary/20 bg-zinc-950/80 backdrop-blur-md">
          {/* Top Cancel button */}
          <button 
            onClick={() => setActiveOrder(null)}
            className="absolute left-6 top-6 flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 hover:text-zinc-200 transition-all border-none bg-transparent outline-none cursor-pointer"
          >
            ← Cancel
          </button>

          <div className="flex flex-col items-center text-center mt-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Payment Amount</span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="font-display text-4xl font-black text-white">{activeOrder.amount.toFixed(4)}</span>
              <span className="font-display text-2xl font-black text-primary">USDT</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(activeOrder.amount.toFixed(4));
                  toast.success("Amount copied!");
                }}
                className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-all ml-1 cursor-pointer"
                title="Copy Amount"
              >
                <Wallet size={12} />
              </button>
            </div>
            <span className="text-[10px] font-bold text-zinc-400 mt-1.5 uppercase tracking-wide">
              Network: <span className="text-white font-extrabold">{networkName}</span>
            </span>

            {/* QR Code Container with scanning effect */}
            <div className="relative mt-8 group">
              <div className="absolute -inset-2 border-2 border-primary/20 rounded-2xl group-hover:border-primary/40 transition-all duration-500" />
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-lg" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-lg" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-lg" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-lg" />
              
              <div className="relative h-48 w-48 bg-white p-2 rounded-xl flex items-center justify-center overflow-hidden">
                <img src={activeOrder.qr_url} alt="USDT QR Code" className="h-full w-full object-contain select-none" />
                <div className="absolute left-0 right-0 h-[2px] bg-primary animate-[bounce_3s_infinite] opacity-70" />
              </div>
            </div>

            {/* Payee Info Fields */}
            <div className="grid gap-4 w-full max-w-lg mt-8 sm:grid-cols-2">
              <div className="bg-black/40 rounded-xl p-3.5 border border-white/5 text-left flex flex-col justify-between group relative min-w-0">
                <div className="min-w-0 pr-8">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">{payeeLabel}</span>
                  <code className="text-[11px] font-mono font-bold text-white block mt-1 truncate select-all">
                    {activeOrder.wallet_address}
                  </code>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeOrder.wallet_address);
                    toast.success("Address copied!");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
                  title="Copy Address"
                >
                  <CreditCard size={12} />
                </button>
              </div>

              <div className="bg-black/40 rounded-xl p-3.5 border border-white/5 text-left flex flex-col justify-between group relative min-w-0">
                <div className="min-w-0 pr-8">
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Payment Note / Order ID</span>
                  <code className="text-[11px] font-mono font-bold text-white block mt-1 truncate select-all">
                    {activeOrder.order_id}
                  </code>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeOrder.order_id);
                    toast.success("Order ID copied!");
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
                  title="Copy Order ID"
                >
                  <Gift size={12} />
                </button>
              </div>
            </div>

            {/* Monitoring Banner */}
            <div className="w-full max-w-lg mt-6 bg-primary/[0.03] border border-primary/10 rounded-xl p-3 px-4 flex items-center justify-between text-xs font-bold text-zinc-400">
              <div className="flex items-center gap-2">
                <Loader2 size={13} className="animate-spin text-primary" />
                <span className="text-[10px] tracking-wider uppercase text-primary">Monitoring Transfers</span>
              </div>
              <div className="text-[10px] uppercase text-zinc-500">
                Expires: <span className="text-white font-mono">{formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* Progress Stepper */}
            <div className="w-full max-w-lg mt-8">
              <div className="grid grid-cols-3 gap-2 relative">
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-blue-500 w-1/3" />
                </div>
                
                <div className="pt-3 text-center border-t-2 border-primary">
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary">1. Send</span>
                </div>
                <div className="pt-3 text-center border-t border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600">2. Verify</span>
                </div>
                <div className="pt-3 text-center border-t border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600">3. Release</span>
                </div>
              </div>

              <p className="text-[10px] text-zinc-500 leading-relaxed font-semibold text-center mt-5 max-w-sm mx-auto">
                {isBinancePay 
                  ? "Do not close this page. C2C transfers to the payee UID are monitored and verified automatically."
                  : "Send from any crypto wallet. Deposits are automatically validated on confirmation."
                }
              </p>
            </div>

            {/* Manual Check Button */}
            <div className="mt-8 flex gap-3 w-full max-w-xs justify-center">
              <button
                onClick={handleManualVerify}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl bg-primary text-black font-extrabold text-xs uppercase tracking-wider hover:bg-primary/95 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(59,130,246,0.2)] cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Check size={13} />
                    Verify Now
                  </>
                )}
              </button>
            </div>

          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader 
        title="Top Up Balance" 
        subtitle="Purchase reseller credit balance instantly to generate license keys." 
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left column: Balance Summary & Presets */}
        <div className="md:col-span-1 space-y-6">
          <Card className="relative overflow-hidden group border-primary/20">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/10 blur-xl opacity-75" />
            <div className="flex items-center gap-3 mb-4">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <Wallet size={16} />
              </div>
              <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Reseller Balance</h4>
            </div>
            <div className="font-display text-3xl font-black text-white">
              {profile?.role === "admin" ? "Unlimited" : `$${(profile?.credits || 0).toFixed(2)}`}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-wider">
              {profile?.role === "admin" ? "Admin Account" : "Available Credit"}
            </div>
          </Card>

          <Card className="space-y-4">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">Select Package</h3>
            <div className="grid grid-cols-2 gap-2">
              {plans && plans.length > 0 ? (
                plans.map((plan: any) => (
                  <button
                    key={plan.id}
                    onClick={() => {
                      setAmount(plan.amount);
                      setCustomAmount("");
                    }}
                    className={`py-3 px-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center cursor-pointer ${
                      !customAmount && amount === plan.amount
                        ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_var(--primary-glow)]"
                        : "border-white/5 bg-white/[0.02] text-muted-foreground hover:border-white/20 hover:text-foreground"
                    }`}
                    title={plan.description || ""}
                  >
                    <span className="font-extrabold text-sm">${plan.amount}</span>
                    <span className="text-[9px] font-black uppercase tracking-wider text-primary mt-0.5">{plan.credits} Credits</span>
                  </button>
                ))
              ) : (
                PRESET_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      setAmount(amt);
                      setCustomAmount("");
                    }}
                    className={`py-3 px-2 rounded-xl text-center border font-bold text-sm transition-all cursor-pointer ${
                      !customAmount && amount === amt
                        ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_var(--primary-glow)]"
                        : "border-white/5 bg-white/[0.02] text-muted-foreground hover:border-white/20 hover:text-foreground"
                    }`}
                  >
                    ${amt}
                  </button>
                ))
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                placeholder="Custom Amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setAmount(0);
                }}
                className="w-full rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm outline-none focus:border-primary/50 text-white font-bold"
              />
              <span className="absolute right-3 top-3 text-xs text-muted-foreground/60 font-bold">USD</span>
            </div>
          </Card>
        </div>

        {/* Right column: Methods & Payment Checkout */}
        <div className="md:col-span-2 space-y-6">
          <Card className="space-y-6">
            <div>
              <h3 className="font-bold text-lg text-white">Choose Payment Method</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Select how you want to fund your reseller account.</p>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-white/[0.02] rounded-xl border border-white/5">
              <button
                onClick={() => { setMethod("razorpay"); }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  method === "razorpay" ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CreditCard size={14} />
                Razorpay
              </button>
              <button
                onClick={() => { setMethod("binance"); }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  method === "binance" ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Coins size={14} />
                Binance Pay
              </button>
              <button
                onClick={() => { setMethod("crypto"); }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  method === "crypto" ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <QrCode size={14} />
                Crypto Transfer
              </button>
            </div>

            {/* Form Fields */}
            <AnimatePresence mode="wait">
              {method === "razorpay" && (
                <motion.div
                  key="razorpay"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-zinc-900 to-black border border-blue-500/20 relative overflow-hidden">
                    <div className="absolute right-4 top-4 text-xs font-black italic tracking-widest text-blue-400/30 uppercase">Razorpay Secure</div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-xs font-semibold text-zinc-300">UPI / Netbanking / Cards Checkout</span>
                      </div>
                      
                      <div className="bg-black/30 rounded-xl p-4 border border-white/5 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Exchange Rate</span>
                          <span className="font-bold text-white">1 USD = 100.00 INR</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">USD Amount</span>
                          <span className="font-bold text-white">${activeAmount.toFixed(2)} USD</span>
                        </div>
                        <div className="border-t border-white/5 my-2 pt-2 flex justify-between items-center text-sm font-bold">
                          <span className="text-blue-400">Total in INR</span>
                          <span className="text-white font-extrabold">₹{(activeAmount * 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} INR</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                        By clicking "Complete Top Up", a secure Razorpay checkout modal will be initiated. You can pay using your local currency (INR) through UPI, Netbanking, or standard Cards. Credits will be added to your balance immediately after verification.
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {method === "binance" && (
                <motion.div
                  key="binance"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/30 via-zinc-900 to-black border border-amber-500/20 relative overflow-hidden">
                    <div className="absolute right-4 top-4 text-xs font-black italic tracking-widest text-amber-400/30 uppercase">Binance Pay Secure</div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-xs font-semibold text-zinc-300">C2C Pay to Binance UID</span>
                      </div>
                      
                      <div className="bg-black/30 rounded-xl p-4 border border-white/5 space-y-3">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">USD Cost</span>
                          <span className="font-bold text-white">${activeAmount.toFixed(2)} USD</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Currency</span>
                          <span className="font-bold text-amber-400">USDT (1:1 with USD)</span>
                        </div>
                        <div className="border-t border-white/5 my-2 pt-2 flex justify-between items-center text-sm font-bold">
                          <span className="text-amber-400">Total USDT</span>
                          <span className="text-white font-extrabold">{activeAmount.toFixed(2)} USDT</span>
                        </div>
                      </div>

                      <div className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                        By clicking "Complete Top Up", we will generate a unique payment tracking record with a micro-offset to automatically verify your payment on the Binance Open Platform.
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {method === "crypto" && (
                <motion.div
                  key="crypto"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-950/20 via-zinc-900 to-black border border-teal-500/20 relative overflow-hidden">
                    <div className="absolute right-4 top-4 text-xs font-black italic tracking-widest text-teal-400/30 uppercase">Direct Send</div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                        <span className="text-xs font-semibold text-zinc-300">Select Network Address</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        {(["trc20", "erc20", "bep20"] as const).map((net) => (
                          <button
                            key={net}
                            type="button"
                            onClick={() => setCryptoNetwork(net)}
                            className={`py-3 px-2 rounded-xl text-center border font-bold text-xs uppercase transition-all cursor-pointer ${
                              cryptoNetwork === net
                                ? "border-teal-500 bg-teal-500/10 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                                : "border-white/5 bg-white/[0.02] text-muted-foreground hover:border-white/20 hover:text-foreground"
                            }`}
                          >
                            {net === "bep20" ? "BSC/BEP20" : net}
                          </button>
                        ))}
                      </div>

                      <div className="text-[10px] text-zinc-400 leading-relaxed font-semibold italic text-center p-2 border border-teal-500/10 rounded-xl bg-teal-500/[0.02]">
                        ⚠️ Ensure your wallet matches the selected blockchain network to avoid payment loss.
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Total display & submit button */}
            <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Checkout Total</div>
                  <div className="text-2xl font-black text-white">${activeAmount.toFixed(2)}</div>
                </div>
                <div className="border-l border-white/10 pl-6">
                  <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Credits Received</div>
                  <div className="text-2xl font-black text-primary">{activeCredits} Credits</div>
                </div>
              </div>

              <Btn
                disabled={isProcessing || activeAmount <= 0}
                onClick={handleCheckout}
                className="w-full sm:w-auto px-10 py-5 justify-center cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    {method === "crypto" 
                      ? "Pay with Crypto Transfer" 
                      : method === "binance"
                      ? "Pay with Binance Pay"
                      : "Complete Top Up"
                    }
                    <ArrowRight size={14} className="ml-1" />
                  </>
                )}
              </Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
