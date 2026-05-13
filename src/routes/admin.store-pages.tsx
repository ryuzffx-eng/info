import { createFileRoute } from "@tanstack/react-router";
import { Plus, Edit, Loader2 } from "lucide-react";
import { PageHeader, Card, Badge, Btn } from "@/components/admin/ui";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export const Route = createFileRoute("/admin/store-pages")({ component: StorePages });

function StorePages() {
  const { data: pages, isLoading, error } = useQuery({
    queryKey: ["admin-store-pages"],
    queryFn: api.admin.getStorePages,
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
      <PageHeader title="Store Pages" subtitle="Manage public-facing pages and content."
        action={<Btn><Plus size={14} /> New page</Btn>} />
      <Card>
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="py-3 pr-4">Title</th>
                <th className="px-4">Slug</th>
                <th className="px-4">Views</th>
                <th className="px-4">Status</th>
                <th className="pl-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages?.map((p: any) => (
                <tr key={p.slug} className="border-b border-border/40 hover:bg-card/40">
                  <td className="py-3 pr-4 font-medium">{p.title}</td>
                  <td className="px-4 font-mono text-xs text-muted-foreground">{p.slug}</td>
                  <td className="px-4">{p.views.toLocaleString()}</td>
                  <td className="px-4">
                    <Badge tone={p.is_published ? "primary" : "muted"}>
                      {p.is_published ? "Published" : "Draft"}
                    </Badge>
                  </td>
                  <td className="pl-4">
                    <div className="flex justify-end">
                      <Btn variant="ghost"><Edit size={12} /> Edit</Btn>
                    </div>
                  </td>
                </tr>
              ))}
              {pages?.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">No pages found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
