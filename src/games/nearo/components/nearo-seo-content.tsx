import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { AI_SEO_UPDATED } from "@/lib/seo"
import { nearoDefinition, nearoFaqs, nearoHowToSteps } from "../seo"

export const NearoSeoContent = () => (
  <section className="border-t border-border bg-muted/20">
    <article className="mx-auto max-w-[43rem] px-4.5 py-12">
      <header>
        <p className="font-mono text-xs tracking-[0.12em] text-primary uppercase">
          Game guide
        </p>
        <h2
          id="what-is-nearo"
          className="mt-3 font-display text-3xl leading-tight font-bold"
        >
          What is Nearo?
        </h2>
        <p className="mt-4 text-sm leading-7 text-muted-foreground">
          {nearoDefinition}
        </p>
        <p className="mt-4 font-mono text-[0.6875rem] text-muted-foreground">
          Updated <time dateTime={AI_SEO_UPDATED}>June 14, 2026</time>
        </p>
      </header>

      <section className="mt-9" aria-labelledby="how-to-play-nearo">
        <h3 id="how-to-play-nearo" className="text-base font-semibold">
          How to play Nearo
        </h3>
        <ol className="mt-4 list-decimal space-y-2.5 pl-5 text-sm leading-7 text-muted-foreground">
          {nearoHowToSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="mt-9" aria-labelledby="nearo-questions">
        <h3 id="nearo-questions" className="text-base font-semibold">
          Nearo questions
        </h3>
        <Accordion
          type="single"
          collapsible
          className="mt-4 rounded-lg border-border bg-background/80"
        >
          {nearoFaqs.map((item, index) => (
            <AccordionItem key={item.question} value={`nearo-faq-${index}`}>
              <AccordionTrigger className="px-4.5 py-4 text-sm font-semibold text-foreground hover:no-underline">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-7 text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </article>
  </section>
)
