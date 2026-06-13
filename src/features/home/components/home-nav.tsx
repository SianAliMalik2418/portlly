import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { PlatformHeader } from "@/components/platform-header"
import { BrandLink } from "./brand-link"

type HomeNavProps = {
  scrolled: boolean
}

export const HomeNav = ({ scrolled }: HomeNavProps) => (
  <PlatformHeader
    sticky
    scrolled={scrolled}
    leading={<BrandLink animated />}
    trailing={
      <>
        <ModeToggle />
        <Button
          asChild
          size="sm"
          className="ml-1 rounded-full shadow-[0_0.1875rem_0_oklch(0.46_0.12_155)]"
        >
          <a href="/games/semantic-guess">Play today →</a>
        </Button>
      </>
    }
  />
)
