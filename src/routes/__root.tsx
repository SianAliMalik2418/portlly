import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools"
import { TanStackDevtools } from "@tanstack/react-devtools"
import { ThemeProvider } from "@/components/theme-provider"

import appCss from "../styles.css?url"

type RootDocumentProps = {
  children: React.ReactNode
}

export const RootDocument = ({ children }: RootDocumentProps) => (
  <html lang="en" suppressHydrationWarning>
    <head>
      <HeadContent />
    </head>
    <body>
      <ThemeProvider defaultTheme="system" storageKey="portlly:theme">
        {children}
      </ThemeProvider>
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
      { title: "Portlly - Playful Web Games" },
      {
        name: "description",
        content:
          "Portlly is a game-first portfolio platform for playful educational web games.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:ital,wght@0,400;0,500;0,700;1,400&display=swap",
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
