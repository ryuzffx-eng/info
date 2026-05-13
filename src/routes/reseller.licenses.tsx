import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Badge, Btn } from "@/components/admin/ui";
import { Plus, Copy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reseller/licenses")({ component: ResellerLicenses });

const keys = Array.from({ length: 8 }, (_, i) => ({
  key: `EMRT-${(Math.random()*1e16).toString(36).slice(0,4).toUpperCase()}-${(Math.random()*1e16).toString(36).slice(0,4).toUpperCase()}-${(Math.random()*1e16).toString(36).slice(0,4).toUpperCase()}`,
  app: ["Phantom Loader", "Eclipse Suite", "Spectral Spoofer"][i % 3],
  duration: ["7 days", "30 days", "Lifetime"][i % 3],
  used: i % 2 === 0,
}));

function ResellerLicenses() {
  return (
    <div>
      <PageHeader title="Licenses" subtitle="Generate and track your sold keys."
        action={<Btn><Plus size={14} /> New key</Btn>} />
      <Card>
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border/60"><th className="py-3 pr-4">Key</th><th className="px-4">App</th><th className="px-4">Duration</th><th className="px-4">Status</th></tr>
            </thead>
            <tbody>
              {keys.map(k => (
                <tr key={k.key} className="border-b border-border/40 hover:bg-card/40">
                  <td className="py-3 pr-4"><div className="flex items-center gap-2"><code className="font-mono text-xs">{k.key}</code><button onClick={() => { navigator.clipboard.writeText(k.key); toast.success("Copied"); }}><Copy size={11} className="text-primary" /></button></div></td>
                  <td className="px-4">{k.app}</td><td className="px-4">{k.duration}</td>
                  <td className="px-4"><Badge tone={k.used ? "primary" : "muted"}>{k.used ? "Sold" : "Available"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
