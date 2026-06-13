import { describe, expect, it } from "vitest"
import { hashGuess, sha256Hex } from "./hash"

describe("sha256Hex", () => {
  it("matches standard SHA-256 test vectors", () => {
    expect(sha256Hex("")).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    )
    expect(sha256Hex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    )
  })

  it("matches the Python preprocessing hash for a smoke puzzle answer", () => {
    expect(hashGuess(" WÁTER ")).toBe(
      "0f4168490e38b8447e11ba4bd656aa11b925bd22af30bac464bc153fdb608501"
    )
  })
})
