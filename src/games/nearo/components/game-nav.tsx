import { ModeToggle } from "@/components/mode-toggle"
import { PlatformHeader } from "@/components/platform-header"
import { Link } from "@tanstack/react-router"
import { motion } from "framer-motion"
import { ArrowLeft } from "lucide-react"
import { NearoLogo } from "@/components/nearo-logo"

export const GameNav = () => (
  <PlatformHeader
    className="border-transparent"
    contentClassName="h-28 max-w-[43rem] px-6"
    style={{ background: "transparent" }}
    leading={
      <Link to="/" aria-label="Back to games" className="no-underline">
        <motion.span
          whileTap={{ x: -2, scale: 0.94 }}
          transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
          className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground shadow-[0_0.25rem_0.75rem_color-mix(in_srgb,var(--foreground)_5%,transparent)]"
        >
          <ArrowLeft className="size-5" strokeWidth={2.4} />
        </motion.span>
      </Link>
    }
    center={
      <div className="flex flex-col items-center text-center leading-none">
        <span className="sr-only">Nearo</span>
        <NearoLogo />
      </div>
    }
    trailing={
      <ModeToggle className="size-10 bg-card shadow-[0_0.25rem_0.75rem_color-mix(in_srgb,var(--foreground)_5%,transparent)] [&_svg]:!size-5" />
    }
  />
)
