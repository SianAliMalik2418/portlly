import { createFileRoute } from "@tanstack/react-router"
import { SemanticGuess } from "@/games/semantic-guess/semantic-guess"

export const Route = createFileRoute("/games/semantic-guess")({
  component: SemanticGuess,
})
