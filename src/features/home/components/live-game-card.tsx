import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { getScoreColor } from "@/lib/score-color"
import type { Game } from "../lib/games"
import { arcadeCards, type ArcadeDemoPill } from "../lib/arcade"
import { GameMetaList } from "./game-meta-list"

type LiveGameCardProps = {
  game: Game
}

export const LiveGameCard = ({ game }: LiveGameCardProps) => {
  const card = arcadeCards[game.id]
  if (!card) return null

  const { theme, logo: Logo, demoPills, coverImages } = card

  return (
    <motion.div
      className={`relative col-span-1 flex min-h-[20rem] overflow-hidden rounded-[1.625rem] border ${theme.border} ${theme.bg} text-white shadow-[0_1rem_2.5rem_rgba(26,24,19,0.12)] sm:col-span-2 lg:col-span-3`}
      whileTap={{ y: -1, scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <a
        href={game.href ?? "/"}
        className="absolute inset-0 z-[1]"
        aria-label={`Play ${game.name}`}
      />

      {coverImages ? (
        <>
          <img
            src={coverImages.light}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full object-cover object-right dark:hidden"
          />
          <img
            src={coverImages.dark}
            alt=""
            className="pointer-events-none absolute inset-0 hidden h-full w-full object-cover object-right dark:block"
          />
        </>
      ) : (
        <TickrCoverArt />
      )}

      <div className={`absolute inset-0 ${theme.gradient}`} />

      <div className="relative z-[2] flex flex-1 flex-col p-5 sm:p-6">
        <span
          className={`mb-4 inline-flex w-fit items-center gap-1.5 rounded-full ${theme.badge} px-3 py-1.5 font-mono text-[0.625rem] font-bold tracking-[0.07em] text-white uppercase`}
        >
          {theme.badgeLabel}
        </span>

        <h3 className="mt-1">
          <span className="sr-only">{game.name}</span>
          <Logo className="h-11 text-white sm:h-12" />
        </h3>
        <p
          className="mt-3 max-w-[30ch] text-[0.9375rem] leading-relaxed"
          style={{ color: "rgba(255, 255, 255, 0.76)" }}
        >
          {game.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {demoPills.map((pill) => (
            <DemoPill key={pill.label} pill={pill} />
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
              className={`rounded-full ${theme.button} px-5 text-white`}
            >
              <a
                href={game.href ?? "/"}
                className="inline-flex items-center gap-2"
              >
                Play now
                <ArrowRight className="size-4" />
              </a>
            </Button>
          </span>
        </div>
      </div>
    </motion.div>
  )
}

const DemoPill = ({ pill }: { pill: ArcadeDemoPill }) => {
  if (pill.style === "score-color") {
    return (
      <span
        className="inline-flex items-center gap-1.75 rounded-full px-2.75 py-1.5 font-mono text-xs font-medium text-[#1a1813]"
        style={{ background: getScoreColor((pill.score ?? 0) / 100) }}
      >
        {pill.label} <span className="font-semibold">{pill.value}</span>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.75 rounded-full border border-white/20 bg-white/10 px-2.75 py-1.5 font-mono text-xs font-medium text-white">
      {pill.label}
      {pill.value && <span className="font-semibold">{pill.value}</span>}
    </span>
  )
}

const TickrCoverArt = () => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute top-1/2 right-[10%] h-[18rem] w-[18rem] -translate-y-1/2 rounded-full border-[3px] border-white/[0.06] sm:right-[15%] sm:h-[22rem] sm:w-[22rem]" />
    <div className="absolute top-1/2 right-[12%] h-[13rem] w-[13rem] -translate-y-1/2 rounded-full border-[2px] border-white/[0.08] sm:right-[17.5%] sm:h-[16rem] sm:w-[16rem]" />
    <div className="absolute top-1/2 right-[15%] h-[7rem] w-[7rem] -translate-y-1/2 rounded-full border-[2px] border-white/[0.1] sm:right-[21%] sm:h-[8.5rem] sm:w-[8.5rem]" />
    <div className="absolute top-1/2 right-[19%] h-[2.5rem] w-[2.5rem] -translate-y-1/2 rounded-full bg-[#7c4dbd]/30 sm:right-[24%] sm:h-[3rem] sm:w-[3rem]" />
    <div className="absolute top-[20%] right-[8%] font-mono text-[4rem] font-black text-white/[0.04] sm:text-[5.5rem]">
      ⏱
    </div>
  </div>
)
