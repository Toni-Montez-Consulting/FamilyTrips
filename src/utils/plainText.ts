// Normalize fancy punctuation to plain ASCII for anything that leaves the app
// outbound (copied into a group chat, text, or post). The on-screen display can
// keep typographic dashes/quotes; only what gets *sent* is normalized, so a
// pasted message never reads as auto-generated.
export function toPlainText(s: string): string {
  return s
    .replace(/\s*—\s*/g, ' - ') // em dash (usually spaced) -> spaced hyphen
    .replace(/–/g, '-') // en dash (ranges like 4-7) -> hyphen
    .replace(/\s*·\s*/g, ', ') // middot separators -> comma
    .replace(/…/g, '...') // ellipsis
    .replace(/[‘’]/g, "'") // smart single quotes
    .replace(/[“”]/g, '"') // smart double quotes
    .replace(new RegExp(String.fromCharCode(160), 'g'), ' ') // non-breaking space -> normal space
}
