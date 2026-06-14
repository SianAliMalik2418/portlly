export const nearoConfig = {
  id: "nearo",
  name: "Nearo",
  route: "/games/nearo",
  archiveRoute: "/games/nearo/archive",
  category: "word",
  glyph: "🎯",
  status: "live",
  description:
    "Guess the hidden word by meaning. Each try gets a similarity score and a rank when you are close.",
  meta: ["DAILY", "~4 MIN"],
  storagePrefix: "portlly:nearo",
  hintThreshold: 10,
  maxHints: 5,
} as const
