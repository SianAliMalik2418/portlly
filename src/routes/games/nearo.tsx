import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router"
import { Nearo } from "@/games/nearo/nearo"
import { nearoConfig } from "@/games/nearo/config"
import { NearoSeoContent } from "@/games/nearo/components/nearo-seo-content"
import { nearoDefinition, nearoFaqs, nearoHowToSteps } from "@/games/nearo/seo"
import { AI_SEO_UPDATED, SITE_URL, jsonLd, seo } from "@/lib/seo"

const nearoSchema = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  "@id": `${SITE_URL}${nearoConfig.route}#game`,
  name: nearoConfig.name,
  url: `${SITE_URL}${nearoConfig.route}`,
  description: nearoDefinition,
  genre: "Word game",
  gamePlatform: "Web browser",
  applicationCategory: "Game",
  operatingSystem: "Any",
  inLanguage: "en-US",
  isAccessibleForFree: true,
  dateModified: AI_SEO_UPDATED,
  publisher: { "@id": `${SITE_URL}/#organization` },
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
}

const nearoHowToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to play Nearo",
  description:
    "Guess the hidden Nearo word by trying related words and following semantic similarity scores.",
  totalTime: "PT4M",
  step: nearoHowToSteps.map((step, index) => ({
    "@type": "HowToStep",
    position: index + 1,
    text: step,
  })),
}

const nearoFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: nearoFaqs.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
}

const nearoBreadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Portlyy",
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: nearoConfig.name,
      item: `${SITE_URL}${nearoConfig.route}`,
    },
  ],
}

export const Route = createFileRoute("/games/nearo")({
  component: NearoRoute,
  head: () => {
    const meta = seo({
      title: `${nearoConfig.name} — Daily Word-Meaning Game | Portlyy`,
      description:
        "Play Nearo, the free daily word game. Guess the hidden word by meaning — each try gets a similarity score and a rank when you're close.",
      path: nearoConfig.route,
    })

    return {
      ...meta,
      scripts: [
        jsonLd(nearoSchema),
        jsonLd(nearoHowToSchema),
        jsonLd(nearoFaqSchema),
        jsonLd(nearoBreadcrumbSchema),
      ],
    }
  },
})

function NearoRoute() {
  const pathname = useLocation({ select: (location) => location.pathname })

  if (pathname !== nearoConfig.route) {
    return <Outlet />
  }

  return (
    <>
      <Nearo mode="daily" />
      <NearoSeoContent />
    </>
  )
}
