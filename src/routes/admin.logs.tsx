import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Badge } from "@/components/admin/ui";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/logs")({ component: Logs });

function Logs() {
  const { data: logs, isLoading, error } = useQuery({
    queryKey: ["admin-logs"],
    queryFn: api.admin.getLogs,
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Logs" subtitle="System events and audit trail." />
      <Card className="overflow-hidden !p-0">
        <div className="scrollbar-thin max-h-[640px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card/90 text-left text-xs uppercase tracking-wider text-muted-foreground backdrop-blur">
              <tr>
                <th className="px-5 py-3">Time</th>
                <th className="px-3">Level</th>
                <th className="px-3">Message</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs">
              {logs?.map((l: any, i: number) => (
                <tr key={i} className="border-t border-border/30 hover:bg-card/40">
                  <td className="whitespace-nowrap px-5 py-2.5 text-muted-foreground">
                    {new Date(l.created_at).toLocaleString()}
                  </td>
                  <td className="px-3">
                    <Badge tone={l.level.toLowerCase() === "error" ? "danger" : l.level.toLowerCase() === "warn" ? "warning" : "muted"}>
                      {l.level}
                    </Badge>
                  </td>
                  <td className="px-3 py-2.5">
                    {l.message}
                    {l.context && (
                      <span className="ml-2 text-[10px] text-muted-foreground opacity-70">
                        {JSON.stringify(l.context)}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {logs?.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-muted-foreground">No logs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
