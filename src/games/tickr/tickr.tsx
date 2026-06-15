import { useEffect } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { tickrConfig } from "./config"
import { QuestionCard } from "./components/question-card"
import { ResultScreen } from "./components/result-screen"
import { RunHud } from "./components/run-hud"
import { StartScreen } from "./components/start-screen"
import { TimerBar } from "./components/timer-bar"
import { tickrQuestionBucketQueryOptions } from "./data/questions"
import { useRun } from "./hooks/use-run"
import { prefetchBucket, setLoadedBucket } from "./lib/bank"
import { RotateCcw } from "lucide-react"

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
    return run.result ? (
      <ResultScreen
        result={run.result}
        onPlayAgain={run.playAgain}
        onChangePreset={run.reset}
      />
    ) : null
  }

  return (
    <StartScreen
      canStart={canStart}
      questionBankStatus={questionBankStatus}
      bestScores={run.bestScores}
      onStart={(presetSeconds) => void run.startRun(presetSeconds)}
    />
  )
}
