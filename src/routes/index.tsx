import { createFileRoute } from "@tanstack/react-router"
import { Home } from "@/features/home/home"
import { homeAiQuestions } from "@/features/home/lib/ai-seo"
import { games } from "@/features/home/lib/games"
import {
  AI_SEO_UPDATED,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  jsonLd,
  seo,
} from "@/lib/seo"

const liveGames = games.filter((game) => game.status === "live" && game.href)

const homeCollectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${SITE_URL}/#home`,
  name: `${SITE_NAME} - Free Daily Web Games`,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  dateModified: AI_SEO_UPDATED,
  isPartOf: { "@id": `${SITE_URL}/#website` },
  mainEntity: {
    "@type": "ItemList",
    itemListElement: liveGames.map((game, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: game.name,
      url: `${SITE_URL}${game.href}`,
      description: game.description,
    })),
  },
}

const homeFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: homeAiQuestions.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
}

export const Route = createFileRoute("/")({
  component: Home,
  head: () => {
    const meta = seo({
      title: "Portlyy — Free Daily Web Games",
      description:
        "Your daily brain arcade. Play word games, trivia and party rounds right in your browser — no account, no download. New games drop regularly.",
      path: "/",
    })

    return {
      ...meta,
      scripts: [jsonLd(homeCollectionSchema), jsonLd(homeFaqSchema)],
    }
  },
})
