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
    <section id="catalog" className="border-t border-border py-9 pb-[3.75rem]">
      <div className="mx-auto max-w-[70rem] px-4.5">
        <div className="mb-8 flex flex-col items-center gap-6 text-center">
          <GameFilterList
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
          <h2 className="font-display text-[1.875rem] leading-tight font-bold tracking-[-0.02em]">
            The arcade
          </h2>
        </div>

        <div className="mt-4.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>

        <p className="mt-8.5 text-center font-mono text-xs text-muted-foreground">
          ⚙︎ more games drop every few weeks, built on one shared system, so they
          all feel like home.
        </p>
      </div>
    </section>
  )
}
