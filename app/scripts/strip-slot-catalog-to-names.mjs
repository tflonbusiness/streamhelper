/**
 * Strip slot.report-style catalog JSON to a plain array of slot names.
 * Trims whitespace, drops blanks, dedupes by case-insensitive name (first wins).
 *
 * Usage:
 *   node scripts/strip-slot-catalog-to-names.mjs
 *   node scripts/strip-slot-catalog-to-names.mjs --in src/assets/response.json --out public/slot-names.json
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const appRoot = resolve(scriptDir, '..')

function parseArgs(argv) {
  const options = {
    inPath: resolve(appRoot, 'src/assets/response.json'),
    outPath: resolve(appRoot, 'public/slot-names.json'),
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--in') {
      options.inPath = resolve(appRoot, argv[index + 1] ?? '')
      index += 1
      continue
    }
    if (arg === '--out') {
      options.outPath = resolve(appRoot, argv[index + 1] ?? '')
      index += 1
      continue
    }
    if (arg === '--help' || arg === '-h') {
      console.log(`strip-slot-catalog-to-names

Options:
  --in <path>   Input JSON (default: src/assets/response.json)
  --out <path>  Output JSON array of strings (default: public/slot-names.json)
`)
      process.exit(0)
    }
    throw new Error(`Unknown argument: ${arg}`)
  }

  return options
}

function loadCatalog(raw) {
  const data = JSON.parse(raw)
  if (Array.isArray(data)) {
    return data
  }
  if (data && Array.isArray(data.results)) {
    return data.results
  }
  throw new Error('Expected { results: [...] } or a top-level array')
}

function readName(entry, index) {
  if (typeof entry === 'string') {
    return entry
  }
  if (entry && typeof entry.name === 'string') {
    return entry.name
  }
  throw new Error(`Missing name at index ${index}`)
}

function normalizeNames(entries) {
  const seen = new Set()
  const names = []
  let blankSkipped = 0
  let duplicatesSkipped = 0
  let whitespaceTrimmed = 0

  entries.forEach((entry, index) => {
    const rawName = readName(entry, index)
    const name = rawName.trim()
    if (rawName !== name) {
      whitespaceTrimmed += 1
    }
    if (!name) {
      blankSkipped += 1
      return
    }

    const dedupeKey = name.toLowerCase()
    if (seen.has(dedupeKey)) {
      duplicatesSkipped += 1
      return
    }

    seen.add(dedupeKey)
    names.push(name)
  })

  return { names, blankSkipped, duplicatesSkipped, whitespaceTrimmed }
}

const options = parseArgs(process.argv.slice(2))
const raw = readFileSync(options.inPath, 'utf8')
const entries = loadCatalog(raw)
const { names, blankSkipped, duplicatesSkipped, whitespaceTrimmed } =
  normalizeNames(entries)

writeFileSync(options.outPath, `${JSON.stringify(names)}\n`, 'utf8')
const relativeOut = options.outPath.replace(`${appRoot}/`, '')
console.log(`Wrote ${names.length} names to ${relativeOut}`)
console.log(
  `  trimmed whitespace: ${whitespaceTrimmed}, duplicates removed: ${duplicatesSkipped}, blank skipped: ${blankSkipped}`,
)
