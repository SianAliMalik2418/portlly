import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import {
  AI_SEO_UPDATED,
  LLMS_TXT_PATH,
  PRICING_MD_PATH,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo"

import appCss from "../styles.css?url"

const queryClient = new QueryClient()

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "en-US",
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/assets/portlyy-logo.png`,
      sameAs: ["https://github.com/SianAliMalik2418"],
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#webapp`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      applicationCategory: "GameApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires a modern web browser.",
      inLanguage: "en-US",
      isAccessibleForFree: true,
      dateModified: AI_SEO_UPDATED,
      publisher: { "@id": `${SITE_URL}/#organization` },
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ],
}

type RootDocumentProps = {
  children: React.ReactNode
}

export const RootDocument = ({ children }: RootDocumentProps) => (
  <html lang="en" suppressHydrationWarning>
    <head>
      <HeadContent />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </head>
    <body>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="system" storageKey="portlly:theme">
          {children}
        </ThemeProvider>
      </QueryClientProvider>
      <Toaster position="top-center" closeButton />
      <TanStackDevtools
        config={{ position: "bottom-right" }}
        plugins={[
          { name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> },
        ]}
      />
      <Scripts />
    </body>
  </html>
)

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        name: "theme-color",
        content: "#f6f4ee",
        media: "(prefers-color-scheme: light)",
      },
      {
        name: "theme-color",
        content: "#15140f",
        media: "(prefers-color-scheme: dark)",
      },
      { title: "Portlyy — Free Daily Web Games" },
      {
        name: "description",
        content:
          "Free daily web games — word games, trivia and party rounds you can play right in your browser. No account, no download.",
      },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { name: "application-name", content: SITE_NAME },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "alternate icon", href: "/favicon.ico" },
      { rel: "manifest", href: "/manifest.json" },
      {
        rel: "alternate",
        type: "text/plain",
        href: LLMS_TXT_PATH,
        title: "LLM context",
      },
      {
        rel: "alternate",
        type: "text/markdown",
        href: PRICING_MD_PATH,
        title: "Machine-readable pricing",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  notFoundComponent: () => (
    <main className="container mx-auto p-4 pt-16">
      <h1>404</h1>
      <p>The requested page could not be found.</p>
    </main>
  ),
  shellComponent: RootDocument,
})
