import { createFileRoute, Outlet } from "@tanstack/react-router";
import { DashboardShell } from "@/components/admin/DashboardShell";

export const Route = createFileRoute("/reseller")({
  component: () => <DashboardShell variant="reseller"><Outlet /></DashboardShell>,
});
