import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const tripsDir = path.resolve('src/data/trips')
const destinationPacksFile = path.resolve('src/utils/destinationPacks.ts')
const files = fs
  .readdirSync(tripsDir)
  .filter((file) => file.endsWith('.ts') && file !== 'index.ts')
  .map((file) => path.join(tripsDir, file))

const errors = []

function add(file, message) {
  errors.push(`${path.relative(process.cwd(), file)}: ${message}`)
}

function validUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function validPhone(value) {
  if (value === '911') return true
  // Validate by digit count rather than by leading character. The previous pattern was
  // /^\+?[0-9][0-9\s().-]{6,}$/, which required the first character after an optional "+" to be a
  // digit — so any parenthesised area code like "(843) 626-2273" failed and broke the build.
  // Counting digits is both correct for that case and stricter than the old pattern, which
  // accepted arbitrarily long runs such as "1234567890123456789".
  if (!/^[+0-9\s().-]+$/.test(value)) return false
  const digits = value.replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 15
}

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8')
  const ids = [...source.matchAll(/\bid:\s*'([^']+)'/g)].map((match) => match[1])
  const seen = new Set()
  for (const id of ids) {
    if (seen.has(id)) add(file, `duplicate id "${id}"`)
    seen.add(id)
  }

  const urls = [...source.matchAll(/https?:\/\/[^'"\s)]+/g)].map((match) => match[0])
  for (const url of urls) {
    if (!validUrl(url)) add(file, `invalid URL "${url}"`)
  }

  const phoneValues = [
    ...source.matchAll(/phone:\s*'([^']+)'/g),
    ...source.matchAll(/value:\s*'([^']+)'\s*,\s*kind:\s*'phone'/g),
  ].map((match) => match[1])

  for (const phone of phoneValues) {
    if (!validPhone(phone)) add(file, `invalid phone "${phone}"`)
  }
}

if (fs.existsSync(destinationPacksFile)) {
  const source = fs.readFileSync(destinationPacksFile, 'utf8')
  const ids = [...source.matchAll(/\bid:\s*'([^']+)'/g)].map((match) => match[1])
  const seen = new Set()
  for (const id of ids) {
    if (seen.has(id)) add(destinationPacksFile, `duplicate destination-pack id "${id}"`)
    seen.add(id)
  }

  const urls = [...source.matchAll(/https?:\/\/[^'"\s)]+/g)].map((match) => match[0])
  for (const url of urls) {
    if (!validUrl(url)) add(destinationPacksFile, `invalid destination-pack URL "${url}"`)
  }

  if (!/matchers:\s*\[[\s\S]*?\]/.test(source)) {
    add(destinationPacksFile, 'destination packs must include matcher text')
  }

  if (!/sourceUrls:\s*\[[\s\S]*?https?:\/\//.test(source)) {
    add(destinationPacksFile, 'destination packs must include source URLs')
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(`Validated ${files.length} trip data files and destination packs.`)
