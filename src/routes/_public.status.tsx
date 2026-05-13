import { createFileRoute } from "@tanstack/react-router";
import { services, incidents } from "@/data/mock";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_public/status")({
  head: () => ({ meta: [{ title: "Status — Emerite Store" }, { name: "description", content: "Real-time service status and incident history." }] }),
  component: StatusPage,
});

function StatusPage() {
  const allOk = services.every(s => s.status === "operational");
  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-2xl p-8 text-center">
        <div className={`mx-auto inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium ${allOk ? "border-primary/30 bg-primary/10 text-primary" : "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"}`}>
          <span className="relative flex h-2 w-2"><span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${allOk ? "bg-primary" : "bg-yellow-400"}`} /><span className={`relative inline-flex h-2 w-2 rounded-full ${allOk ? "bg-primary" : "bg-yellow-400"}`} /></span>
          {allOk ? "All systems operational" : "Partial degradation"}
        </div>
        <h1 className="mt-5 text-4xl font-bold sm:text-5xl">System Status</h1>
        <p className="mt-2 text-muted-foreground">Live infrastructure metrics, updated every 30s.</p>
      </motion.div>

      <div className="mt-10 space-y-3">
        {services.map((s, i) => {
          const ok = s.status === "operational";
          return (
            <motion.div key={s.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${ok ? "bg-primary/10 text-primary" : "bg-yellow-500/10 text-yellow-400"}`}>
                  {ok ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                </div>
                <div>
                  <div className="font-semibold">{s.name}</div>
                  <div className={`text-xs ${ok ? "text-primary" : "text-yellow-400"}`}>{ok ? "Operational" : "Degraded performance"}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-lg font-bold">{s.uptime}%</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">90d uptime</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold">Incident History</h2>
        <div className="mt-5 space-y-3">
          {incidents.map((inc) => (
            <div key={inc.title} className="rounded-2xl border border-border/60 bg-card/40 p-5 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">{inc.date}</div>
                  <div className="mt-1 font-semibold">{inc.title}</div>
                </div>
                <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary ring-1 ring-primary/20">{inc.status}</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Duration: {inc.duration}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
