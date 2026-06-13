import { describe, expect, it } from "vitest"
import { normalizeGuess } from "./normalize"

describe("normalizeGuess", () => {
  it("lowercases and trims guesses", () => {
    expect(normalizeGuess("  WATER  ")).toBe("water")
  })

  it("strips accents after Unicode decomposition", () => {
    expect(normalizeGuess("  Café  ")).toBe("cafe")
    expect(normalizeGuess("Ångström")).toBe("angstrom")
  })
})
