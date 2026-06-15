export const tickrConfig = {
  id: "tickr",
  name: "Tickr",
  route: "/games/tickr",
  category: "trivia",
  glyph: "⏱️",
  status: "live",
  description:
    "Answer rapid-fire trivia before the clock runs out. Correct answers buy time; misses burn it.",
  meta: ["TRIVIA", "SURVIVAL", "SOLO"],
  storagePrefix: "portlly:tickr",
  timerPresets: [30, 60, 90],
  correctTimeBonus: 5,
  wrongTimePenalty: 8,
  difficultyThresholds: {
    medium: 6,
    hard: 16,
  },
  answerReviewDelayMs: 0,
} as const
