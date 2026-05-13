import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Badge } from "@/components/admin/ui";

export const Route = createFileRoute("/reseller/logs")({ component: ResellerLogs });

const logs = Array.from({ length: 12 }, (_, i) => ({
  date: `May ${9 - Math.floor(i/2)}, 2026`,
  action: ["Generated key", "Top-up credits", "Sold license", "Refund issued"][i%4],
  app: ["Phantom Loader","Eclipse Suite","Spectral Spoofer"][i%3],
  amount: [10, 25, -5, 50][i%4],
}));

function ResellerLogs() {
  return (
    <div>
      <PageHeader title="Purchase Logs" subtitle="Credit transactions and key history." />
      <Card>
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border/60"><th className="py-3 pr-4">Date</th><th className="px-4">Action</th><th className="px-4">App</th><th className="px-4 text-right">Credits</th></tr>
            </thead>
            <tbody>
              {logs.map((l, i) => (
                <tr key={i} className="border-b border-border/40 hover:bg-card/40">
                  <td className="py-3 pr-4 text-muted-foreground">{l.date}</td>
                  <td className="px-4"><Badge tone={l.amount < 0 ? "danger" : "primary"}>{l.action}</Badge></td>
                  <td className="px-4">{l.app}</td>
                  <td className={`px-4 text-right font-mono ${l.amount < 0 ? "text-destructive" : "text-primary"}`}>{l.amount > 0 ? "+" : ""}{l.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
