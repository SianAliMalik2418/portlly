import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { GameFilter } from "../lib/games"
import { gameFilters } from "../lib/games"

type GameFilterListProps = {
  activeFilter: GameFilter
  onFilterChange: (filter: GameFilter) => void
}

export const GameFilterList = ({
  activeFilter,
  onFilterChange,
}: GameFilterListProps) => (
  <div className="flex [scrollbar-width:none] gap-2 overflow-x-auto pb-1">
    {gameFilters.map((filter) => (
      <motion.button
        key={filter}
        type="button"
        whileTap={{ transform: "scale(0.95)" }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
        onClick={() => onFilterChange(filter)}
        aria-pressed={activeFilter === filter}
        className={cn(
          "rounded-full border px-3.5 py-2 font-mono text-xs font-medium whitespace-nowrap transition-colors duration-200",
          activeFilter === filter
            ? "border-foreground bg-foreground text-background"
            : "border-border bg-card text-muted-foreground"
        )}
      >
        {filter}
      </motion.button>
    ))}
  </div>
)
