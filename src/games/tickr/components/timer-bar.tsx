import { Clock3 } from "lucide-react"

type TimerBarProps = {
  clockSeconds: number
  presetSeconds: number
}

export const TimerBar = ({ clockSeconds, presetSeconds }: TimerBarProps) => {
  const progress = presetSeconds > 0 ? clockSeconds / presetSeconds : 0
  const urgency =
    progress <= 0.2
      ? "bg-destructive"
      : progress <= 0.45
        ? "bg-amber-500"
        : "bg-primary"

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Clock3 className="size-4 text-muted-foreground" />
          <span className="font-mono text-xs font-bold tracking-[0.08em] text-muted-foreground uppercase">
            Clock
          </span>
        </div>
        <span className="font-mono text-3xl font-black tabular-nums">
          {clockSeconds.toFixed(1)}
        </span>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-[width,background-color] ${urgency}`}
          style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
        />
      </div>
    </div>
  )
}
