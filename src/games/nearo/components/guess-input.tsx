import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Lightbulb, SendHorizontal } from "lucide-react"
import { useRef, type KeyboardEvent } from "react"
import { toast } from "sonner"

type GuessInputProps = {
  className?: string
  input: string
  shake: boolean
  won: boolean
  hintEnabled: boolean
  guessesUntilHint: number
  hintsUsed: number
  maxHints: number
  onInputChange: (value: string) => void
  onSubmit: () => void
  onHint: () => boolean
}

export const GuessInput = ({
  className,
  input,
  shake,
  won,
  hintEnabled,
  guessesUntilHint,
  hintsUsed,
  maxHints,
  onInputChange,
  onSubmit,
  onHint,
}: GuessInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const remainingHints = Math.max(maxHints - hintsUsed, 0)

  const dismissMobileKeyboard = () => {
    if (typeof window === "undefined") return

    if (window.matchMedia("(max-width: 640px), (pointer: coarse)").matches) {
      inputRef.current?.blur()
    }
  }

  const handleSubmit = () => {
    onSubmit()
    if (input.trim()) dismissMobileKeyboard()
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit()
  }

  return (
    <div
      className={cn(
        "px-5 pt-3 pb-[calc(0.85rem+env(safe-area-inset-bottom))] backdrop-blur-[10px] sm:px-6",
        className
      )}
      style={{
        background: "color-mix(in srgb, var(--background) 88%, transparent)",
      }}
    >
      <div
        id="nearo-input"
        className="relative rounded-[1.5rem] border border-border bg-card p-2.5 shadow-[0_0.5rem_1.25rem_color-mix(in_srgb,var(--foreground)_6%,transparent)]"
      >
        <div className="relative">
          <input
            ref={inputRef}
            className={cn(
              "h-12 w-full rounded-full border border-border bg-card pr-[7.5rem] pl-5 text-sm font-semibold text-foreground shadow-inner outline-none placeholder:text-muted-foreground focus:border-primary focus:shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--primary)_20%,transparent),0_0_0_4px_color-mix(in_srgb,var(--primary)_14%,transparent)]",
              shake && "animate-[shake_0.32s] border-destructive"
            )}
            style={{
              transition:
                "border-color 200ms cubic-bezier(0.23,1,0.32,1), box-shadow 200ms cubic-bezier(0.23,1,0.32,1)",
            }}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            aria-label="Guess word"
            placeholder={won ? "Solved" : "Type a word..."}
            disabled={won}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />

          <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1.5">
            <motion.button
              id="nearo-hint"
              whileTap={hintEnabled && !won ? { y: 2, scale: 0.95 } : undefined}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className={cn(
                "flex h-10 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition-colors",
                hintEnabled && !won
                  ? "bg-amber-500/15 text-amber-500 hover:bg-amber-500/25"
                  : "cursor-not-allowed bg-muted text-muted-foreground/40"
              )}
              onClick={() => {
                if (won) return
                if (!hintEnabled) {
                  if (hintsUsed >= maxHints) {
                    toast.info(`All ${maxHints} hints used`)
                  } else {
                    toast.info(
                      `Available in ${guessesUntilHint} more ${guessesUntilHint === 1 ? "guess" : "guesses"}`
                    )
                  }
                  return
                }
                const hintApplied = onHint()
                if (!hintApplied) {
                  toast.warning("Hints are not available at this moment")
                }
              }}
              aria-label={`Get a hint (${remainingHints} remaining)`}
            >
              <Lightbulb className="size-4" />
              <span>{remainingHints} left</span>
            </motion.button>

            <motion.button
              whileTap={{ y: 2, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_0.35rem_1rem_color-mix(in_srgb,var(--primary)_30%,transparent)]"
              onClick={handleSubmit}
              disabled={won}
              aria-label="Submit guess"
            >
              <SendHorizontal className="size-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
