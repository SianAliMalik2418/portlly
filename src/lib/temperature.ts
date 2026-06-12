const colors = [
  "oklch(0.70 0.12 250)",
  "oklch(0.72 0.12 220)",
  "oklch(0.78 0.12 190)",
  "oklch(0.84 0.13 130)",
  "oklch(0.86 0.15 95)",
  "oklch(0.80 0.16 60)",
  "oklch(0.66 0.20 35)",
]

export const getTemperatureColor = (temperature: number) =>
  colors[Math.min(colors.length - 1, Math.floor(Math.max(0, Math.min(1, temperature)) * colors.length))]
