#!/usr/bin/env node

import { readFile, stat } from "node:fs/promises"
import { join } from "node:path"
import { spawn } from "node:child_process"

const DEFAULT_BUCKET = "portlly-puzzles"
const DEFAULT_SOURCE_DIR = "dist/puzzles"
const DEFAULT_PUZZLE_PREFIX = "puzzles"
const DEFAULT_MANIFEST_PREFIX = "manifests"
const IMMUTABLE_CACHE_CONTROL = "public, max-age=31536000, immutable"
const MANIFEST_CACHE_CONTROL = "private, no-store"

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

const getObjectKey = (fileName, options) => {
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

const run = (command, args, options) =>
  new Promise((resolve, reject) => {
    if (options.dryRun) {
      console.log([command, ...args].join(" "))
      resolve()
      return
    }

    const child = spawn(command, args, { stdio: "inherit" })
    child.on("error", reject)
    child.on("close", (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`${command} exited with code ${code}`))
      }
    })
  })

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

  for (const fileName of fileNames) {
    const { key, cacheControl } = getObjectKey(fileName, options)
    const objectPath = `${options.bucket}/${key}`
    const filePath = join(options.sourceDir, fileName)
    const args = [
      "wrangler",
      "r2",
      "object",
      "put",
      objectPath,
      "--file",
      filePath,
      "--content-type",
      "application/json; charset=utf-8",
      "--cache-control",
      cacheControl,
    ]

    if (options.local) {
      args.push("--local")
    } else {
      args.push("--remote")
    }

    await run("bunx", args, options)
  }

  console.log(
    `Uploaded ${fileNames.length} JSON artifact(s) to ${options.bucket}`
  )
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
