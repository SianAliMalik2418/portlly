import { createFileRoute } from "@tanstack/react-router"
import { SemanticGuess } from "@/features/semantic-guess/semantic-guess"

export const Route = createFileRoute("/games/semantic-guess")({
  component: SemanticGuess,
})
