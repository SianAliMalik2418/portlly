import { createFileRoute } from "@tanstack/react-router"
import { Nearo } from "@/games/nearo/nearo"

export const Route = createFileRoute("/games/nearo/archive/$date")({
  component: ArchivePuzzleRoute,
})

function ArchivePuzzleRoute() {
  const { date } = Route.useParams()

  return <Nearo mode="archive" date={date} />
}
