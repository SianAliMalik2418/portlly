type RunHudProps = {
  correctCount: number
  wrongCount: number
  currentStreak: number
  bestStreak: number
  questionIndex: number
}

export const RunHud = ({
  correctCount,
  wrongCount,
  currentStreak,
  bestStreak,
  questionIndex,
}: RunHudProps) => (
  <div className="grid grid-cols-4 gap-2">
    {[
      ["Correct", correctCount],
      ["Misses", wrongCount],
      ["Streak", currentStreak],
      ["Best", bestStreak],
    ].map(([label, value]) => (
      <div
        key={label}
        className="rounded-md border border-border bg-card px-3 py-2 text-center"
      >
        <div className="font-mono text-lg font-black tabular-nums">{value}</div>
        <div className="mt-1 truncate font-mono text-[0.625rem] font-bold tracking-[0.08em] text-muted-foreground uppercase">
          {label}
        </div>
      </div>
    ))}
    <div className="col-span-4 text-center font-mono text-[0.6875rem] font-bold tracking-[0.08em] text-muted-foreground uppercase">
      Question {questionIndex + 1}
    </div>
  </div>
)
