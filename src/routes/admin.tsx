import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardShell } from "@/components/admin/DashboardShell";

export const Route = createFileRoute("/admin")({
  component: () => <DashboardShell variant="admin"><Outlet /></DashboardShell>,
});
