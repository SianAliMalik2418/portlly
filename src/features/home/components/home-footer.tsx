import { footerLinks } from "../lib/games"
import { BrandLink } from "./brand-link"

export const HomeFooter = () => (
  <footer className="border-t border-border py-10 pb-[3.75rem]">
    <div className="mx-auto flex max-w-[70rem] flex-wrap items-center justify-between gap-4 px-4.5">
      <BrandLink />
      <div className="flex gap-4.5 font-mono text-xs">
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
      <span className="font-mono text-[0.6875rem] text-muted-foreground">
        Made with ❤️ by{" "}
        <a
          href="https://github.com/SianAliMalik2418"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline underline-offset-2 transition-colors duration-200 hover:text-primary"
        >
          Sian
        </a>
      </span>
    </div>
  </footer>
)
