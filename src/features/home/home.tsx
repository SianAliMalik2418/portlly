import { GameCatalog } from "./components/game-catalog"
import { HomeFooter } from "./components/home-footer"
import { HomeHero } from "./components/home-hero"
import { HomeNav } from "./components/home-nav"
import { useIncrementingPlayerCount } from "./hooks/use-incrementing-player-count"
import { usePageScrolled } from "./hooks/use-page-scrolled"

export const Home = () => {
  const playerCount = useIncrementingPlayerCount()
  const scrolled = usePageScrolled()

  return (
    <div className="overflow-x-hidden">
      <HomeNav scrolled={scrolled} />
      <HomeHero playerCount={playerCount} />
      <GameCatalog />
      <HomeFooter />
    </div>
  )
}
