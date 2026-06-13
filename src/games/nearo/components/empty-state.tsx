import { Target } from "lucide-react"

export const EmptyState = () => (
  <div className="flex flex-col items-center px-5 py-10 text-center text-muted-foreground">
    <div className="mb-3 grid size-11 place-items-center rounded-full border border-border bg-card text-foreground">
      <Target className="size-5" />
    </div>
    <p className="max-w-[32ch] text-sm leading-6">
      Try nouns, places, actions, or related ideas. Scores measure{" "}
      <b className="font-semibold text-foreground">meaning</b>, not spelling.
    </p>
  </div>
)
