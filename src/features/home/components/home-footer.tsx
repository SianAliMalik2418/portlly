import { footerLinks } from "../lib/games"
import { BrandLink } from "./brand-link"

export const HomeFooter = () => (
  <footer className="border-t border-border py-10 pb-[60px]">
    <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-4 px-[18px]">
      <BrandLink />
      <div className="flex gap-[18px] font-mono text-xs">
        {footerLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="text-muted-foreground transition-colors duration-200 hover:text-primary"
          >
            {link.label}
          </a>
        ))}
      </div>
      <span className="font-mono text-[11px] text-muted-foreground">
        © 2026 portlly · made for fun
      </span>
    </div>
  </footer>
)
