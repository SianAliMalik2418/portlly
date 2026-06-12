import { createFileRoute } from "@tanstack/react-router"
import { redirectToTodaysPuzzle } from "@/games/word/server/puzzle-r2"

export const Route = createFileRoute("/api/puzzles/today")({
  server: {
    handlers: {
      GET: async ({ request }) => redirectToTodaysPuzzle(request),
    },
  },
})
