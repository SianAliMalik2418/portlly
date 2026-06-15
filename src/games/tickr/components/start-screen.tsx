import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { tickrConfig } from "../config"
import type { TickrTimerPreset } from "../types"
import { Clock3, ShieldAlert, Zap } from "lucide-react"

type StartScreenProps = {
  canStart: boolean
  questionBankStatus: string
  bestScores: Record<TickrTimerPreset, number | null>
  onStart: (presetSeconds: TickrTimerPreset) => void
}

export const StartScreen = ({
  canStart,
  questionBankStatus,
  bestScores,
  onStart,
}: StartScreenProps) => {
  const [selectedPreset, setSelectedPreset] = useState<TickrTimerPreset>(
    tickrConfig.timerPresets[0]
  )
  const selectedBest = useMemo(
    () => bestScores[selectedPreset],
    [bestScores, selectedPreset]
  )

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
            Phase 5
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
              {tickrConfig.timerPresets.map((seconds) => {
                const selected = seconds === selectedPreset

                return (
                  <button
                    key={seconds}
                    type="button"
                    disabled={!canStart}
                    className={`aspect-[1.18] rounded-md border text-center transition-colors ${
                      selected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-background hover:border-primary/60 hover:bg-primary/10"
                    }`}
                    onClick={() => setSelectedPreset(seconds)}
                  >
                    <span className="block text-2xl font-black">{seconds}</span>
                    <span className="mt-1 block font-mono text-[0.6875rem] font-bold text-muted-foreground uppercase">
                      sec
                    </span>
                  </button>
                )
              })}
            </div>

            <p className="mt-3 text-center text-sm text-muted-foreground">
              {selectedBest === null
                ? "No best yet"
                : `Best: ${selectedBest} correct`}
            </p>

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

            <Button
              className="mt-5 w-full"
              size="lg"
              disabled={!canStart}
              onClick={() => onStart(selectedPreset)}
            >
              Start
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}
