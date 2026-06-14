import { createFileRoute } from "@tanstack/react-router"
import { Nearo } from "@/games/nearo/nearo"
import { nearoConfig } from "@/games/nearo/config"
import { seo } from "@/lib/seo"

export const Route = createFileRoute("/games/nearo/archive/$date")({
  component: ArchivePuzzleRoute,
  head: ({ params }) =>
    seo({
      title: `Nearo — Puzzle for ${params.date} | Portlyy`,
      description: `Replay the Nearo word puzzle from ${params.date}. Guess the hidden word by meaning.`,
      path: `${nearoConfig.archiveRoute}/${params.date}`,
      noindex: true,
    }),
})

function ArchivePuzzleRoute() {
  const { date } = Route.useParams()

  return <Nearo mode="archive" date={date} />
}
