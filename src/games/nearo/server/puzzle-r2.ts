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
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const PUZZLE_CACHE_CONTROL = "public, max-age=31536000, immutable"
const ARCHIVE_DAY_COUNT = 7

export const getUtcDateId = (date = new Date()) =>
  date.toISOString().slice(0, 10)

const addUtcDays = (date: Date, days: number) =>
  new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + days
    )
  )

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

const getPuzzleRecord = (puzzleIndex: PuzzleIndex, puzzleId: string) => {
  const puzzleRecord = puzzleIndex.puzzles.find(
    (puzzle) => puzzle.puzzleId === puzzleId
  )

  if (!puzzleRecord || !PUZZLE_FILE_RE.test(puzzleRecord.fileName)) {
    return Response.json(
      { error: `No puzzle file is indexed for ${puzzleId}` },
      { status: 500 }
    )
  }

  return puzzleRecord
}

const getDatedPuzzleRecord = async (dateId: string, now = new Date()) => {
  if (!DATE_RE.test(dateId)) {
    return {
      response: Response.json(
        { error: "Invalid puzzle date" },
        { status: 400 }
      ),
      puzzleRecord: null,
    }
  }

  const todayId = getUtcDateId(now)

  if (dateId > todayId) {
    return {
      response: Response.json(
        { error: `Puzzle ${dateId} is not available yet` },
        { status: 404 }
      ),
      puzzleRecord: null,
    }
  }

  const [manifest, puzzleIndex] = await Promise.all([
    getDailyManifest(),
    getPuzzleIndex(),
  ])
  const puzzleId = manifest.dates[dateId]

  if (!puzzleId) {
    return {
      response: Response.json(
        { error: `No puzzle is scheduled for ${dateId}` },
        { status: 404 }
      ),
      puzzleRecord: null,
    }
  }

  const puzzleRecord = getPuzzleRecord(puzzleIndex, puzzleId)

  if (puzzleRecord instanceof Response) {
    return { response: puzzleRecord, puzzleRecord: null }
  }

  return { response: null, puzzleRecord }
}

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

export const redirectToPuzzleDate = async (
  request: Request,
  dateId: string,
  now = new Date()
) => {
  const { response, puzzleRecord } = await getDatedPuzzleRecord(dateId, now)

  if (response) return response

  const url = new URL(`/puzzles/${puzzleRecord.fileName}`, request.url)
  const isToday = dateId === getUtcDateId(now)

  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
      "Cache-Control": isToday
        ? getTodayCacheControl(now)
        : "public, max-age=300",
      "X-Puzzle-Id": puzzleRecord.puzzleId,
      "X-Puzzle-Date": dateId,
    },
  })
}

export const redirectToTodaysPuzzle = async (
  request: Request,
  date = new Date()
) => redirectToPuzzleDate(request, getUtcDateId(date), date)

export const getArchiveDays = async (now = new Date()) => {
  const todayId = getUtcDateId(now)
  const manifest = await getDailyManifest()
  const days = Array.from({ length: ARCHIVE_DAY_COUNT }, (_, offset) => {
    const dateId = getUtcDateId(addUtcDays(now, -offset))
    const puzzleId = manifest.dates[dateId]

    if (!puzzleId) return null

    return {
      date: dateId,
      puzzleId,
      isToday: dateId === todayId,
    }
  }).filter(
    (day): day is { date: string; puzzleId: string; isToday: boolean } =>
      Boolean(day)
  )

  return Response.json(
    { days },
    {
      headers: {
        "Cache-Control": getTodayCacheControl(now),
      },
    }
  )
}
