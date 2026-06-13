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
  await expect(guessHistory(page).getByText("Very close!")).toBeVisible()

  await submitGuess(page, "notaword")

  await expect(page.getByRole("status")).toContainText(
    '"notaword" is not in our word list'
  )
  await expect(guessHistory(page).getByText("notaword")).toHaveCount(0)

  await submitGuess(page, "BOAT")

  await expect(page.getByRole("status")).toContainText('already tried "boat"')
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

  await submitGuess(page, "river")

  await expect(
    page.getByRole("heading", { name: "You found it!" })
  ).toBeVisible()
  await expect(page.getByRole("button", { name: "Share result" })).toBeVisible()

  await page.reload()

  await expect(
    page.getByRole("heading", { name: "You found it!" })
  ).toBeVisible()
  await expect(page.getByRole("button", { name: "Share result" })).toBeVisible()
})
