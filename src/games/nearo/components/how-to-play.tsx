import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CircleHelp } from "lucide-react"
import { motion } from "framer-motion"

export const HowToPlayDialog = () => {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <motion.button
        whileTap={{ transform: "translateY(2px) scale(0.94)" }}
        transition={{ duration: 0.16, ease: [0.23, 1, 0.32, 1] }}
        className="btn-press grid size-10 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground shadow-[0_0.25rem_0.75rem_color-mix(in_srgb,var(--foreground)_5%,transparent)]"
        onClick={() => setOpen(true)}
        aria-label="How to play"
      >
        <CircleHelp className="size-5" strokeWidth={2.4} />
      </motion.button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            How to play
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm text-muted-foreground">
          <p>
            A secret word is chosen each day. Your job is to find it by guessing
            words that are <b className="text-foreground">related in meaning</b>.
          </p>

          <ol className="list-inside list-decimal space-y-2.5">
            <li>
              <b className="text-foreground">Type any word</b> and press enter.
            </li>
            <li>
              You'll get a{" "}
              <b className="text-foreground">similarity score (0–100%)</b> — the
              higher the score, the closer in meaning you are.
            </li>
            <li>
              Close words also get a{" "}
              <b className="text-foreground">rank</b> showing how near you are
              to the top.
            </li>
            <li>
              Keep guessing until you hit{" "}
              <b className="text-foreground">100%</b> — that's the answer!
            </li>
          </ol>

          <div className="rounded-xl bg-muted/50 px-3.5 py-3">
            <p className="text-xs leading-relaxed">
              <b className="text-foreground">Tip:</b> Start broad (e.g.
              "animal", "food") to find the right category, then narrow down
              with synonyms.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => setOpen(false)} className="w-full">
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
