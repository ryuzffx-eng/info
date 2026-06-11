/** Frosted glass mesh overlay — soft luminous grid, no flat black */
export function GlassMesh() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {/* Frost wash */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 40%, rgba(255,255,255,0.02) 100%)",
        }}
      />
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />
      {/* Soft edge bloom — theme tinted, not black vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 90% 70% at 50% 40%, transparent 30%, color-mix(in srgb, var(--bg-deep) 55%, transparent) 100%)`,
        }}
      />
    </div>
  );
}
