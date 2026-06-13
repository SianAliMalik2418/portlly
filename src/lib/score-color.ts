const scoreColors = [
  "oklch(0.58 0.22 25)",
  "oklch(0.65 0.20 28)",
  "oklch(0.70 0.14 260)",
  "oklch(0.72 0.12 250)",
  "oklch(0.75 0.10 240)",
  "oklch(0.75 0.16 155)",
  "oklch(0.80 0.19 145)",
]

export const getScoreColor = (score: number) =>
  scoreColors[
    Math.min(
      scoreColors.length - 1,
      Math.floor(Math.max(0, Math.min(1, score)) * scoreColors.length)
    )
  ]
