import { createFileRoute } from "@tanstack/react-router"
import { redirectToPuzzleDate } from "@/games/nearo/server/puzzle-r2"

export const Route = createFileRoute("/api/puzzles/day")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const date = new URL(request.url).searchParams.get("date")

        if (!date) {
          return Response.json(
            { error: "Missing required date" },
            { status: 400 }
          )
        }

        return redirectToPuzzleDate(request, date)
      },
    },
  },
})
