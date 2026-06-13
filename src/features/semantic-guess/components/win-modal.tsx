import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useState } from "react"
import { buildEmojiJourney } from "../lib/engine"
import type { WordGuess } from "@/games/word/types"

type WinModalProps = {
  open: boolean
  guesses: WordGuess[]
  puzzleId: string
  onReset: () => void
  onClose: () => void
}

export const WinModal = ({
  open,
  guesses,
  puzzleId,
  onReset,
  onClose,
}: WinModalProps) => {
  const [copied, setCopied] = useState(false)
  const journey = buildEmojiJourney(guesses)
  const best = guesses.reduce<WordGuess | null>(
    (b, g) => (!b || g.score > b.score ? g : b),
    null
  )
  const shareText = `Closer ${puzzleId} — solved in ${guesses.length} guesses\n${journey}\nplay at portlly`

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {}
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
      }}
    >
      <DialogContent className="max-w-[26.25rem] rounded-[1.5rem] border-border p-0 text-center [&>button]:hidden">
        <div className="px-5.5 py-6.5">
          <span className="text-[3.25rem]">🏆</span>
          <h2 className="mt-1.5 font-display text-[1.875rem] font-bold tracking-[-0.02em]">
            You found it!
          </h2>

          <div className="mt-4.5 flex gap-2.5">
            {[
              { value: guesses.length, label: "GUESSES" },
              { value: puzzleId, label: "PUZZLE" },
              { value: best ? Math.round(best.score) : 0, label: "HOTTEST" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex-1 rounded-xl bg-muted px-1.5 py-3"
              >
                <b className="block font-display text-xl">{stat.value}</b>
                <span className="font-mono text-[9px] tracking-[0.04em] text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          <p className="my-4 text-xl leading-relaxed tracking-[3px]">
            {journey}
          </p>

          <div className="flex flex-col gap-2.5">
            <Button
              className="rounded-full shadow-[0_0.1875rem_0_oklch(0.46_0.12_155)]"
              onClick={handleShare}
            >
              {copied ? "Copied! ✓" : "Share result"}
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={onReset}
            >
              Play again
            </Button>
            <Button variant="ghost" className="rounded-full" asChild>
              <a href="/">More games →</a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
