import { Target } from "lucide-react"

export const EmptyState = () => (
  <div className="flex flex-col items-center px-5 py-10 text-center text-muted-foreground">
    <div className="mb-3 grid size-11 place-items-center rounded-full border border-border bg-card text-foreground">
      <Target className="size-5" />
    </div>
    <p className="max-w-[32ch] text-sm leading-6">
      Guess the secret word. Every guess is scored 0–100 by how close it is in{" "}
      <b className="font-semibold text-foreground">meaning</b> — not letters.
      Higher scores mean nearer meanings.
    </p>
  </div>
)
