import { nearoConfig } from "@/games/nearo/config"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { AI_SEO_UPDATED } from "@/lib/seo"
import { homeAiQuestions } from "../lib/ai-seo"

export const HomeAiSummary = () => (
  <section className="border-t border-border bg-muted/20 py-12">
    <div className="mx-auto grid max-w-[70rem] gap-8 px-4.5 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
      <div>
        <p className="font-mono text-xs tracking-[0.12em] text-primary uppercase">
          Overview
        </p>
        <h2
          id="about-portlyy"
          className="mt-3 max-w-[15ch] font-display text-3xl leading-tight font-bold"
        >
          Free daily web games, no account needed
        </h2>
        <p className="mt-4 max-w-[58ch] text-sm leading-7 text-muted-foreground">
          Portlyy is a free browser arcade for daily web games. You can play
          word games, trivia, and party rounds directly in a modern browser
          without creating an account or installing an app. The current live
          game is {nearoConfig.name}, a daily word-meaning puzzle.
        </p>
        <p className="mt-4 font-mono text-[0.6875rem] text-muted-foreground">
          Updated <time dateTime={AI_SEO_UPDATED}>June 14, 2026</time>
        </p>
      </div>

      <Accordion
        type="single"
        collapsible
        className="rounded-lg border-border bg-background/80"
        aria-labelledby="about-portlyy"
      >
        {homeAiQuestions.map((item, index) => (
          <AccordionItem key={item.question} value={`portlyy-faq-${index}`}>
            <AccordionTrigger className="px-4.5 py-4 text-sm font-semibold text-foreground hover:no-underline">
              {item.question}
            </AccordionTrigger>
            <AccordionContent className="text-sm leading-7 text-muted-foreground">
              {item.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
)
