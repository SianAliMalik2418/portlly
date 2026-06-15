import { describe, expect, it } from "vitest"
import { getStatusMessage } from "./presentation"

describe("getStatusMessage", () => {
  it("shows a solved message for a perfect score", () => {
    expect(getStatusMessage(100)).toEqual({
      lead: "You found it!",
      sub: "That was the hidden word.",
    })
  })
})
