import { Button } from "@/components/ui/button"
import { nearoConfig } from "@/games/nearo/config"
import { FloatingWordField } from "./floating-word-field"

export const HomeHero = () => (
  <header className="relative flex min-h-[32.5rem] items-center py-[2.875rem] lg:min-h-[40rem] lg:py-[4.375rem]">
    <FloatingWordField />

    <div className="relative z-[1] mx-auto flex max-w-[47.5rem] flex-col items-center px-4.5 text-center">
      <span className="inline-flex items-center gap-1.5 font-mono text-xs tracking-[0.12em] text-[oklch(0.62_0.14_150)] uppercase">
        <span className="inline-block size-2 animate-pulse rounded-full bg-[oklch(0.62_0.14_150)]" />
        new games dropping soon
      </span>

      <h1 className="mt-5 font-display text-[clamp(3rem,8vw,5.5rem)] leading-[1.02] font-bold tracking-[-0.045em]">
        Your daily
        <br />
        <span className="text-primary">brain</span> arcade.
        <span className="sr-only">
          {" "}
          — free daily web games: word games, trivia and party rounds you can
          play in your browser.
        </span>
      </h1>

      <p className="mt-6 max-w-[44ch] text-[1.0625rem] leading-8 text-muted-foreground">
        Word games, trivia, party rounds — all in your browser. New games join
        the lineup regularly. Jump in, no account needed.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button
          asChild
          size="lg"
          className="rounded-full px-7 shadow-[0_0.1875rem_0_oklch(0.46_0.12_155)]"
        >
          <a href={nearoConfig.route}>Play today's game</a>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="rounded-full px-7"
        >
          <a href="#catalog">Browse all →</a>
        </Button>
      </div>
    </div>
  </header>
)
