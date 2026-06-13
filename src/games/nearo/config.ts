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
  meta: ["DAILY", "1-2 PLAYERS", "~4 MIN"],
  storagePrefix: "portlly:nearo",
} as const
