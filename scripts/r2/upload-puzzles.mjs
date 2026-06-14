#!/usr/bin/env node

import { readFile, stat } from "node:fs/promises"
import { join, resolve } from "node:path"

const DEFAULT_BUCKET = "portlly-puzzles"
const DEFAULT_SOURCE_DIR = "dist/puzzles"
const DEFAULT_PUZZLE_PREFIX = "puzzles"
const DEFAULT_MANIFEST_PREFIX = "manifests"
const IMMUTABLE_CACHE_CONTROL = "public, max-age=31536000, immutable"
const MANIFEST_CACHE_CONTROL = "private, no-store"
const CONCURRENCY = 10

const parseArgs = (argv) => {
  const options = {
    bucket: process.env.PORTLLY_R2_BUCKET ?? DEFAULT_BUCKET,
    sourceDir: process.env.PORTLLY_PUZZLE_DIST ?? DEFAULT_SOURCE_DIR,
    puzzlePrefix: process.env.PORTLLY_R2_PUZZLE_PREFIX ?? DEFAULT_PUZZLE_PREFIX,
    manifestPrefix:
      process.env.PORTLLY_R2_MANIFEST_PREFIX ?? DEFAULT_MANIFEST_PREFIX,
    local: false,
    dryRun: false,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    const next = argv[index + 1]

    if (arg === "--local") {
      options.local = true
    } else if (arg === "--dry-run") {
      options.dryRun = true
    } else if (arg === "--bucket" && next) {
      options.bucket = next
      index += 1
    } else if (arg === "--source-dir" && next) {
      options.sourceDir = next
      index += 1
    } else if (arg === "--puzzle-prefix" && next) {
      options.puzzlePrefix = next
      index += 1
    } else if (arg === "--manifest-prefix" && next) {
      options.manifestPrefix = next
      index += 1
    } else {
      throw new Error(`Unknown or incomplete option: ${arg}`)
    }
  }

  return options
}

const trimSlashes = (value) => value.replace(/^\/+|\/+$/g, "")

const getObjectMeta = (fileName, options) => {
  const isManifest =
    fileName === "daily_manifest.json" || fileName === "puzzle_index.json"
  const prefix = isManifest
    ? trimSlashes(options.manifestPrefix)
    : trimSlashes(options.puzzlePrefix)

  return {
    key: prefix ? `${prefix}/${fileName}` : fileName,
    cacheControl: isManifest ? MANIFEST_CACHE_CONTROL : IMMUTABLE_CACHE_CONTROL,
  }
}

const parallelUpload = async (fileNames, uploadFn) => {
  const queue = [...fileNames]
  let completed = 0

  const worker = async () => {
    while (queue.length > 0) {
      const fileName = queue.shift()
      if (!fileName) break

      await uploadFn(fileName)

      completed += 1
      if (completed % 20 === 0 || completed === fileNames.length) {
        console.log(`  ${completed}/${fileNames.length}`)
      }
    }
  }

  const workers = Array.from(
    { length: Math.min(CONCURRENCY, fileNames.length) },
    () => worker()
  )
  await Promise.all(workers)
}

const createLocalUploader = async (options) => {
  const { Miniflare } = await import("miniflare")

  const mf = new Miniflare({
    modules: true,
    script: `export default { fetch() { return new Response("ok") } }`,
    r2Buckets: { BUCKET: options.bucket },
    r2Persist: resolve(".wrangler/state/v3/r2"),
  })

  const bucket = await mf.getR2Bucket("BUCKET")

  const upload = async (fileName) => {
    const { key, cacheControl } = getObjectMeta(fileName, options)
    const filePath = join(options.sourceDir, fileName)
    const body = await readFile(filePath)

    if (options.dryRun) {
      console.log(`[dry-run] ${key}`)
      return
    }

    await bucket.put(key, body, {
      httpMetadata: {
        contentType: "application/json; charset=utf-8",
        cacheControl,
      },
    })
  }

  const cleanup = () => mf.dispose()

  return { upload, cleanup }
}

const createRemoteUploader = async (options) => {
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3")

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Remote upload requires CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY environment variables.\n" +
        "Generate an R2 API token at: Cloudflare Dashboard → R2 → Manage R2 API Tokens"
    )
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  })

  const upload = async (fileName) => {
    const { key, cacheControl } = getObjectMeta(fileName, options)
    const filePath = join(options.sourceDir, fileName)
    const body = await readFile(filePath)

    if (options.dryRun) {
      console.log(`[dry-run] ${key}`)
      return
    }

    await client.send(
      new PutObjectCommand({
        Bucket: options.bucket,
        Key: key,
        Body: body,
        ContentType: "application/json; charset=utf-8",
        CacheControl: cacheControl,
      })
    )
  }

  const cleanup = () => client.destroy()

  return { upload, cleanup }
}

const main = async () => {
  const options = parseArgs(process.argv.slice(2))
  const sourceStats = await stat(options.sourceDir)

  if (!sourceStats.isDirectory()) {
    throw new Error(`${options.sourceDir} is not a directory`)
  }

  const puzzleIndex = JSON.parse(
    await readFile(join(options.sourceDir, "puzzle_index.json"), "utf8")
  )
  const indexedPuzzleFiles = puzzleIndex.puzzles?.map(
    (puzzle) => puzzle.fileName
  )

  if (!Array.isArray(indexedPuzzleFiles) || indexedPuzzleFiles.length === 0) {
    throw new Error(`No indexed puzzle files found in ${options.sourceDir}`)
  }

  const fileNames = [
    "daily_manifest.json",
    "puzzle_index.json",
    ...indexedPuzzleFiles,
  ].sort()

  const mode = options.local ? "local" : "remote"
  console.log(`Uploading ${fileNames.length} files to ${options.bucket} (${mode})…`)

  const { upload, cleanup } = options.local
    ? await createLocalUploader(options)
    : await createRemoteUploader(options)

  try {
    await parallelUpload(fileNames, upload)
    console.log(`Done — uploaded ${fileNames.length} artifact(s) to ${options.bucket}`)
  } finally {
    await cleanup()
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
