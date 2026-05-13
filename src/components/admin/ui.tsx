import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, delta, icon: Icon, accent = "primary" }: { label: string; value: string; delta?: string; icon: any; accent?: "primary" | "accent" | "warning" }) {
  const colorMap = { primary: "text-primary bg-primary/10 ring-primary/20", accent: "text-accent bg-accent/10 ring-accent/20", warning: "text-yellow-400 bg-yellow-500/10 ring-yellow-500/20" };
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl transition-all hover:border-primary/40 hover:shadow-[var(--shadow-glow)]">
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/10 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-2 font-display text-3xl font-bold">{value}</div>
          {delta && <div className="mt-1 text-xs text-primary">{delta}</div>}
        </div>
        <div className={`rounded-xl p-2.5 ring-1 ${colorMap[accent]}`}><Icon size={18} /></div>
      </div>
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-xl ${className}`}>{children}</div>;
}

export function Badge({ children, tone = "primary" }: { children: ReactNode; tone?: "primary" | "warning" | "danger" | "muted" }) {
  const tones = {
    primary: "bg-primary/10 text-primary ring-primary/20",
    warning: "bg-yellow-500/10 text-yellow-400 ring-yellow-500/20",
    danger: "bg-destructive/10 text-destructive ring-destructive/20",
    muted: "bg-secondary text-muted-foreground ring-border",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold ring-1 ${tones[tone]}`}>{children}</span>;
}

export function Btn({ children, variant = "primary", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "outline" }) {
  const v = {
    primary: "bg-primary text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-[1.03]",
    ghost: "text-muted-foreground hover:text-foreground hover:bg-card/60",
    outline: "border border-border/60 hover:border-primary/40 hover:text-primary",
  }[variant];
  return <button {...props} className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all ${v} ${props.className ?? ""}`}>{children}</button>;
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, loading }: { isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; loading?: boolean }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 p-4 backdrop-blur-md">
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
            className="glass-strong w-full max-w-sm rounded-2xl p-7 shadow-2xl bg-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                <AlertTriangle size={20} />
              </div>
              <button onClick={onClose} className="rounded-lg p-2 hover:bg-card"><X size={16} /></button>
            </div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{message}</p>
            <div className="mt-8 flex gap-3">
              <Btn variant="outline" className="flex-1 justify-center" onClick={onClose}>Cancel</Btn>
              <Btn className="flex-1 justify-center bg-red-500 hover:bg-red-600 text-white shadow-none" onClick={onConfirm} disabled={loading}>
                {loading ? "Processing..." : "Confirm"}
              </Btn>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
