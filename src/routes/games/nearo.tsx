import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router"
import { Nearo } from "@/games/nearo/nearo"
import { nearoConfig } from "@/games/nearo/config"

export const Route = createFileRoute("/games/nearo")({
  component: NearoRoute,
})

function NearoRoute() {
  const pathname = useLocation({ select: (location) => location.pathname })

  return pathname === nearoConfig.route ? <Nearo mode="daily" /> : <Outlet />
}
