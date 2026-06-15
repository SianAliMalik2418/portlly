import { env } from "cloudflare:workers"
import { tickrDifficulties, type TickrDifficulty } from "../types"
const TICKR_PREFIX = "tickr"
const QUESTION_CACHE_CONTROL = "public, max-age=31536000, immutable"

const getQuestionBucket = () => env.PUZZLE_BUCKET

const isTickrDifficulty = (value: string): value is TickrDifficulty =>
  tickrDifficulties.includes(value as TickrDifficulty)

export const streamQuestionBucket = async (difficulty: string) => {
  if (!isTickrDifficulty(difficulty)) {
    return Response.json({ error: "Invalid Tickr difficulty" }, { status: 400 })
  }

  const object = await getQuestionBucket().get(
    `${TICKR_PREFIX}/${difficulty}.json`
  )

  if (!object) {
    return Response.json(
      { error: `Missing Tickr ${difficulty} question bucket` },
      { status: 404 }
    )
  }

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set("Content-Type", "application/json; charset=utf-8")
  headers.set("Cache-Control", QUESTION_CACHE_CONTROL)
  headers.set("ETag", object.httpEtag)

  return new Response(object.body, { headers })
}
