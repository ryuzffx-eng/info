/** Read live theme colors from CSS variables (works after ThemeProvider applies them). */
export function readThemeColors() {
  if (typeof document === "undefined") {
    return { primary: "#00C878", accent: "#00E08A", neon: "#38F5B7" };
  }
  const s = getComputedStyle(document.documentElement);
  return {
    primary: s.getPropertyValue("--primary").trim() || "#00C878",
    accent: s.getPropertyValue("--accent").trim() || "#00E08A",
    neon: s.getPropertyValue("--neon").trim() || "#38F5B7",
  };
}

export function applyThemeVariables(
  root: HTMLElement,
  colors: { primary: string; accent: string; neon: string },
) {
  const { primary: p, accent: a, neon: n } = colors;

  root.style.setProperty("--primary", p);
  root.style.setProperty("--accent", a);
  root.style.setProperty("--neon", n);
  root.style.setProperty("--ring", p);
  root.style.setProperty("--success", p);

  /* Luminous glass base — tinted by theme, never flat black */
  root.style.setProperty("--bg-deep", `color-mix(in srgb, ${p} 10%, #121e32)`);
  root.style.setProperty("--bg-base", `color-mix(in srgb, ${p} 8%, #162038)`);
  root.style.setProperty("--background", `color-mix(in srgb, ${p} 6%, #18243c)`);
  root.style.setProperty(
    "--bg-mesh",
    `radial-gradient(ellipse 120% 80% at 50% -30%, color-mix(in srgb, ${p} 22%, transparent), transparent 55%),
     radial-gradient(ellipse 70% 50% at 100% 50%, color-mix(in srgb, ${n} 14%, transparent), transparent 50%),
     radial-gradient(ellipse 60% 45% at 0% 80%, color-mix(in srgb, ${a} 12%, transparent), transparent 45%),
     linear-gradient(160deg, color-mix(in srgb, ${p} 8%, #141e34) 0%, #121a2e 45%, color-mix(in srgb, ${a} 6%, #101828) 100%)`,
  );

  root.style.setProperty("--primary-glow", `color-mix(in srgb, ${p} 28%, transparent)`);
  root.style.setProperty("--accent-glow", `color-mix(in srgb, ${n} 18%, transparent)`);
  root.style.setProperty("--gradient-brand", `linear-gradient(135deg, ${p}, ${a}, ${n})`);
  root.style.setProperty(
    "--gradient-hero",
    `radial-gradient(ellipse 80% 55% at 50% 0%, color-mix(in srgb, ${p} 24%, transparent), transparent 72%)`,
  );
  root.style.setProperty(
    "--shadow-neon",
    `0 0 32px color-mix(in srgb, ${p} 30%, transparent), 0 0 64px color-mix(in srgb, ${p} 12%, transparent)`,
  );
  root.style.setProperty(
    "--shadow-glow",
    `0 8px 40px -8px color-mix(in srgb, ${p} 35%, transparent)`,
  );
  root.style.setProperty(
    "--shadow-card",
    `0 8px 32px color-mix(in srgb, ${p} 8%, rgba(15, 25, 45, 0.35)), 0 0 24px color-mix(in srgb, ${p} 12%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
  );
  root.style.setProperty("--chart-1", p);
  root.style.setProperty("--chart-2", a);
}
