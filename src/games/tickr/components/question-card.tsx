import { Button } from "@/components/ui/button"
import type { TickrQuestion } from "../types"

type QuestionCardProps = {
  question: TickrQuestion
  disabled?: boolean
  onAnswer: (choice: string) => void
}

export const QuestionCard = ({
  question,
  disabled = false,
  onAnswer,
}: QuestionCardProps) => (
  <section className="w-full rounded-lg border border-border bg-card p-4 shadow-[0_1rem_2rem_color-mix(in_srgb,var(--foreground)_8%,transparent)]">
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <span className="rounded-full bg-muted px-2.5 py-1 font-mono text-[0.625rem] font-bold tracking-[0.08em] text-muted-foreground uppercase">
        {question.difficulty}
      </span>
      <span className="rounded-full bg-muted px-2.5 py-1 font-mono text-[0.625rem] font-bold tracking-[0.08em] text-muted-foreground uppercase">
        {question.category}
      </span>
    </div>
    <h2 className="text-2xl leading-snug font-black text-balance">
      {question.question}
    </h2>
    <div className="mt-5 grid gap-2">
      {question.options.map((option) => (
        <Button
          key={option}
          type="button"
          variant="outline"
          size="lg"
          disabled={disabled}
          className="h-auto min-h-12 justify-start rounded-md text-left leading-6 whitespace-normal"
          onClick={() => onAnswer(option)}
        >
          {option}
        </Button>
      ))}
    </div>
  </section>
)
