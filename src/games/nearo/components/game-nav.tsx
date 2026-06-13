import { ModeToggle } from "@/components/mode-toggle"
import { PlatformHeader } from "@/components/platform-header"
import { motion } from "framer-motion"
import { nearoConfig } from "../config"

type GameNavProps = {
  puzzleId: string | undefined
}

export const GameNav = ({ puzzleId }: GameNavProps) => (
  <PlatformHeader
    className="border-transparent"
    contentClassName="h-[3.25rem] max-w-[36.25rem] px-4"
    leading={
      <a
        href="/"
        className="flex items-center gap-2 font-display text-[0.9375rem] font-bold tracking-[-0.02em] text-foreground no-underline"
      >
        <motion.span
          whileTap={{ transform: "translateX(-2px) rotate(-8deg) scale(0.88)" }}
          transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
          className="btn-press grid h-6 w-6 shrink-0 place-items-center rounded-[7px] bg-primary text-[13px] text-primary-foreground shadow-[0_0.1875rem_0_oklch(0.46_0.12_155)]"
        >
          ‹
        </motion.span>
        portlly
      </a>
    }
    center={
      <div className="text-center leading-tight">
        <b className="block font-display text-[0.9375rem] font-bold">
          {nearoConfig.name}
        </b>
        {puzzleId && (
          <span className="font-mono text-[10px] tracking-[0.04em] text-muted-foreground">
            {puzzleId}
          </span>
        )}
      </div>
    }
    trailing={<ModeToggle />}
  />
)
