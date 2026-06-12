import { useMemo, useState } from "react"
import type { GameFilter } from "../lib/games"
import { games } from "../lib/games"
import { GameCard } from "./game-card"
import { GameFilterList } from "./game-filter-list"

export const GameCatalog = () => {
  const [activeFilter, setActiveFilter] = useState<GameFilter>("all")

  const filteredGames = useMemo(
    () =>
      games.filter(
        (game) => activeFilter === "all" || game.category === activeFilter
      ),
    [activeFilter]
  )

  return (
    <section id="catalog" className="py-[14px] pb-[60px]">
      <div className="mx-auto max-w-[1120px] px-[18px]">
        <div className="mb-[18px] flex flex-wrap items-end justify-between gap-3">
          <h2 className="font-display text-[1.875rem] leading-tight font-bold tracking-[-0.02em]">
            The arcade
          </h2>
          <GameFilterList
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>

        <div className="mt-[18px] grid grid-cols-1 gap-[14px] sm:grid-cols-2 lg:grid-cols-3">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

        <p className="mt-[34px] text-center font-mono text-xs text-muted-foreground">
          ⚙︎ more games drop every few weeks, built on one shared system, so they
          all feel like home.
        </p>
      </div>
    </section>
  )
}
