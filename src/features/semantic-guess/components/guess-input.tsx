import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import type { KeyboardEvent } from "react"

type GuessInputProps = {
  input: string
  toast: string
  shake: boolean
  won: boolean
  onInputChange: (value: string) => void
  onSubmit: () => void
}

export const GuessInput = ({ input, toast, shake, won, onInputChange, onSubmit }: GuessInputProps) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSubmit()
  }

  return (
    <div
      className="border-t border-border px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-[10px]"
      style={{ background: "color-mix(in srgb, var(--background) 90%, transparent)" }}
    >
      {toast && (
        <p className="mb-2 text-center text-sm font-semibold text-primary">{toast}</p>
      )}

      <div className="flex items-center gap-2">
        <input
          className={cn(
            "flex-1 rounded-full border border-input bg-card px-4 py-3.5 text-[1.0625rem] text-foreground outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted-foreground focus:border-primary focus:shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_20%,transparent)]",
            shake && "animate-[shake_0.32s] border-destructive",
          )}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={won ? "Solved! 🎉" : "Type a word…"}
          disabled={won}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
        />

        <motion.button
          whileTap={{ transform: "translateY(2px) scale(0.95)" }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          className="grid h-[3.125rem] w-[3.125rem] shrink-0 place-items-center rounded-full bg-primary text-[1.1875rem] text-primary-foreground shadow-[0_0.1875rem_0_oklch(0.46_0.12_155)]"
          onClick={onSubmit}
          disabled={won}
          aria-label="Submit guess"
        >
          ↑
        </motion.button>
      </div>
    </div>
  )
}
