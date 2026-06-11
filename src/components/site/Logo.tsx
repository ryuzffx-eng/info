import { CrystalLogo } from "@/components/crystal/CrystalLogo";
import { cn } from "@/lib/utils";

export function Logo({
  size = 48,
  withText = true,
  stacked = false,
  hero = false,
}: {
  size?: number;
  withText?: boolean;
  stacked?: boolean;
  hero?: boolean;
}) {
  return (
    <div className={cn("flex items-center", stacked ? "flex-col gap-3 text-center" : "gap-3")}>
      <CrystalLogo size={hero ? size * 1.4 : size} glow={hero || size >= 64} />
      {withText && (
        <div className="flex flex-col leading-none justify-center">
          <span className="font-display text-xl font-bold tracking-tight sm:text-2xl">Emerite</span>
          <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.28em] text-primary">Store</span>
        </div>
      )}
    </div>
  );
}
