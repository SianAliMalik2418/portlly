import { getScoreColor } from "@/lib/score-color"
import { Target } from "lucide-react"

const SAMPLE = { word: "ocean", rank: 42, score: 58 }

type EmptyStateProps = {
  showExample?: boolean
}

export const EmptyState = ({ showExample = false }: EmptyStateProps) => {
  if (!showExample) {
    return (
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
  }

  const color = getScoreColor(SAMPLE.score / 100)

  return (
    <div className="flex flex-col items-center px-5 py-6 text-center text-muted-foreground">
      <div className="mb-4 w-full max-w-md">
        <p className="mb-3 text-xs font-semibold tracking-wide uppercase text-muted-foreground/60">
          Example
        </p>
        <div className="flex min-h-14 items-center gap-3 rounded-[0.95rem] border border-dashed border-border bg-card/60 px-4 py-2.5">
          <span className="grid h-8 w-16 shrink-0 place-items-center rounded-full bg-muted/50 font-mono text-xs font-bold text-muted-foreground">
            #{SAMPLE.rank}
          </span>
          <span className="h-6 w-px shrink-0 bg-border" />
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground lowercase">
            {SAMPLE.word}
          </span>
          <span
            className="min-w-12 rounded-[0.75rem] border px-2.5 py-1.5 text-center font-mono text-xs font-bold"
            style={{
              background: `color-mix(in srgb, ${color} 14%, var(--card))`,
              borderColor: `color-mix(in srgb, ${color} 28%, var(--border))`,
              color,
            }}
          >
            {SAMPLE.score}%
          </span>
        </div>
      </div>
      <p className="max-w-[32ch] text-sm leading-6">
        Try nouns, places, actions, or related ideas. Scores measure{" "}
        <b className="font-semibold text-foreground">meaning</b>, not spelling.
      </p>
    </div>
  )
}
