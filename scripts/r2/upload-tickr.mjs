#!/usr/bin/env node

import { readFile, stat } from "node:fs/promises"
import { join, resolve } from "node:path"

const DEFAULT_BUCKET = "portlly-puzzles"
const DEFAULT_SOURCE_DIR = "dist/tickr"
const DEFAULT_PREFIX = "tickr"
const IMMUTABLE_CACHE_CONTROL = "public, max-age=31536000, immutable"
const MANIFEST_CACHE_CONTROL = "private, no-store"
const FILE_NAMES = ["easy.json", "medium.json", "hard.json", "manifest.json"]

const parseArgs = (argv) => {
  const options = {
    bucket: process.env.PORTLLY_R2_BUCKET ?? DEFAULT_BUCKET,
    sourceDir: process.env.PORTLLY_TICKR_DIST ?? DEFAULT_SOURCE_DIR,
    prefix: process.env.PORTLLY_R2_TICKR_PREFIX ?? DEFAULT_PREFIX,
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
    } else if (arg === "--prefix" && next) {
      options.prefix = next
      index += 1
    } else {
      throw new Error(`Unknown or incomplete option: ${arg}`)
    }
  }

  return options
}

const trimSlashes = (value) => value.replace(/^\/+|\/+$/g, "")

const getObjectMeta = (fileName, options) => {
  const prefix = trimSlashes(options.prefix)

  return {
    key: prefix ? `${prefix}/${fileName}` : fileName,
    cacheControl:
      fileName === "manifest.json"
        ? MANIFEST_CACHE_CONTROL
        : IMMUTABLE_CACHE_CONTROL,
  }
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
    const body = await readFile(join(options.sourceDir, fileName))

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
      "Remote upload requires CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY environment variables."
    )
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  })

  const upload = async (fileName) => {
    const { key, cacheControl } = getObjectMeta(fileName, options)
    const body = await readFile(join(options.sourceDir, fileName))

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

  for (const fileName of FILE_NAMES) {
    await stat(join(options.sourceDir, fileName))
  }

  const mode = options.local ? "local" : "remote"
  console.log(
    `Uploading ${FILE_NAMES.length} Tickr files to ${options.bucket} (${mode})...`
  )

  const { upload, cleanup } = options.local
    ? await createLocalUploader(options)
    : await createRemoteUploader(options)

  try {
    for (const fileName of FILE_NAMES) {
      await upload(fileName)
      console.log(`  ${fileName}`)
    }
    console.log(`Done - uploaded ${FILE_NAMES.length} Tickr artifact(s)`)
  } finally {
    await cleanup()
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
