import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"
import { BrandLink } from "./brand-link"

type HomeNavProps = {
  scrolled: boolean
}

export const HomeNav = ({ scrolled }: HomeNavProps) => (
  <nav
    className={cn(
      "sticky top-0 z-50 border-b transition-[border-color] duration-200",
      scrolled ? "border-border" : "border-transparent"
    )}
    style={{
      background: "color-mix(in srgb, var(--background) 84%, transparent)",
      backdropFilter: "blur(0.875rem)",
      WebkitBackdropFilter: "blur(0.875rem)",
    }}
  >
    <div className="mx-auto flex h-[3.625rem] max-w-[70rem] items-center gap-2.5 px-4.5">
      <BrandLink animated />
      <div className="flex-1" />
      <ModeToggle />
      <Button
        asChild
        size="sm"
        className="ml-1 rounded-full shadow-[0_0.1875rem_0_oklch(0.46_0.12_155)]"
      >
        <a href="/games/semantic-guess">Play today →</a>
      </Button>
    </div>
  </nav>
)
