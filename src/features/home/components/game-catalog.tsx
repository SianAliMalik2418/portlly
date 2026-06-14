import { games } from "../lib/games"
import { LiveGameCard } from "./live-game-card"

const liveGames = games.filter((g) => g.status === "live")

export const GameCatalog = () => {
  return (
    <section id="catalog" className="border-t border-border py-9 pb-[3.75rem]">
      <div className="mx-auto max-w-[70rem] px-4.5">
        <div className="mb-8 text-center">
          <h2 className="font-display text-[1.875rem] leading-tight font-bold tracking-[-0.02em]">
            The arcade
          </h2>
        </div>

        <div className="mt-4.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {liveGames.map((game) => (
            <LiveGameCard key={game.id} game={game} />
          ))}
        </div>

        <p className="mt-8.5 text-center font-mono text-xs text-muted-foreground">
          More games coming soon.
        </p>
      </div>
    </section>
  )
}
