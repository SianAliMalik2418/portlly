import { createFileRoute } from "@tanstack/react-router"
import { getArchiveDays } from "@/games/nearo/server/puzzle-r2"

export const Route = createFileRoute("/api/puzzles/archive")({
  server: {
    handlers: {
      GET: async () => getArchiveDays(),
    },
  },
})
