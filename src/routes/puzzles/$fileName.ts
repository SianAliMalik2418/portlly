import { createFileRoute } from "@tanstack/react-router"
import { streamPuzzleFile } from "@/games/nearo/server/puzzle-r2"

export const Route = createFileRoute("/puzzles/$fileName")({
  server: {
    handlers: {
      GET: async ({ params }) => streamPuzzleFile(params.fileName),
    },
  },
})
