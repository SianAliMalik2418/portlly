import { motion } from "framer-motion"
import { useRef, useState } from "react"
import type { Game } from "../lib/games"
import { GameMetaList } from "./game-meta-list"

type SoonGameCardProps = {
  game: Game
}

export const SoonGameCard = ({ game }: SoonGameCardProps) => {
  const [wiggling, setWiggling] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const handleClick = () => {
    setWiggling(true)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setWiggling(false), 350)
  }

  return (
    <motion.div
      animate={wiggling ? { x: [0, -5, 5, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.3 }}
      onClick={handleClick}
      className="relative flex min-h-[12.25rem] cursor-default flex-col rounded-[1.625rem] border border-border bg-card p-4.5 opacity-[0.92]"
    >
      <div className="flex items-start justify-between">
        <span className="text-[2.5rem] leading-none">{game.glyph}</span>
        <span className="rounded-full border border-dashed border-border px-2.5 py-1 font-mono text-[0.625rem] font-bold tracking-[0.08em] text-muted-foreground">
          SOON
        </span>
      </div>
      <h3 className="mt-3.5 font-display text-xl leading-tight font-bold tracking-[-0.02em]">
        {game.name}
      </h3>
      <p className="mt-1.25 text-sm text-muted-foreground">
        {game.description}
      </p>
      <GameMetaList items={game.meta} />
    </motion.div>
  )
}
