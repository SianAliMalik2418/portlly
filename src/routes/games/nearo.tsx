import { createFileRoute } from "@tanstack/react-router"
import { Nearo } from "@/games/nearo/nearo"

export const Route = createFileRoute("/games/nearo")({
  component: Nearo,
})
