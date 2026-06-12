export type GameCategory = "word" | "trivia" | "draw" | "party"

export type Game = {
  id: string
  category: GameCategory
  name: string
  glyph: string
  status: "live" | "soon"
  href?: string
  description: string
  meta: Array<string>
}

export const games: Array<Game> = [
  {
    id: "closer",
    category: "word",
    name: "Closer",
    glyph: "🎯",
    status: "live",
    href: "/games/semantic-guess",
    description:
      "Guess the secret word, but by meaning, not spelling. Every guess tells you how hot or cold you are. Today's word has stumped thousands.",
    meta: ["DAILY", "1-2 PLAYERS", "~4 MIN"],
  },
  {
    id: "snap-trivia",
    category: "trivia",
    name: "Snap Trivia",
    glyph: "⚡",
    status: "soon",
    description: "Answer fast or get knocked out. Last one standing wins.",
    meta: ["PARTY", "2-8 PLAYERS"],
  },
  {
    id: "scrawl",
    category: "draw",
    name: "Scrawl",
    glyph: "✏️",
    status: "soon",
    description: "Doodle it, guess it. The chaos of a group chat, as a game.",
    meta: ["PARTY", "3-10 PLAYERS"],
  },
  {
    id: "chain",
    category: "word",
    name: "Chain",
    glyph: "🔗",
    status: "soon",
    description:
      "Link words by a hidden rule. Find the thread, beat the clock.",
    meta: ["DAILY", "SOLO"],
  },
  {
    id: "bluff",
    category: "party",
    name: "Bluff",
    glyph: "🃏",
    status: "soon",
    description:
      "One of you is lying. Sniff out the faker before the round ends.",
    meta: ["PARTY", "4-12 PLAYERS"],
  },
  {
    id: "higher-lower",
    category: "trivia",
    name: "Higher / Lower",
    glyph: "🧠",
    status: "soon",
    description: "Pure gut instinct. Guess what's more, endlessly.",
    meta: ["ENDLESS", "SOLO"],
  },
]

export const gameFilters = ["all", "word", "trivia", "draw", "party"] as const

export type GameFilter = (typeof gameFilters)[number]

export const demoGuesses = [
  { word: "planet", temperature: 0.94 },
  { word: "orbit", temperature: 0.68 },
  { word: "cloud", temperature: 0.41 },
] as const

export const floatingWords = [
  { word: "river", temperature: 0.6, x: 15, y: 25, rotation: -7, delay: 0 },
  { word: "galaxy", temperature: 0.9, x: 72, y: 22, rotation: 5, delay: 0.5 },
  { word: "ladder", temperature: 0.4, x: 9, y: 58, rotation: -6, delay: 1 },
  { word: "copper", temperature: 0.3, x: 83, y: 56, rotation: 7, delay: 1.5 },
  { word: "whisper", temperature: 0.5, x: 18, y: 78, rotation: -7, delay: 2 },
  { word: "ember", temperature: 0.7, x: 74, y: 82, rotation: 7, delay: 2.5 },
] as const

export const footerLinks = [
  { label: "Closer", href: "/games/semantic-guess" },
  { label: "All games", href: "#catalog" },
] as const
