import { env } from "cloudflare:workers"

type DailyManifest = {
  version: number
  launchDate: string
  scheduleSeed: number
  dates: Record<string, string>
}

type PuzzleIndex = {
  version: number
  puzzles: Array<{
    puzzleId: string
    fileName: string
    answerHash: string
  }>
}

const MANIFEST_PREFIX = "manifests"
const PUZZLE_PREFIX = "puzzles"
const PUZZLE_FILE_RE = /^[a-f0-9]{32}\.json$/
const PUZZLE_CACHE_CONTROL = "public, max-age=31536000, immutable"

export const getUtcDateId = (date = new Date()) =>
  date.toISOString().slice(0, 10)

const getSecondsUntilNextUtcDay = (date = new Date()) => {
  const nextUtcDay = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() + 1
  )

  return Math.max(0, Math.floor((nextUtcDay - date.getTime()) / 1000))
}

const getTodayCacheControl = (date = new Date()) => {
  const maxAge = Math.min(getSecondsUntilNextUtcDay(date), 5 * 60)

  return `public, max-age=${maxAge}`
}

const getPuzzleBucket = () => env.PUZZLE_BUCKET

const readJsonObject = async <T>(key: string): Promise<T> => {
  const object = await getPuzzleBucket().get(key)

  if (!object) {
    throw new Response(`Missing R2 object: ${key}`, { status: 500 })
  }

  return object.json<T>()
}

const getDailyManifest = () =>
  readJsonObject<DailyManifest>(`${MANIFEST_PREFIX}/daily_manifest.json`)

const getPuzzleIndex = () =>
  readJsonObject<PuzzleIndex>(`${MANIFEST_PREFIX}/puzzle_index.json`)

export const streamPuzzleFile = async (fileName: string) => {
  if (!PUZZLE_FILE_RE.test(fileName)) {
    return new Response("Not found", { status: 404 })
  }

  const object = await getPuzzleBucket().get(`${PUZZLE_PREFIX}/${fileName}`)

  if (!object) {
    return new Response("Not found", { status: 404 })
  }

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set("Content-Type", "application/json; charset=utf-8")
  headers.set("Cache-Control", PUZZLE_CACHE_CONTROL)
  headers.set("ETag", object.httpEtag)

  return new Response(object.body, { headers })
}

export const redirectToTodaysPuzzle = async (
  request: Request,
  date = new Date()
) => {
  const dateId = getUtcDateId(date)
  const [manifest, puzzleIndex] = await Promise.all([
    getDailyManifest(),
    getPuzzleIndex(),
  ])
  const puzzleId = manifest.dates[dateId]

  if (!puzzleId) {
    return Response.json(
      { error: `No puzzle is scheduled for ${dateId}` },
      { status: 404 }
    )
  }

  const puzzleRecord = puzzleIndex.puzzles.find(
    (puzzle) => puzzle.puzzleId === puzzleId
  )

  if (!puzzleRecord || !PUZZLE_FILE_RE.test(puzzleRecord.fileName)) {
    return Response.json(
      { error: `No puzzle file is indexed for ${puzzleId}` },
      { status: 500 }
    )
  }

  const url = new URL(`/puzzles/${puzzleRecord.fileName}`, request.url)

  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
      "Cache-Control": getTodayCacheControl(date),
      "X-Puzzle-Id": puzzleId,
    },
  })
}
