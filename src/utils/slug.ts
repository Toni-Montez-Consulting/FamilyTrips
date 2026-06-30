export function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'section'
  )
}

// Fail Loud: deterministic, collision-suffixed ids for a list of category names.
// Two categories that slugify to the same base get distinct, stable ids
// (`prep-x`, `prep-x-2`, ...) so anchor/jump targets never silently collide.
export function categorySlugs(categories: string[]): Map<string, string> {
  const out = new Map<string, string>()
  const seen = new Map<string, number>()
  for (const cat of categories) {
    const base = `prep-${slugify(cat)}`
    const n = seen.get(base) ?? 0
    seen.set(base, n + 1)
    out.set(cat, n === 0 ? base : `${base}-${n + 1}`)
  }
  return out
}
