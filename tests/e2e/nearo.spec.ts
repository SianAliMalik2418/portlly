import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"

const goToGame = async (page: Page) => {
  await page.goto("/games/nearo")
  await expect(page.getByRole("textbox", { name: "Guess word" })).toBeVisible({
    timeout: 15_000,
  })
}

const submitGuess = async (page: Page, word: string) => {
  const input = page.getByRole("textbox", { name: "Guess word" })

  await input.fill(word)
  await input.press("Enter")
}

const guessHistory = (page: Page) => page.getByLabel("Guess history")

test.beforeEach(async ({ page }) => {
  await page.goto("/")
  await page.evaluate(() => {
    localStorage.clear()
  })
  await page.goto("about:blank")
})

test("hub renders and navigates to Nearo", async ({ page }) => {
  await page.goto("/")

  await expect(page.getByRole("heading", { name: /tiny games/i })).toBeVisible()
  await expect(page.getByRole("link", { name: /play nearo/i })).toBeVisible()

  await page.getByRole("link", { name: /play today's game/i }).click()

  await expect(page).toHaveURL(/\/games\/nearo$/)
  await expect(page.getByRole("textbox", { name: "Guess word" })).toBeVisible({
    timeout: 15_000,
  })
})

test("valid, unknown, and duplicate guesses are handled", async ({ page }) => {
  await goToGame(page)

  await submitGuess(page, "boat")

  await expect(guessHistory(page).getByText("boat")).toBeVisible()
  await expect(guessHistory(page).getByText("#3")).toBeVisible()
  await expect(guessHistory(page).getByText("92%")).toBeVisible()

  await submitGuess(page, "notaword")

  await expect(
    page.getByText('"notaword" is not in our word list')
  ).toBeVisible()
  await expect(guessHistory(page).getByText("notaword")).toHaveCount(0)

  await submitGuess(page, "BOAT")

  await expect(page.getByText('Already tried "boat"')).toBeVisible()
  await expect(guessHistory(page).getByText("boat")).toHaveCount(1)
})

test("guesses persist after refresh", async ({ page }) => {
  await goToGame(page)

  await submitGuess(page, "boat")
  await expect(guessHistory(page).getByText("boat")).toBeVisible()

  await page.reload()

  await expect(page.getByRole("textbox", { name: "Guess word" })).toBeVisible()
  await expect(guessHistory(page).getByText("boat")).toBeVisible()
  await expect(guessHistory(page).getByText("#3")).toBeVisible()
})

test("answer guess opens solved state and persists it", async ({ page }) => {
  await goToGame(page)

  await submitGuess(page, "water")

  await expect(
    page.getByRole("heading", { name: /You found/i })
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Play previous words" })
  ).toBeVisible()

  await page.reload()

  await expect(
    page.getByRole("heading", { name: /You found/i })
  ).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Play previous words" })
  ).toBeVisible()
})

test("catch-up dates keep separate local progress", async ({ page }) => {
  await goToGame(page)

  await expect(
    page.getByLabel("Recent puzzles").getByText("Today")
  ).toBeVisible()

  await submitGuess(page, "boat")
  await expect(guessHistory(page).getByText("boat")).toBeVisible()

  await page.goto("/games/nearo/archive/2026-06-08")
  await expect(page.getByRole("textbox", { name: "Guess word" })).toBeVisible({
    timeout: 15_000,
  })
  await expect(page.getByText("Make your first guess.")).toBeVisible()
  await expect(page.getByText("boat")).toHaveCount(0)

  await submitGuess(page, "water")
  await expect(guessHistory(page).getByText("water")).toBeVisible()

  await page.reload()

  await expect(page.getByRole("textbox", { name: "Guess word" })).toBeVisible()
  await expect(guessHistory(page).getByText("water")).toBeVisible()

  await page.goto("/games/nearo")
  await expect(page.getByRole("textbox", { name: "Guess word" })).toBeVisible()
  await expect(guessHistory(page).getByText("boat")).toBeVisible()
  await expect(guessHistory(page).getByText("water")).toHaveCount(0)
})

test("empty input submission does nothing", async ({ page }) => {
  await goToGame(page)

  const input = page.getByRole("textbox", { name: "Guess word" })
  await input.press("Enter")

  await expect(page.getByLabel("Guess history")).not.toBeVisible()
})

test("submit button works same as Enter key", async ({ page }) => {
  await goToGame(page)

  const input = page.getByRole("textbox", { name: "Guess word" })
  await input.fill("boat")
  await page.getByRole("button", { name: "Submit guess" }).click()

  await expect(guessHistory(page).getByText("boat")).toBeVisible()
  await expect(guessHistory(page).getByText("92%")).toBeVisible()
})

test("input is disabled after solving", async ({ page }) => {
  await goToGame(page)

  await submitGuess(page, "water")

  await expect(
    page.getByRole("heading", { name: /You found/i })
  ).toBeVisible()

  const input = page.getByRole("textbox", { name: "Guess word" })
  await expect(input).toBeDisabled()
  await expect(input).toHaveAttribute("placeholder", "Solved")
})

test("play again resets all game state", async ({ page }) => {
  await goToGame(page)

  await submitGuess(page, "water")
  await expect(
    page.getByRole("heading", { name: /You found/i })
  ).toBeVisible()

  await page.getByRole("button", { name: "Play again" }).click()

  await expect(
    page.getByRole("heading", { name: /You found/i })
  ).not.toBeVisible()
  await expect(page.getByRole("textbox", { name: "Guess word" })).toBeEnabled()
  await expect(page.getByText("Make your first guess.")).toBeVisible()
})

test("win view shows guess count and secret word", async ({ page }) => {
  await goToGame(page)

  await submitGuess(page, "boat")
  await submitGuess(page, "water")

  await expect(
    page.getByRole("heading", { name: /You found/i })
  ).toBeVisible()
  await expect(page.getByText("2")).toBeVisible()
  await expect(page.getByText("water")).toBeVisible()
  await expect(page.getByText("GUESSES")).toBeVisible()
  await expect(page.getByText("SECRET WORD")).toBeVisible()
})

test("win view countdown timer is displayed", async ({ page }) => {
  await goToGame(page)

  await submitGuess(page, "water")
  await expect(
    page.getByRole("heading", { name: /You found/i })
  ).toBeVisible()

  await expect(page.getByText("Next puzzle")).toBeVisible()
  await expect(page.getByText(/\d{2}:\d{2}:\d{2}/)).toBeVisible()
})

test("win view archive list toggles", async ({ page }) => {
  await goToGame(page)

  await submitGuess(page, "water")
  await expect(
    page.getByRole("heading", { name: /You found/i })
  ).toBeVisible()

  await page.getByRole("button", { name: "Play previous words" }).click()
  await expect(
    page.getByRole("button", { name: "Hide previous words" })
  ).toBeVisible()

  await page.getByRole("button", { name: "Hide previous words" }).click()
  await expect(
    page.getByRole("button", { name: "Play previous words" })
  ).toBeVisible()
})

test("hint button disabled before earning hints", async ({ page }) => {
  await goToGame(page)

  const hintBtn = page.getByRole("button", { name: /Get a hint/ })
  await expect(hintBtn).toBeVisible()
  await expect(hintBtn).toHaveText(/5 left/)

  await hintBtn.click()
  await expect(page.getByText(/Available in \d+ more guesses?/)).toBeVisible()
})

test("hint unlocks after 10 guesses and reveals a word", async ({ page }) => {
  await goToGame(page)

  const words = [
    "boat",
    "fish",
    "tree",
    "bird",
    "rock",
    "sand",
    "wind",
    "fire",
    "moon",
    "star",
  ]

  for (const word of words) {
    await submitGuess(page, word)
    await expect(guessHistory(page).getByText(word)).toBeVisible()
  }

  const hintBtn = page.getByRole("button", { name: /Get a hint/ })
  await hintBtn.click()

  await expect(hintBtn).toHaveText(/4 left/)

  const historyItems = guessHistory(page).locator("> div")
  await expect(historyItems).toHaveCount(11)
})

test("hint count persists after refresh", async ({ page }) => {
  await goToGame(page)

  const words = [
    "boat",
    "fish",
    "tree",
    "bird",
    "rock",
    "sand",
    "wind",
    "fire",
    "moon",
    "star",
  ]

  for (const word of words) {
    await submitGuess(page, word)
    await expect(guessHistory(page).getByText(word)).toBeVisible()
  }

  const hintBtn = page.getByRole("button", { name: /Get a hint/ })
  await hintBtn.click()
  await expect(hintBtn).toHaveText(/4 left/)

  await page.reload()
  await expect(page.getByRole("textbox", { name: "Guess word" })).toBeVisible()

  await expect(
    page.getByRole("button", { name: /Get a hint/ })
  ).toHaveText(/4 left/)
})

test("status message updates as score improves", async ({ page }) => {
  await goToGame(page)

  await expect(page.getByText("Make your first guess.")).toBeVisible()

  await submitGuess(page, "boat")

  await expect(page.getByText("Make your first guess.")).not.toBeVisible()
  await expect(page.getByText(/Best guess:.*boat/)).toBeVisible()
})

test("guesses sorted by score descending", async ({ page }) => {
  await goToGame(page)

  await submitGuess(page, "boat")
  await expect(guessHistory(page).getByText("boat")).toBeVisible()

  await submitGuess(page, "sand")
  await expect(guessHistory(page).getByText("sand")).toBeVisible()

  const guessRows = guessHistory(page).locator("> div")
  const count = await guessRows.count()
  expect(count).toBeGreaterThanOrEqual(2)

  const scores: number[] = []
  for (let i = 0; i < count; i++) {
    const text = await guessRows.nth(i).textContent()
    const match = text?.match(/(\d+)%/)
    if (match) scores.push(Number(match[1]))
  }
  for (let i = 0; i < scores.length - 1; i++) {
    expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1])
  }
})

test("archive win label shows date-specific message", async ({ page }) => {
  await page.goto("/games/nearo/archive/2026-06-08")
  await expect(page.getByRole("textbox", { name: "Guess word" })).toBeVisible({
    timeout: 15_000,
  })

  await submitGuess(page, "water")

  await expect(
    page.getByRole("heading", { name: /You found the word for Jun 8/i })
  ).toBeVisible()
})
