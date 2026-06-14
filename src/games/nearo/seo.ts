export const nearoDefinition =
  "Nearo is a free daily word game where the answer is a hidden word. Players guess related words and use semantic similarity scores to move closer. A 100 percent score means the hidden word has been found. If you like Wordle but want a meaning-based challenge, Nearo is a free Wordle and Semantle alternative you can play in your browser."

export const nearoComparison =
  "Nearo, Wordle, and Semantle are all daily word games, but they test different skills. Wordle is about spelling and letter positions. Semantle and Nearo are about meaning: you guess related words and follow a semantic similarity score toward the hidden answer. Nearo adds a rank for close guesses and a recent archive, making it an approachable Semantle alternative that still runs free in any modern browser."

export const nearoHowToSteps = [
  "A starter word is pre-filled in the input to help you begin — press enter to submit it, or type your own.",
  "Use the similarity score to see how close that word is in meaning.",
  "Follow high-scoring related words, synonyms, and category clues.",
  "Keep narrowing your guesses until one reaches 100 percent.",
] as const

export const nearoFaqs = [
  {
    question: "How does Nearo scoring work?",
    answer:
      "Nearo compares each guess with the hidden answer by meaning, then returns a similarity score from 0 to 100 percent. Higher scores mean the guess is semantically closer to the answer, while low scores mean the word is farther away.",
  },
  {
    question: "What does a Nearo rank mean?",
    answer:
      "A rank appears when a guess is close enough to the hidden word. The rank shows how near that guess is among the closest possible words, giving players a stronger clue than the percentage score alone.",
  },
  {
    question: "Is Nearo the same as Wordle?",
    answer:
      "No. Wordle is based on spelling and letter positions, while Nearo is based on word meaning. In Nearo, a guess can be useful even if it shares no letters with the hidden answer.",
  },
  {
    question: "Is Nearo a good Semantle alternative?",
    answer:
      "Yes. Like Semantle, Nearo is a semantic word game where you guess the hidden word by meaning and follow a similarity score. Nearo adds a rank for close guesses and a recent puzzle archive, and it is free to play in any modern browser with no account.",
  },
  {
    question: "Can I replay older Nearo puzzles?",
    answer:
      "Yes. Nearo includes a recent archive so players can catch up on previous daily puzzles. Archive progress is saved locally in the browser, the same way the current daily puzzle is saved.",
  },
] as const
