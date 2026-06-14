import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import type { Game } from "../lib/games"
import { demoGuesses } from "../lib/games"
import { getScoreColor } from "@/lib/score-color"
import { GameMetaList } from "./game-meta-list"

type LiveGameCardProps = {
  game: Game
}

export const LiveGameCard = ({ game }: LiveGameCardProps) => (
  <motion.div
    className="relative col-span-1 flex min-h-[18rem] overflow-hidden rounded-[1.625rem] border border-transparent bg-foreground text-background sm:col-span-2 lg:col-span-3"
    whileHover={{ transform: "translateY(-4px)" }}
    whileTap={{ transform: "translateY(-1px) scale(0.99)" }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
  >
    <a
      href={game.href ?? "/"}
      className="absolute inset-0 z-[1]"
      aria-label={`Play ${game.name}`}
    />

    <img
      src="/assets/nearo-cover-image.png"
      alt=""
      className="pointer-events-none absolute inset-0 h-full w-full object-cover object-right"
    />

    <div className="relative z-[2] flex flex-1 flex-col p-5 sm:p-6">
      <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 font-mono text-[0.625rem] font-bold tracking-[0.05em] text-primary-foreground uppercase">
        Featured
      </span>

      <span className="text-[3rem] leading-none">{game.glyph}</span>

      <h3 className="mt-3 font-display text-[2rem] leading-tight font-bold tracking-[-0.02em] text-background">
        {game.name}
      </h3>
      <p
        className="mt-1.5 max-w-[30ch] text-[0.9375rem] leading-relaxed"
        style={{
          color: "color-mix(in srgb, var(--background) 75%, transparent)",
        }}
      >
        {game.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {demoGuesses.map((guess) => (
          <span
            key={guess.word}
            className="inline-flex items-center gap-1.75 rounded-full px-2.75 py-1.5 font-mono text-xs font-semibold text-[#1a1813]"
            style={{ background: getScoreColor(guess.score / 100) }}
          >
            {guess.word} <b>{guess.score}</b>
          </span>
        ))}
      </div>

      <div className="pointer-events-none mt-auto flex flex-wrap items-center gap-2">
        <div className="contents">
          <GameMetaList items={game.meta} tone="featured" />
        </div>
        <span className="pointer-events-auto ml-auto pt-4">
          <Button
            asChild
            size="lg"
            className="rounded-full px-5 shadow-[0_0.1875rem_0_oklch(0.46_0.12_155)]"
          >
            <a href={game.href ?? "/"} className="inline-flex items-center gap-2">
              Play now
              <ArrowRight className="size-4" />
            </a>
          </Button>
        </span>
      </div>
    </div>

  </motion.div>
)
