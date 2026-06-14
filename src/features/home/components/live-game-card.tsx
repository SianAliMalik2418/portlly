import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import type { Game } from "../lib/games"
import { demoGuesses } from "../lib/games"
import { getScoreColor } from "@/lib/score-color"
import { NearoLogo } from "@/components/nearo-logo"
import { GameMetaList } from "./game-meta-list"

type LiveGameCardProps = {
  game: Game
}

export const LiveGameCard = ({ game }: LiveGameCardProps) => (
  <motion.div
    className="relative col-span-1 flex min-h-[20rem] overflow-hidden rounded-[1.625rem] border border-[#e7d9a8]/70 bg-[#07110d] text-white shadow-[0_1rem_2.5rem_rgba(26,24,19,0.12)] sm:col-span-2 lg:col-span-3"
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
      className="pointer-events-none absolute inset-0 h-full w-full object-cover object-right dark:hidden"
    />
    <img
      src="/assets/nearo-cover-image-dark.png"
      alt=""
      className="pointer-events-none absolute inset-0 hidden h-full w-full object-cover object-right dark:block"
    />

    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(45,60,45,0.78)_0%,rgba(45,60,45,0.5)_28%,rgba(45,60,45,0.12)_52%,transparent_100%)] dark:bg-[linear-gradient(90deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.45)_28%,rgba(0,0,0,0.08)_55%,transparent_100%)]" />

    <div className="relative z-[2] flex flex-1 flex-col p-5 sm:p-6">
      <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-[#1f5f35]/90 px-3 py-1.5 font-mono text-[0.625rem] font-bold tracking-[0.07em] text-white uppercase">
        Featured
      </span>

      <h3 className="mt-1">
        <span className="sr-only">{game.name}</span>
        <NearoLogo className="h-11 text-white sm:h-12" />
      </h3>
      <p
        className="mt-3 max-w-[30ch] text-[0.9375rem] leading-relaxed"
        style={{
          color: "rgba(255, 255, 255, 0.76)",
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
            className="rounded-full bg-[#3d9a54] px-5 text-white shadow-[0_0.1875rem_0_#1e6531] hover:bg-[#49aa61]"
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
