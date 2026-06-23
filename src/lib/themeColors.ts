/** Read live theme colors from CSS variables (works after ThemeProvider applies them). */
export function readThemeColors() {
  if (typeof document === "undefined") {
    return { primary: "#BFDBFE", accent: "#FFFFFF", neon: "#E0EFFF" };
  }
  const s = getComputedStyle(document.documentElement);
  return {
    primary: s.getPropertyValue("--primary").trim() || "#BFDBFE",
    accent: s.getPropertyValue("--accent").trim() || "#FFFFFF",
    neon: s.getPropertyValue("--neon").trim() || "#E0EFFF",
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

  /* iOS-style deep neutral backdrop — glass reads best on soft slate */
  root.style.setProperty("--bg-deep", `color-mix(in srgb, ${p} 5%, #0a0d14)`);
  root.style.setProperty("--bg-base", `color-mix(in srgb, ${p} 5%, #0e121c)`);
  root.style.setProperty("--background", `color-mix(in srgb, ${p} 4%, #11151f)`);
  root.style.setProperty(
    "--bg-mesh",
    `radial-gradient(ellipse 110% 80% at 50% -10%, color-mix(in srgb, ${p} 12%, transparent), transparent 60%),
     radial-gradient(ellipse 70% 60% at 85% 10%, color-mix(in srgb, ${a} 9%, transparent), transparent 55%),
     radial-gradient(ellipse 60% 50% at 10% 100%, color-mix(in srgb, ${p} 7%, transparent), transparent 55%),
     linear-gradient(165deg, #12161f 0%, #0d1019 55%, #0a0c12 100%)`,
  );

  /* Glow tokens kept faint so glass stays clean, not neon-soaked */
  root.style.setProperty("--primary-glow", `color-mix(in srgb, ${p} 18%, transparent)`);
  root.style.setProperty("--accent-glow", `color-mix(in srgb, ${n} 12%, transparent)`);
  root.style.setProperty("--gradient-brand", `linear-gradient(135deg, ${p}, ${a}, ${n})`);
  root.style.setProperty(
    "--gradient-hero",
    `radial-gradient(ellipse 75% 50% at 50% 0%, color-mix(in srgb, ${p} 14%, transparent), transparent 70%)`,
  );

  /* Clean depth shadows — soft theme rim on cards, no halo bloom */
  root.style.setProperty(
    "--shadow-neon",
    `0 10px 36px -8px color-mix(in srgb, ${p} 30%, transparent)`,
  );
  root.style.setProperty(
    "--shadow-glow",
    `0 14px 44px -12px color-mix(in srgb, ${p} 32%, rgba(8, 14, 26, 0.5))`,
  );
  root.style.setProperty(
    "--shadow-card",
    `0 10px 34px rgba(8, 14, 26, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
  );
  root.style.setProperty(
    "--shadow-glass",
    `0 8px 30px rgba(8, 14, 26, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
  );
  root.style.setProperty("--chart-1", p);
  root.style.setProperty("--chart-2", a);
}
