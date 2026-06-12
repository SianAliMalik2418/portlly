import { ModeToggle } from "@/components/mode-toggle"
import { motion } from "framer-motion"
import { DATE_LABEL, PUZZLE_NUMBER } from "../lib/demo-puzzle"

export const GameNav = () => (
  <nav className="flex items-center gap-2.5 px-4 py-3">
    <a
      href="/"
      className="flex items-center gap-2 font-display text-[0.9375rem] font-bold tracking-[-0.02em] text-foreground no-underline"
    >
      <motion.span
        whileTap={{ transform: "translateX(-2px) rotate(-8deg) scale(0.88)" }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
        className="grid h-6 w-6 shrink-0 place-items-center rounded-[7px] bg-primary text-[13px] text-primary-foreground shadow-[0_0.1875rem_0_oklch(0.46_0.12_155)]"
      >
        ‹
      </motion.span>
      portlly
    </a>

    <div className="flex-1 text-center leading-tight">
      <b className="block font-display text-[0.9375rem] font-bold">Closer</b>
      <span className="font-mono text-[10px] text-muted-foreground tracking-[0.04em]">
        #{PUZZLE_NUMBER} · {DATE_LABEL}
      </span>
    </div>

    <ModeToggle />
  </nav>
)
