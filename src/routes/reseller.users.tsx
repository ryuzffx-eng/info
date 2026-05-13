import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Badge } from "@/components/admin/ui";

export const Route = createFileRoute("/reseller/users")({ component: ResellerUsers });

const customers = Array.from({ length: 8 }, (_, i) => ({
  name: ["alex_k","mira.s","diego.r","yuki_t","sam.p","nina_o","leo_m","kai.j"][i],
  app: ["Phantom Loader","Eclipse Suite","Spectral Spoofer"][i%3],
  expires: ["Mar 2026","Apr 2026","Jun 2026","Lifetime"][i%4],
}));

function ResellerUsers() {
  return (
    <div>
      <PageHeader title="Customers" subtitle="Users you've issued licenses to." />
      <Card>
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border/60"><th className="py-3 pr-4">Customer</th><th className="px-4">App</th><th className="px-4">Expires</th></tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.name} className="border-b border-border/40 hover:bg-card/40">
                  <td className="py-3 pr-4"><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-primary-foreground">{c.name[0].toUpperCase()}</div><span className="font-medium">{c.name}</span></div></td>
                  <td className="px-4">{c.app}</td>
                  <td className="px-4"><Badge>{c.expires}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
