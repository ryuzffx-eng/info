import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Btn } from "@/components/admin/ui";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({ component: Settings });

import { useTheme } from "@/components/ThemeProvider";

function ThemePicker() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">Brand Identity</h3>
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Visual customization & theme</p>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-bold text-primary uppercase">{themes[theme].name}</span>
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-7 gap-2">
        {Object.entries(themes).map(([id, t]) => (
          <button
            key={id}
            onClick={() => {
              setTheme(id);
              toast.success(`Theme changed to ${t.name}`);
            }}
            className={`group relative h-9 w-full overflow-hidden rounded-lg border-2 transition-all hover:scale-105 active:scale-95 ${
              theme === id ? "border-white" : "border-transparent hover:border-white/20"
            }`}
            title={t.name}
          >
            <div className="absolute inset-0 transition-transform group-hover:scale-110" style={{ background: t.primary }} />
            {theme === id && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_white]" />
              </div>
            )}
          </button>
        ))}
      </div>
      
      <div className="mt-4 p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
        <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
          Selecting a palette will update the primary accent colors, gradients, and shadows across the entire platform in real-time.
        </p>
      </div>
    </Card>
  );
}

function Settings() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Configure your store, theme, and API." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="font-semibold text-white">Website Configuration</h3>
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Display & branding</p>
          <div className="mt-5 space-y-4">
            <Field label="Store name" defaultValue="Emerite Store" />
            <Field label="Support email" defaultValue="support@emerite.io" />
            <Field label="Discord invite" defaultValue="https://discord.gg/emerite" />
          </div>
        </Card>

        <ThemePicker />

        <Card>
          <h3 className="font-semibold text-white">Store Controls</h3>
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Sales & checkout behavior</p>
          <div className="mt-5 space-y-4">
            <Toggle label="Enable marketplace" defaultChecked />
            <Toggle label="Allow guest checkout" />
            <Toggle label="Auto-deliver licenses" defaultChecked />
            <Toggle label="Maintenance mode" />
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-white">API Infrastructure</h3>
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Webhooks & rate limits</p>
          <div className="mt-5 space-y-4">
            <Field label="API base URL" defaultValue="https://api.emerite.io/v2" />
            <Field label="Webhook URL" placeholder="https://yourapp.com/webhook" />
            <Field label="Rate limit (req/min)" defaultValue="120" />
          </div>
        </Card>
      </div>
      <div className="mt-6 flex justify-end">
        <Btn onClick={() => toast.success("Settings saved")}>Save changes</Btn>
      </div>
    </div>
  );
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <input {...props} className="mt-1.5 w-full rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary/50" />
    </label>
  );
}

function Toggle({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border/40 bg-background/30 px-3 py-2.5">
      <span className="text-sm">{label}</span>
      <input type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="relative h-5 w-9 rounded-full bg-secondary transition-colors peer-checked:bg-primary">
        <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-foreground transition-transform peer-checked:translate-x-4" />
      </span>
    </label>
  );
}
