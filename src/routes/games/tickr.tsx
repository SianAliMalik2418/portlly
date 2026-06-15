import { createFileRoute } from "@tanstack/react-router"
import { Tickr } from "@/games/tickr/tickr"
import { tickrConfig } from "@/games/tickr/config"
import { SITE_URL, jsonLd, seo } from "@/lib/seo"

const tickrSchema = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  "@id": `${SITE_URL}${tickrConfig.route}#game`,
  name: tickrConfig.name,
  url: `${SITE_URL}${tickrConfig.route}`,
  description: tickrConfig.description,
  genre: "Trivia game",
  gamePlatform: "Web browser",
  applicationCategory: "Game",
  operatingSystem: "Any",
  inLanguage: "en-US",
  isAccessibleForFree: true,
  publisher: { "@id": `${SITE_URL}/#organization` },
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
}

export const Route = createFileRoute("/games/tickr")({
  component: Tickr,
  head: () => ({
    ...seo({
      title: `${tickrConfig.name} — Survival Trivia Game | Portlyy`,
      description: tickrConfig.description,
      path: tickrConfig.route,
    }),
    scripts: [jsonLd(tickrSchema)],
  }),
})
