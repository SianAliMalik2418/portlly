import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"

const answersByQuestion = new Map([
  ["How many days are there in a leap year?", "366"],
  ["What color do you get when you mix blue and yellow paint?", "Green"],
  ["Which common object is used to tell time?", "Clock"],
  [
    "What is the name of the international distress signal made of three letters?",
    "SOS",
  ],
  [
    "Which board game uses hotels and houses as purchasable pieces?",
    "Monopoly",
  ],
  [
    "What is the term for a word that reads the same backward and forward?",
    "Palindrome",
  ],
])

const wrongAnswersByQuestion = new Map([
  ["How many days are there in a leap year?", "364"],
  ["What color do you get when you mix blue and yellow paint?", "Purple"],
  ["Which common object is used to tell time?", "Compass"],
  [
    "What is the name of the international distress signal made of three letters?",
    "MAY",
  ],
  ["Which board game uses hotels and houses as purchasable pieces?", "Clue"],
  [
    "What is the term for a word that reads the same backward and forward?",
    "Acronym",
  ],
])

const goToTickr = async (page: Page) => {
  await page.goto("/games/tickr")
  await expect(page.getByRole("heading", { name: "Tickr" })).toBeVisible()
  await expect(page.getByText(/easy questions ready/i)).toBeVisible({
    timeout: 15_000,
  })
}

const currentQuestionText = async (page: Page) => {
  const text = await page.locator("section h2").textContent()
  if (!text) throw new Error("Tickr question text was missing")
  return text.trim()
}

const answerCurrentQuestionCorrectly = async (page: Page) => {
  const question = await currentQuestionText(page)
  const answer = answersByQuestion.get(question)
  if (!answer) throw new Error(`No smoke answer mapped for: ${question}`)

  await page.getByRole("button", { name: answer }).click()
}

const answerCurrentQuestionWrong = async (page: Page) => {
  const question = await currentQuestionText(page)
  const wrong = wrongAnswersByQuestion.get(question)
  if (!wrong) throw new Error(`No wrong answer available for: ${question}`)

  await page.getByRole("button", { name: wrong }).click()
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Math.random = () => 0
  })
  await page.goto("/")
  await page.evaluate(() => {
    localStorage.clear()
  })
  await page.goto("about:blank")
})

test("plays correct and wrong answers through a completed run", async ({
  page,
}) => {
  await goToTickr(page)

  await page.getByRole("button", { name: "30 sec" }).click()
  await page.getByRole("button", { name: "Start" }).click()
  await expect(page.getByText("Question 1")).toBeVisible()

  await answerCurrentQuestionCorrectly(page)
  await expect(page.getByText("Correct").locator("..")).toContainText("1")

  for (let index = 0; index < 4; index += 1) {
    await answerCurrentQuestionWrong(page)
  }

  await expect(page.getByText("New best")).toBeVisible()
  await expect(page.getByText("correct answers")).toBeVisible()
  await expect(page.getByText("best")).toBeVisible()
})

test("persists a personal best per timer preset", async ({ page }) => {
  await goToTickr(page)

  await page.getByRole("button", { name: "30 sec" }).click()
  await page.getByRole("button", { name: "Start" }).click()
  await answerCurrentQuestionCorrectly(page)
  for (let index = 0; index < 4; index += 1) {
    await answerCurrentQuestionWrong(page)
  }

  await expect(page.getByText("New best")).toBeVisible()
  await page.getByRole("button", { name: "Change clock" }).click()

  await expect(page.getByText("Best: 1 correct")).toBeVisible()
  await page.getByRole("button", { name: "60 sec" }).click()
  await expect(page.getByText("No best yet")).toBeVisible()
})
