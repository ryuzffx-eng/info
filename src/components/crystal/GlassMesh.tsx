/** Frosted glass mesh overlay — soft frost + fine grid, lets the animated mesh glow through */
export function GlassMesh() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {/* Frost wash */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 45%, rgba(255,255,255,0.015) 100%)",
        }}
      />
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      />
      {/* Gentle edge darkening — keeps content readable without killing the glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 95% 80% at 50% 45%, transparent 45%, color-mix(in srgb, var(--bg-deep) 45%, transparent) 100%)`,
        }}
      />
    </div>
  );
}
