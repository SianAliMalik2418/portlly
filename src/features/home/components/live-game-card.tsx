import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import type { Game } from "../lib/games"
import { demoGuesses } from "../lib/games"
import { getTemperatureColor } from "../lib/temperature"
import { GameMetaList } from "./game-meta-list"

type LiveGameCardProps = {
  game: Game
}

export const LiveGameCard = ({ game }: LiveGameCardProps) => (
  <motion.div
    className="relative col-span-1 flex min-h-[14.375rem] flex-col overflow-hidden rounded-[1.625rem] border border-transparent bg-foreground p-4.5 text-background sm:col-span-2 lg:col-span-3"
    whileHover={{ y: -4 }}
    whileTap={{ y: -1, scale: 0.99 }}
    transition={{ type: "spring", stiffness: 400, damping: 25 }}
  >
    <a
      href={game.href ?? "/"}
      className="absolute inset-0 z-[1]"
      aria-label={`Play ${game.name}`}
    />
    <div
      className="pointer-events-none absolute -top-15 -right-15 h-[13.75rem] w-[13.75rem] rounded-full opacity-40"
      style={{
        background: "radial-gradient(circle, var(--primary), transparent 70%)",
      }}
    />

    <div className="flex items-start justify-between">
      <span className="text-[3.5rem] leading-none">{game.glyph}</span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 font-mono text-[0.625rem] font-bold tracking-[0.05em] text-primary-foreground">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
        LIVE NOW
      </span>
    </div>

    <h3 className="mt-3.5 font-display text-[1.875rem] leading-tight font-bold tracking-[-0.02em] text-background">
      {game.name}
    </h3>
    <p
      className="mt-1.25 max-w-[34ch] text-[0.9375rem]"
      style={{
        color: "color-mix(in srgb, var(--background) 75%, transparent)",
      }}
    >
      {game.description}
    </p>

    <div className="mt-3.5 flex flex-wrap gap-1.5">
      {demoGuesses.map((guess) => (
        <span
          key={guess.word}
          className="inline-flex items-center gap-1.75 rounded-full px-2.75 py-1.5 font-mono text-xs font-semibold"
          style={{
            background: getTemperatureColor(guess.temperature),
            color: "#1a1813",
          }}
        >
          {guess.word} <b>{Math.round(guess.temperature * 100)}</b>
        </span>
      ))}
    </div>

    <div className="pointer-events-none relative z-[2] mt-auto flex flex-wrap items-center gap-2">
      <div className="contents">
        <GameMetaList items={game.meta} tone="featured" />
      </div>
      <span className="pointer-events-auto ml-auto pt-4">
        <Button
          asChild
          size="sm"
          className="rounded-full shadow-[0_0.1875rem_0_oklch(0.46_0.12_155)]"
        >
          <a href={game.href ?? "/"}>Play →</a>
        </Button>
      </span>
    </div>
  </motion.div>
)
