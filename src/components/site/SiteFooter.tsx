import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Github, Twitter, MessageCircle, Send } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/40 bg-card/30 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            The premium marketplace for secure software, licenses, and digital tools.
          </p>
          <div className="mt-5 flex gap-2">
            {[Twitter, Github, MessageCircle, Send].map((Icon, i) => (
              <a key={i} href="#" className="rounded-lg border border-border/60 p-2 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
        {[
          { title: "Product", links: [["Marketplace", "/marketplace"], ["Status", "/status"], ["Reviews", "/reviews"]] },
          { title: "Company", links: [["About", "#"], ["Blog", "#"], ["Careers", "#"]] },
          { title: "Legal", links: [["Terms", "#"], ["Privacy", "#"], ["Refunds", "#"]] },
        ].map((c) => (
          <div key={c.title}>
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">{c.title}</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {c.links.map(([label, to]) => (
                <li key={label}><Link to={to as string} className="text-muted-foreground transition-colors hover:text-foreground">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/40 px-4 py-5 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} Emerite Store. Crafted for builders.
      </div>
    </footer>
  );
}
