import { createFileRoute } from "@tanstack/react-router"
import { streamQuestionBucket } from "@/games/tickr/server/questions-r2"

export const Route = createFileRoute("/api/tickr/questions")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const difficulty = new URL(request.url).searchParams.get("difficulty")

        if (!difficulty) {
          return Response.json(
            { error: "Missing required difficulty" },
            { status: 400 }
          )
        }

        return streamQuestionBucket(difficulty)
      },
    },
  },
})
