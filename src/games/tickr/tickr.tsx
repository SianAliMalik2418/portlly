import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { tickrConfig } from "./config"
import { QuestionCard } from "./components/question-card"
import { RunHud } from "./components/run-hud"
import { TimerBar } from "./components/timer-bar"
import { tickrQuestionBucketQueryOptions } from "./data/questions"
import { useRun } from "./hooks/use-run"
import { prefetchBucket, setLoadedBucket } from "./lib/bank"
import { Clock3, RotateCcw, ShieldAlert, Zap } from "lucide-react"

export const Tickr = () => {
  const queryClient = useQueryClient()
  const easyQuestions = useQuery(tickrQuestionBucketQueryOptions("easy"))
  const run = useRun()

  useEffect(() => {
    if (easyQuestions.data) {
      setLoadedBucket("easy", easyQuestions.data)
    }
  }, [easyQuestions.data])

  useEffect(() => {
    void queryClient.prefetchQuery(tickrQuestionBucketQueryOptions("medium"))
    void queryClient.prefetchQuery(tickrQuestionBucketQueryOptions("hard"))
    prefetchBucket("medium")
    prefetchBucket("hard")
  }, [queryClient])

  const questionBankStatus = easyQuestions.isPending
    ? "Loading question bank"
    : easyQuestions.isError
      ? "Question bank unavailable"
      : `${easyQuestions.data.length} easy questions ready`
  const canStart = Boolean(easyQuestions.data?.length)
  const activePreset = run.state.presetSeconds ?? tickrConfig.timerPresets[0]

  if (run.phase === "running" || run.phase === "loading") {
    return (
      <main className="min-h-dvh bg-background text-foreground">
        <div className="mx-auto flex min-h-dvh w-full max-w-[44rem] flex-col gap-4 px-5 py-5 sm:px-8">
          <nav className="flex items-center justify-between gap-4 py-2">
            <a
              href="/"
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              Portlyy
            </a>
            <Button variant="ghost" size="sm" onClick={run.reset}>
              <RotateCcw className="size-4" />
              Reset
            </Button>
          </nav>

          <TimerBar
            clockSeconds={run.state.clockSeconds}
            presetSeconds={activePreset}
          />
          <RunHud
            correctCount={run.state.correctCount}
            wrongCount={run.state.wrongCount}
            currentStreak={run.state.currentStreak}
            bestStreak={run.state.bestStreak}
            questionIndex={run.state.questionIndex}
          />

          <div className="flex flex-1 items-center">
            {run.currentQuestion ? (
              <QuestionCard
                question={run.currentQuestion}
                onAnswer={run.answer}
              />
            ) : (
              <div className="w-full rounded-lg border border-border bg-card p-6 text-center">
                <p className="font-mono text-xs font-bold tracking-[0.08em] text-muted-foreground uppercase">
                  {run.loadingMessage ?? "Preparing next question"}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    )
  }

  if (run.phase === "ended") {
    return (
      <main className="min-h-dvh bg-background text-foreground">
        <div className="mx-auto flex min-h-dvh w-full max-w-[34rem] items-center px-5 py-8">
          <section className="w-full rounded-lg border border-border bg-card p-5 text-center shadow-[0_1rem_2rem_color-mix(in_srgb,var(--foreground)_8%,transparent)]">
            <p className="font-mono text-xs font-bold tracking-[0.08em] text-muted-foreground uppercase">
              Run ended
            </p>
            <h1 className="mt-3 text-6xl font-black tabular-nums">
              {run.state.correctCount}
            </h1>
            <p className="mt-2 text-muted-foreground">correct answers</p>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-md bg-muted p-3">
                <div className="font-mono text-lg font-black">
                  {run.state.elapsedSeconds.toFixed(1)}
                </div>
                <div className="mt-1 font-mono text-[0.625rem] font-bold text-muted-foreground uppercase">
                  seconds
                </div>
              </div>
              <div className="rounded-md bg-muted p-3">
                <div className="font-mono text-lg font-black">
                  {run.state.bestStreak}
                </div>
                <div className="mt-1 font-mono text-[0.625rem] font-bold text-muted-foreground uppercase">
                  streak
                </div>
              </div>
              <div className="rounded-md bg-muted p-3">
                <div className="font-mono text-lg font-black">
                  {run.state.wrongCount}
                </div>
                <div className="mt-1 font-mono text-[0.625rem] font-bold text-muted-foreground uppercase">
                  misses
                </div>
              </div>
            </div>
            <Button className="mt-6 w-full" size="lg" onClick={run.reset}>
              Play again
            </Button>
          </section>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto flex min-h-dvh w-full max-w-[52rem] flex-col px-5 py-5 sm:px-8">
        <nav className="flex items-center justify-between gap-4 py-2">
          <a
            href="/"
            className="text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Portlyy
          </a>
          <span className="rounded-full border border-border bg-card px-3 py-1 font-mono text-[0.6875rem] font-bold tracking-[0.08em] text-muted-foreground uppercase">
            Phase 4
          </span>
        </nav>

        <section className="grid flex-1 items-center gap-8 py-8 md:grid-cols-[1fr_22rem]">
          <div className="min-w-0">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground">
              <Zap className="size-4 text-primary" />
              Survival trivia
            </div>
            <h1 className="text-5xl leading-none font-black tracking-normal text-balance sm:text-7xl">
              {tickrConfig.name}
            </h1>
            <p className="mt-5 max-w-[34rem] text-lg leading-8 text-muted-foreground">
              {tickrConfig.description}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 shadow-[0_1rem_2rem_color-mix(in_srgb,var(--foreground)_8%,transparent)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold">Choose a clock</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Shorter runs hit harder.
                </p>
              </div>
              <Clock3 className="size-5 text-primary" />
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {tickrConfig.timerPresets.map((seconds) => (
                <button
                  key={seconds}
                  type="button"
                  disabled={!canStart}
                  className="aspect-[1.18] rounded-md border border-border bg-background text-center transition-colors hover:border-primary/60 hover:bg-primary/10"
                  onClick={() => void run.startRun(seconds)}
                >
                  <span className="block text-2xl font-black">{seconds}</span>
                  <span className="mt-1 block font-mono text-[0.6875rem] font-bold text-muted-foreground uppercase">
                    sec
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-md border border-dashed border-border bg-muted/50 p-3">
              <div className="flex items-start gap-2">
                <ShieldAlert className="mt-0.5 size-4 flex-none text-muted-foreground" />
                <p className="text-sm leading-6 text-muted-foreground">
                  Jumpscare mode will stay off by default and require explicit
                  consent before it can be enabled.
                </p>
              </div>
            </div>

            <p className="mt-4 text-center font-mono text-[0.6875rem] font-bold tracking-[0.08em] text-muted-foreground uppercase">
              {questionBankStatus}
            </p>

            <Button className="mt-5 w-full" size="lg" disabled>
              Pick a clock
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}
