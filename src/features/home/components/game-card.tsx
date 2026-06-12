import type { Game } from "../lib/games"
import { LiveGameCard } from "./live-game-card"
import { SoonGameCard } from "./soon-game-card"

type GameCardProps = {
  game: Game
}

export const GameCard = ({ game }: GameCardProps) => {
  if (game.status === "live") {
    return <LiveGameCard game={game} />
  }

  return <SoonGameCard game={game} />
}
