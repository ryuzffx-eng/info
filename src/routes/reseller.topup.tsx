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

  // Binance Order state
  const [binanceOrder, setBinanceOrder] = useState<any>(null);

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
        setBinanceOrder(orderData);
        window.open(orderData.checkout_url, "_blank");
        toast.success("Binance Pay checkout page opened. Click 'Verify Payment' below once paid.");
      } catch (err: any) {
        toast.error(err.message || "Failed to create Binance Pay order");
      } finally {
        setIsProcessing(false);
      }
      return;
    }
  };

  const handleVerifyBinance = async () => {
    if (!binanceOrder) {
      toast.error("No active Binance order to verify");
      return;
    }
    setIsProcessing(true);
    const finalAmount = customAmount ? parseFloat(customAmount) : amount;
    try {
      const verifyRes = await api.reseller.verifyBinancePayment({
        merchant_trade_no: binanceOrder.merchant_trade_no,
        amount: finalAmount
      });
      queryClient.invalidateQueries({ queryKey: ["reseller-profile"] });
      toast.success(verifyRes.msg || "Top up successful!");
      setBinanceOrder(null);
    } catch (err: any) {
      toast.error(err.message || "Payment not verified yet. Make sure payment was processed on Binance Pay.");
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

  // Find credits matching active preset plan, or default to 1:1 for custom
  const selectedPlan = plans?.find(p => p.amount === activeAmount);
  const activeCredits = selectedPlan ? selectedPlan.credits : activeAmount;

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
                    className={`py-3 px-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center ${
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
                    className={`py-3 px-2 rounded-xl text-center border font-bold text-sm transition-all ${
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
                onClick={() => { setMethod("razorpay"); setBinanceOrder(null); }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  method === "razorpay" ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CreditCard size={14} />
                Razorpay
              </button>
              <button
                onClick={() => { setMethod("binance"); setBinanceOrder(null); }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  method === "binance" ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Coins size={14} />
                Binance Pay
              </button>
              <button
                onClick={() => { setMethod("crypto"); setBinanceOrder(null); }}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
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
                        <span className="text-xs font-semibold text-zinc-300">Fast USDT Gate Checkout</span>
                      </div>
                      
                      {!binanceOrder ? (
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
                      ) : (
                        <div className="bg-black/30 rounded-xl p-4 border border-white/5 space-y-4">
                          <div className="text-xs text-zinc-300 font-bold">Order created! Click the button below to pay, then verify:</div>
                          
                          <div className="flex flex-col sm:flex-row gap-2">
                            <a
                              href={binanceOrder.checkout_url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 py-3 px-4 rounded-xl text-center text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-all flex items-center justify-center gap-2"
                            >
                              <ExternalLink size={14} />
                              Open Payment Page
                            </a>
                            <button
                              onClick={handleVerifyBinance}
                              disabled={isProcessing}
                              className="flex-1 py-3 px-4 rounded-xl text-center text-xs font-bold bg-zinc-800 text-white border border-white/10 hover:bg-zinc-700 disabled:opacity-50 transition-all"
                            >
                              {isProcessing ? "Verifying..." : "Verify Payment"}
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="text-[10px] text-zinc-400 leading-relaxed font-medium">
                        {!binanceOrder 
                          ? "By clicking 'Complete Top Up', we will create a Binance Pay payment request and open the checkout page in a new window/tab."
                          : "Once you have completed the payment on the Binance page, click 'Verify Payment' to credit your reseller balance immediately."}
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
                    <div className="absolute right-4 top-4 text-xs font-black italic tracking-widest text-teal-400/30 uppercase">Manual Transfer</div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                        <span className="text-xs font-semibold text-zinc-300">USDT Wallet Addresses</span>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-black/30 rounded-xl p-3 border border-white/5 flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] font-bold text-teal-400 uppercase tracking-widest block">USDT (TRC20)</span>
                            <code className="text-xs font-mono font-bold text-white block truncate select-all">TT2fYWs2gfUbbYmzU3wdUps6ECqGPUt7zP</code>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText("TT2fYWs2gfUbbYmzU3wdUps6ECqGPUt7zP");
                              toast.success("TRC20 Address copied!");
                            }}
                            className="py-1.5 px-3 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white hover:bg-white/10 transition-all shrink-0"
                          >
                            Copy
                          </button>
                        </div>

                        <div className="bg-black/30 rounded-xl p-3 border border-white/5 flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] font-bold text-teal-400 uppercase tracking-widest block">USDT (ERC20)</span>
                            <code className="text-xs font-mono font-bold text-white block truncate select-all">0x680e71e7733a8333f1a8dca2532a4d3f87724e90</code>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText("0x680e71e7733a8333f1a8dca2532a4d3f87724e90");
                              toast.success("ERC20 Address copied!");
                            }}
                            className="py-1.5 px-3 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white hover:bg-white/10 transition-all shrink-0"
                          >
                            Copy
                          </button>
                        </div>

                        <div className="bg-black/30 rounded-xl p-3 border border-white/5 flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <span className="text-[9px] font-bold text-teal-400 uppercase tracking-widest block">USDT (BEP20)</span>
                            <code className="text-xs font-mono font-bold text-white block truncate select-all">0x680e71e7733a8333f1a8dca2532a4d3f87724e90</code>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText("0x680e71e7733a8333f1a8dca2532a4d3f87724e90");
                              toast.success("BEP20 Address copied!");
                            }}
                            className="py-1.5 px-3 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white hover:bg-white/10 transition-all shrink-0"
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      <div className="text-[10px] text-zinc-400 leading-relaxed font-semibold italic text-center p-2 border border-teal-500/10 rounded-xl bg-teal-500/[0.02]">
                        ⚠️ This is a manual transfer. After completing the payment, please contact the administrator with your transaction ID, hash, or receipt to verify and credit your reseller balance.
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

              {method !== "crypto" ? (
                <Btn
                  disabled={isProcessing || activeAmount <= 0}
                  onClick={handleCheckout}
                  className="w-full sm:w-auto px-10 py-5 justify-center"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-2" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      {method === "binance" && binanceOrder ? "Pay on Binance Page" : "Complete Top Up"}
                      <ArrowRight size={14} className="ml-1" />
                    </>
                  )}
                </Btn>
              ) : (
                <Btn
                  disabled
                  className="w-full sm:w-auto px-10 py-5 justify-center opacity-60 cursor-not-allowed bg-zinc-800 border border-white/10 text-zinc-400 hover:bg-zinc-800"
                >
                  Manual Transfer Mode
                </Btn>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
