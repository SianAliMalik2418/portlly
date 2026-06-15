export const tickrDefinition =
  "Tickr is a free survival trivia game where players answer General Knowledge questions against a ticking clock. Correct answers add time, wrong answers subtract time, and the run ends when the timer reaches zero."

export const tickrHowToSteps = [
  "Choose a timer preset on the start screen.",
  "Answer each four-option General Knowledge trivia question as quickly as possible.",
  "Use correct answers to regain time while avoiding wrong answers that subtract time.",
  "Survive as long as possible and beat your personal best for that timer preset.",
] as const

export const tickrFaqs = [
  {
    question: "How do you play Tickr?",
    answer:
      "Choose a timer preset, then answer four-option General Knowledge trivia questions before the clock runs out. Correct answers add time and wrong answers subtract time.",
  },
  {
    question: "What is the score in Tickr?",
    answer:
      "The headline score is the number of correct answers in a run. Tickr also shows time survived, best streak, and the saved personal best for the selected timer preset.",
  },
  {
    question: "Does Tickr use live trivia API calls during play?",
    answer:
      "No. Tickr uses static General Knowledge question buckets generated offline and served from R2, so gameplay never waits on OpenTDB or another live trivia API.",
  },
  {
    question: "Are Tickr best scores saved?",
    answer:
      "Yes. Personal best scores are saved locally in the browser per timer preset. No account or server leaderboard is required.",
  },
] as const
