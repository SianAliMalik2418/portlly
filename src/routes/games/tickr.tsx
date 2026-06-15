import { createFileRoute } from "@tanstack/react-router"
import { Tickr } from "@/games/tickr/tickr"
import { tickrConfig } from "@/games/tickr/config"
import { tickrDefinition, tickrFaqs, tickrHowToSteps } from "@/games/tickr/seo"
import { AI_SEO_UPDATED, SITE_URL, jsonLd, seo } from "@/lib/seo"

const tickrSchema = {
  "@context": "https://schema.org",
  "@type": "VideoGame",
  "@id": `${SITE_URL}${tickrConfig.route}#game`,
  name: tickrConfig.name,
  url: `${SITE_URL}${tickrConfig.route}`,
  description: tickrDefinition,
  genre: "Trivia game",
  gamePlatform: "Web browser",
  applicationCategory: "Game",
  operatingSystem: "Any",
  inLanguage: "en-US",
  isAccessibleForFree: true,
  dateModified: AI_SEO_UPDATED,
  publisher: { "@id": `${SITE_URL}/#organization` },
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
}

const tickrHowToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to play Tickr",
  description:
    "Choose a timer, answer rapid-fire General Knowledge trivia, and survive until the clock runs out.",
  totalTime: "PT2M",
  step: tickrHowToSteps.map((step, index) => ({
    "@type": "HowToStep",
    position: index + 1,
    text: step,
  })),
}

const tickrFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: tickrFaqs.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
}

const tickrBreadcrumbSchema = {
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
      name: tickrConfig.name,
      item: `${SITE_URL}${tickrConfig.route}`,
    },
  ],
}

export const Route = createFileRoute("/games/tickr")({
  component: Tickr,
  head: () => ({
    ...seo({
      title: `${tickrConfig.name} — Survival Trivia Game | Portlyy`,
      description: tickrConfig.description,
      path: tickrConfig.route,
    }),
    scripts: [
      jsonLd(tickrSchema),
      jsonLd(tickrHowToSchema),
      jsonLd(tickrFaqSchema),
      jsonLd(tickrBreadcrumbSchema),
    ],
  }),
})
