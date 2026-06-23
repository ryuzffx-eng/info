import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Btn, Badge } from "@/components/admin/ui";
import { Wallet, CreditCard, Gift, Loader2, Sparkles, Check, ArrowRight, QrCode } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const Route = createFileRoute("/reseller/topup")({ component: ResellerTopup });

const PRESET_AMOUNTS = [10, 25, 50, 100, 250];

function ResellerTopup() {
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [method, setMethod] = useState<"card" | "crypto" | "coupon">("card");
  const [couponCode, setCouponCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Card form states
  const [cardNumber, setCardNumber] = useState("4111 2222 3333 4444");
  const [cardExpiry, setCardExpiry] = useState("12/29");
  const [cardCvv, setCardCvv] = useState("123");
  const [cardName, setCardName] = useState("Reseller Account");

  // Crypto coin selection
  const [cryptoCoin, setCryptoCoin] = useState<"BTC" | "LTC" | "USDT">("LTC");

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
    if (profile?.username) {
      setCardName(profile.username);
    }
  }, [profile]);

  const topupMutation = useMutation({
    mutationFn: (data: { amount: number; payment_method: string; coupon_code?: string }) => api.reseller.topup(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["reseller-profile"] });
      toast.success(res.msg || "Top up successful!");
      setCouponCode("");
      setIsProcessing(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to process top up");
      setIsProcessing(false);
    }
  });

  const handleCheckout = () => {
    const finalAmount = customAmount ? parseFloat(customAmount) : amount;
    if (isNaN(finalAmount) || finalAmount <= 0) {
      toast.error("Please enter a valid positive amount");
      return;
    }

    setIsProcessing(true);

    if (method === "coupon") {
      if (!couponCode.trim()) {
        toast.error("Please enter a coupon code");
        setIsProcessing(false);
        return;
      }
      topupMutation.mutate({
        amount: finalAmount,
        payment_method: "coupon",
        coupon_code: couponCode
      });
      return;
    }

    // Simulate verification delay for premium look
    setTimeout(() => {
      topupMutation.mutate({
        amount: finalAmount,
        payment_method: method
      });
    }, 2000);
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
                onClick={() => setMethod("card")}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  method === "card" ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <CreditCard size={14} />
                Credit Card
              </button>
              <button
                onClick={() => setMethod("crypto")}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  method === "crypto" ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <QrCode size={14} />
                Crypto
              </button>
              <button
                onClick={() => setMethod("coupon")}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  method === "coupon" ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Gift size={14} />
                Coupon
              </button>
            </div>

            {/* Form Fields */}
            <AnimatePresence mode="wait">
              {method === "card" && (
                <motion.div
                  key="card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-zinc-900 to-black border border-white/10 relative overflow-hidden">
                    <div className="absolute right-4 top-4 text-xs font-black italic tracking-widest text-primary/30 uppercase">Visa Platinum</div>
                    <div className="space-y-6">
                      <div className="text-xs font-mono font-bold tracking-widest text-white/50">{cardNumber}</div>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-[8px] uppercase tracking-wider text-muted-foreground/60">Card Holder</div>
                          <div className="text-xs font-bold text-white uppercase">{cardName || "Your Name"}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[8px] uppercase tracking-wider text-muted-foreground/60">Expires</div>
                          <div className="text-xs font-bold text-white">{cardExpiry}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase">Cardholder Name</label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs outline-none focus:border-primary/50 text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs outline-none focus:border-primary/50 text-white font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs outline-none focus:border-primary/50 text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase">CVV</label>
                      <input
                        type="text"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        maxLength={3}
                        className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs outline-none focus:border-primary/50 text-white font-bold"
                      />
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
                  <div className="flex gap-2">
                    {["LTC", "BTC", "USDT"].map((coin) => (
                      <button
                        key={coin}
                        onClick={() => setCryptoCoin(coin as any)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                          cryptoCoin === coin
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-white/5 bg-white/[0.02] text-muted-foreground hover:text-white"
                        }`}
                      >
                        {coin}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                    <div className="h-20 w-20 shrink-0 bg-white rounded-lg flex items-center justify-center p-1">
                      <QrCode className="text-black h-full w-full" />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Deposit Address</div>
                      <code className="block text-xs font-mono font-bold text-white bg-black/40 p-2 rounded border border-white/5 overflow-x-auto select-all">
                        {cryptoCoin === "LTC" ? "LhcYcMv6bU2c943LmWx9VnQ..." : cryptoCoin === "BTC" ? "bc1qxy2kg3ut5xg7z3j23..." : "0x71C5681E616B78d910..."}
                      </code>
                      <div className="text-[10px] text-zinc-500 font-bold italic">Credits will be added automatically upon payment detection.</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {method === "coupon" && (
                <motion.div
                  key="coupon"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Redeem Code</label>
                    <input
                      type="text"
                      placeholder="CANNIBAL-XXXXXX"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm outline-none focus:border-primary/50 text-white font-mono uppercase tracking-wider"
                    />
                    <div className="text-[10px] text-muted-foreground/60 mt-1.5 font-bold italic">
                      Coupon codes give immediate credit. Tip: Use <code className="text-primary select-all">CANNIBAL-{activeAmount || 50}</code> as a topup coupon to credit ${activeAmount || 50.00}.
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
                className="w-full sm:w-auto px-10 py-5 justify-center"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-2" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    Complete Top Up
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
