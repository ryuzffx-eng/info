import { cn } from "@/lib/utils";
import logoPng from "@/assets/logo.png";

type CrystalLogoProps = {
  size?: number;
  className?: string;
  glow?: boolean;
};

export function CrystalLogo({ size = 48, className, glow = true }: CrystalLogoProps) {
  const w = size;
  const h = size;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: w, height: h }}>
      {glow && (
        <div
          className="absolute inset-0 scale-125 rounded-full opacity-60 blur-2xl animate-pulse"
          style={{ background: "radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)" }}
        />
      )}
      <img
        src={logoPng}
        alt="Emerite Logo"
        className="relative z-10 object-contain w-full h-full"
      />
    </div>
  );
}
