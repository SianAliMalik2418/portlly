import { createFileRoute } from "@tanstack/react-router"
import { LLMS_TXT_PATH, PRICING_MD_PATH, SITE_URL } from "@/lib/seo"
import { nearoConfig } from "@/games/nearo/config"
import { tickrConfig } from "@/games/tickr/config"

const routes = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: nearoConfig.route, changefreq: "daily", priority: "0.9" },
  { path: tickrConfig.route, changefreq: "weekly", priority: "0.8" },
  { path: LLMS_TXT_PATH, changefreq: "weekly", priority: "0.4" },
  { path: PRICING_MD_PATH, changefreq: "monthly", priority: "0.4" },
]

function buildSitemap() {
  const today = new Date().toISOString().slice(0, 10)
  const urls = routes
    .map(
      ({ path, changefreq, priority }) =>
        `  <url>\n    <loc>${SITE_URL}${path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
    )
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(buildSitemap(), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        }),
    },
  },
})
