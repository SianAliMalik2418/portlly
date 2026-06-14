export const SITE_URL = "https://portlyy.com"
export const SITE_NAME = "Portlyy"
export const SITE_DESCRIPTION =
  "Free daily web games - word games, trivia and party rounds you can play in your browser with no account or download."
export const DEFAULT_OG_IMAGE = "/assets/nearo-cover-image.png"
export const AI_SEO_UPDATED = "2026-06-14"
export const LLMS_TXT_PATH = "/llms.txt"
export const PRICING_MD_PATH = "/pricing.md"

type SeoArgs = {
  title: string
  description: string
  path: string
  image?: string
  imageAlt?: string
  type?: "website" | "article"
  noindex?: boolean
}

export function seo({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  imageAlt = `${SITE_NAME} browser game preview`,
  type = "website",
  noindex = false,
}: SeoArgs) {
  const url = `${SITE_URL}${path}`
  const imageUrl = image.startsWith("http") ? image : `${SITE_URL}${image}`

  return {
    meta: [
      { title },
      { name: "description", content: description },
      {
        name: "robots",
        content: noindex
          ? "noindex, follow"
          : "index, follow, max-image-preview:large",
      },
      { name: "application-name", content: SITE_NAME },
      { property: "og:type", content: type },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:image", content: imageUrl },
      { property: "og:image:alt", content: imageAlt },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "en_US" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: imageUrl },
      { name: "twitter:image:alt", content: imageAlt },
    ],
    links: [{ rel: "canonical", href: url }],
  }
}

export function jsonLd(schema: Record<string, unknown>) {
  return {
    type: "application/ld+json",
    children: JSON.stringify(schema),
  }
}
