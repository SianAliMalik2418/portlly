export const normalizeGuess = (rawGuess: string) => {
  const trimmed = rawGuess.trim().toLowerCase()
  const decomposed = trimmed.normalize("NFKD")

  return decomposed.replace(/\p{Diacritic}/gu, "")
}
