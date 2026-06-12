import { Button } from "@/components/ui/button"
import { stats } from "../lib/games"
import { FloatingWordField } from "./floating-word-field"

type HomeHeroProps = {
  playerCount: number
}

export const HomeHero = ({ playerCount }: HomeHeroProps) => (
  <header className="relative py-[46px] lg:py-[70px]">
    <FloatingWordField />

    <div className="relative z-[1] mx-auto max-w-[1120px] px-[18px]">
      <span className="inline-flex items-center gap-1.5 font-mono text-xs tracking-[0.12em] text-[oklch(0.62_0.14_150)] uppercase">
        ● new puzzle daily
      </span>

      <h1 className="mt-4 font-display text-[clamp(2.6rem,10vw,4.5rem)] leading-[1.04] font-bold tracking-[-0.045em]">
        Tiny games.
        <br />
        Big <span className="text-primary">brain</span> energy.
      </h1>

      <p className="mt-4 max-w-[40ch] text-[1.0625rem] text-muted-foreground">
        A growing playground of quick, clever, ridiculously replayable games. No
        downloads, no graphics arms race, just the good stuff. Play solo or race
        a friend.
      </p>

      <div className="mt-[26px] flex flex-wrap gap-2.5">
        <Button
          asChild
          size="lg"
          className="rounded-full px-7 shadow-[0_3px_0_oklch(0.46_0.12_155)]"
        >
          <a href="/games/semantic-guess">Play today's game</a>
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

      <div className="mt-[30px] flex flex-wrap gap-[22px]">
        {stats.map((stat) => (
          <div key={stat.id}>
            <b className="block font-display text-2xl tracking-[-0.03em]">
              {stat.id === "players"
                ? playerCount.toLocaleString()
                : stat.value}
            </b>
            <span className="font-mono text-[11px] tracking-[0.03em] text-muted-foreground">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  </header>
)
