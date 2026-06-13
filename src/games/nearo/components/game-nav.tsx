import { ModeToggle } from "@/components/mode-toggle"
import { PlatformHeader } from "@/components/platform-header"
import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { nearoConfig } from "../config"

type GameNavProps = {
  mode: "daily" | "archive"
  selectedDate: string | null
}

export const GameNav = ({ mode, selectedDate }: GameNavProps) => (
  <PlatformHeader
    className="border-transparent"
    contentClassName="h-16 max-w-[44rem] px-3 sm:px-4"
    leading={
      <Link
        to="/"
        aria-label="Back to games"
        className="flex items-center gap-2 font-display text-sm font-bold text-foreground no-underline"
      >
        <motion.span
          whileTap={{ transform: "translateX(-2px) rotate(-8deg) scale(0.88)" }}
          transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
          className="btn-press grid size-9 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground shadow-sm"
        >
          <ArrowLeft className="size-4" />
        </motion.span>
      </Link>
    }
    center={
      <div className="text-center leading-tight">
        <b className="block font-display text-xl leading-none font-bold">
          {nearoConfig.name}
        </b>
        <span className="font-mono text-[10px] text-muted-foreground">
          {mode === "archive" ? selectedDate : "TODAY"}
        </span>
      </div>
    }
    trailing={<ModeToggle />}
  />
)
