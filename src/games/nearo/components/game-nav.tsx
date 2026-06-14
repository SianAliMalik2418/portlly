import { ModeToggle } from "@/components/mode-toggle"
import { PlatformHeader } from "@/components/platform-header"
import { Link } from "@tanstack/react-router"
import { format, parseISO } from "date-fns"
import { motion } from "framer-motion"
import { ArrowLeft, CircleHelp } from "lucide-react"
import { NearoLogo } from "@/components/nearo-logo"
import { nearoConfig } from "../config"

type GameNavProps = {
  mode: "daily" | "archive"
  selectedDate: string | null
}

const formatHeaderDate = (date: string | null) => {
  if (!date) return format(new Date(), "EEE, dd MMM yyyy")

  return format(parseISO(date), "EEE, dd MMM yyyy")
}

export const GameNav = ({ mode, selectedDate }: GameNavProps) => (
  <PlatformHeader
    className="border-transparent"
    contentClassName="h-28 max-w-[43rem] px-6"
    style={{ background: "transparent" }}
    leading={
      <Link to="/" aria-label="Back to games" className="no-underline">
        <motion.span
          whileTap={{ transform: "translateX(-2px) scale(0.94)" }}
          transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
          className="btn-press grid size-10 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground shadow-[0_0.25rem_0.75rem_color-mix(in_srgb,var(--foreground)_5%,transparent)]"
        >
          <ArrowLeft className="size-5" strokeWidth={2.4} />
        </motion.span>
      </Link>
    }
    center={
      <div className="flex flex-col items-center text-center leading-none">
        <span className="sr-only">Nearo</span>
        <NearoLogo />
        <span className="mt-0.5 ml-4 block font-mono text-xs font-bold text-muted-foreground">
          {formatHeaderDate(selectedDate)}
        </span>
      </div>
    }
    trailing={
      <div className="flex items-center gap-2">
        <motion.a
          href={
            mode === "daily"
              ? "#how-to-play-nearo"
              : `${nearoConfig.route}#how-to-play-nearo`
          }
          whileTap={{ transform: "translateY(2px) scale(0.94)" }}
          transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
          className="btn-press grid size-10 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground no-underline shadow-[0_0.25rem_0.75rem_color-mix(in_srgb,var(--foreground)_5%,transparent)]"
          aria-label="How to play"
        >
          <CircleHelp className="size-5" strokeWidth={2.4} />
        </motion.a>
        <ModeToggle className="size-10 bg-card shadow-[0_0.25rem_0.75rem_color-mix(in_srgb,var(--foreground)_5%,transparent)] [&_svg]:!size-5" />
      </div>
    }
  />
)
