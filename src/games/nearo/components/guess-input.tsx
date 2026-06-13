import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Lightbulb, SendHorizontal } from "lucide-react"
import type { KeyboardEvent } from "react"
import { toast } from "sonner"

type GuessInputProps = {
  input: string
  shake: boolean
  won: boolean
  hintEnabled: boolean
  guessesUntilHint: number
  onInputChange: (value: string) => void
  onSubmit: () => void
  onHint: () => void
}

export const GuessInput = ({
  input,
  shake,
  won,
  hintEnabled,
  guessesUntilHint,
  onInputChange,
  onSubmit,
  onHint,
}: GuessInputProps) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") onSubmit()
  }

  return (
    <div
      className="px-5 pt-3 pb-[calc(0.85rem+env(safe-area-inset-bottom))] backdrop-blur-[10px] sm:px-6"
      style={{
        background: "color-mix(in srgb, var(--background) 88%, transparent)",
      }}
    >
      <div className="relative rounded-[1.5rem] border border-border bg-card p-2.5 shadow-[0_0.5rem_1.25rem_color-mix(in_srgb,var(--foreground)_6%,transparent)]">
        <div className="relative">
          <input
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
              whileTap={
                hintEnabled && !won
                  ? { transform: "translateY(2px) scale(0.95)" }
                  : undefined
              }
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className={cn(
                "btn-press grid size-10 place-items-center rounded-full transition-colors",
                hintEnabled && !won
                  ? "bg-amber-500/15 text-amber-500 hover:bg-amber-500/25"
                  : "bg-muted text-muted-foreground/40 cursor-not-allowed"
              )}
              onClick={() => {
                if (won) return
                if (!hintEnabled) {
                  toast.info(
                    `Available in ${guessesUntilHint} more ${guessesUntilHint === 1 ? "guess" : "guesses"}`
                  )
                  return
                }
                onHint()
              }}
              aria-label="Get a hint"
            >
              <Lightbulb className="size-[1.125rem]" />
            </motion.button>

            <motion.button
              whileTap={{ transform: "translateY(2px) scale(0.95)" }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="btn-press grid size-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_0.35rem_1rem_color-mix(in_srgb,var(--primary)_30%,transparent)]"
              onClick={onSubmit}
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
