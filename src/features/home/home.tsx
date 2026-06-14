import { GameCatalog } from "./components/game-catalog"
import { HomeAiSummary } from "./components/home-ai-summary"
import { HomeFooter } from "./components/home-footer"
import { HomeHero } from "./components/home-hero"
import { HomeNav } from "./components/home-nav"
import { usePageScrolled } from "./hooks/use-page-scrolled"

export const Home = () => {
  const scrolled = usePageScrolled()

  return (
    <div className="overflow-x-hidden">
      <HomeNav scrolled={scrolled} />
      <HomeHero />
      <GameCatalog />
      <HomeAiSummary />
      <HomeFooter />
    </div>
  )
}
