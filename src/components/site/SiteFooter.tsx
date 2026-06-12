import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Twitter, Github, MessageCircle, Send } from "lucide-react";

const socialLinks = [
  { Icon: Twitter, href: "#", label: "Twitter" },
  { Icon: Github, href: "#", label: "GitHub" },
  { Icon: MessageCircle, href: "https://discord.gg/mVvwkpAvy7", label: "Discord" },
  { Icon: Send, href: "https://t.me/EmeriteStore", label: "Telegram" },
];

const footerCols = [
  {
    title: "Product",
    links: [
      ["Marketplace", "/marketplace"],
      ["Status", "/status"],
      ["Reviews", "/reviews"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About", "#"],
      ["Blog", "#"],
      ["Careers", "#"],
    ],
  },
  {
    title: "Legal",
    links: [
      ["Terms", "#"],
      ["Privacy", "#"],
      ["Refunds", "#"],
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="glass-panel border-t border-white/[0.055]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        {/* Brand block */}
        <div>
          <Logo />
          <p className="mt-4 max-w-[240px] text-[13px] leading-relaxed text-muted-foreground">
            The premium marketplace for secure software, licenses, and digital tools.
          </p>
          <div className="mt-5 flex gap-1.5">
            {socialLinks.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target={href !== "#" ? "_blank" : undefined}
                rel="noreferrer"
                aria-label={label}
                className="glass rounded-xl p-2.5 text-muted-foreground transition-all hover:border-primary/25 hover:text-primary hover:bg-primary/[0.07]"
              >
                <Icon size={15} />
              </a>
            ))}
          </div>
        </div>

        {/* Nav columns */}
        {footerCols.map((col) => (
          <div key={col.title}>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary/75">
              {col.title}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {col.links.map(([label, to]) => (
                <li key={label}>
                  {to.startsWith("/") && !to.includes("#") ? (
                    <Link
                      to={to as "/marketplace" | "/status" | "/reviews"}
                      className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {label}
                    </Link>
                  ) : (
                    <a
                      href={to}
                      className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="glass-divider mx-4 sm:mx-6" />
      <div className="px-4 py-4 text-center text-[11px] text-muted-foreground/60 sm:px-6">
        © {new Date().getFullYear()} Emerite Store. Crafted for builders.
      </div>
    </footer>
  );
}
