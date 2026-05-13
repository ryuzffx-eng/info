import logo from "@/assets/logo.png";

export function Logo({ size = 32, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative">
        <img src={logo} alt="Emerite Store" width={size} height={size} className="relative z-10 drop-shadow-[0_0_12px_var(--primary)]" />
      </div>
      {withText && (
        <div className="flex flex-col leading-none">
          <span className="font-display text-lg font-semibold tracking-tight">Emerite</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary/80">Store</span>
        </div>
      )}
    </div>
  );
}
