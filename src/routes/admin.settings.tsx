import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Card, Btn } from "@/components/admin/ui";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export const Route = createFileRoute("/admin/settings")({ component: Settings });

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
            onClick={async () => {
              try {
                setTheme(id);
                await api.theme.updateGlobal(id);
                toast.success(`Theme changed globally to ${t.name}`);
              } catch (err) {
                toast.error("Failed to update theme globally");
                console.error(err);
              }
            }}
            className={`group relative h-9 w-full overflow-hidden rounded-lg border-2 transition-all hover:scale-105 active:scale-95 ${
              theme === id ? "border-white" : "border-transparent hover:border-white/20"
            }`}
            title={t.name}
          >
            <div className="absolute inset-0 transition-transform group-hover:scale-110" style={{ background: t.primary }} />
            {theme === id && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/[0.04]">
                <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_white]" />
              </div>
            )}
          </button>
        ))}
      </div>
      
      <div className="mt-4 p-3 rounded-lg bg-white/[0.03] border border-white/[0.05]">
        <p className="text-[10px] text-zinc-400 font-medium leading-relaxed">
          Selecting a palette updates ribbons, glow, buttons, cards, and accents across the entire site in real time.
        </p>
      </div>
    </Card>
  );
}

function Settings() {
  const queryClient = useQueryClient();
  const [formState, setFormState] = useState<Record<string, string>>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: api.admin.getSettings,
  });

  useEffect(() => {
    if (settings) {
      setFormState(settings);
    }
  }, [settings]);

  const mutation = useMutation({
    mutationFn: (data: Record<string, string>) => api.admin.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings saved successfully!");
    },
    onError: (err: any) => {
      toast.error(`Failed to save settings: ${err.message}`);
    }
  });

  const updateKey = (key: string, value: string) => {
    setFormState(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    mutation.mutate(formState);
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Configure your store, theme, and API." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="font-semibold text-white">Website Configuration</h3>
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Display & branding</p>
          <div className="mt-5 space-y-4">
            <Field 
              label="Store name" 
              value={formState.store_name ?? ""} 
              onChangeText={(val) => updateKey("store_name", val)} 
            />
            <Field 
              label="Support email" 
              value={formState.support_email ?? ""} 
              onChangeText={(val) => updateKey("support_email", val)} 
            />

          </div>
        </Card>

        <ThemePicker />

        <Card>
          <h3 className="font-semibold text-white">Top-up Bonus Configuration</h3>
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Manage bonus rules for reseller deposits</p>
          <div className="mt-5 space-y-4">
            <Toggle 
              label="Enable Top-up Bonus" 
              checked={formState.topup_bonus_enabled === "true"} 
              onChange={(val) => updateKey("topup_bonus_enabled", val ? "true" : "false")} 
            />
            <Field 
              label="Bonus Threshold Limit ($)" 
              value={formState.topup_bonus_threshold ?? "10.00"} 
              onChangeText={(val) => updateKey("topup_bonus_threshold", val)} 
            />
            <Field 
              label="Bonus Percent (%)" 
              value={formState.topup_bonus_percent ?? "10"} 
              onChangeText={(val) => updateKey("topup_bonus_percent", val)} 
            />
          </div>
        </Card>
        <Card>
          <h3 className="font-semibold text-white">API Infrastructure</h3>
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Webhooks & rate limits</p>
          <div className="mt-5 space-y-4">
            <Field 
              label="API base URL" 
              value={formState.api_base_url ?? ""} 
              onChangeText={(val) => updateKey("api_base_url", val)} 
            />

            <Field 
              label="Rate limit (req/min)" 
              value={formState.rate_limit ?? ""} 
              onChangeText={(val) => updateKey("rate_limit", val)} 
            />
          </div>
        </Card>
      </div>
      <div className="mt-6 flex justify-end">
        <Btn disabled={mutation.isPending} onClick={handleSave}>
          {mutation.isPending ? "Saving..." : "Save changes"}
        </Btn>
      </div>
    </div>
  );
}

function Field({ label, value, onChangeText, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; value: string; onChangeText: (val: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <input 
        {...props} 
        value={value}
        onChange={(e) => onChangeText(e.target.value)}
        className="mt-1.5 w-full rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm outline-none focus:border-primary/50" 
      />
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border/40 bg-background/30 px-3 py-2.5">
      <span className="text-sm">{label}</span>
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)} 
        className="peer sr-only" 
      />
      <span className="relative h-5 w-9 rounded-full bg-secondary transition-colors peer-checked:bg-primary">
        <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-foreground transition-transform peer-checked:translate-x-4" />
      </span>
    </label>
  );
}
