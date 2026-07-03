import { useTrip } from '../context/tripContextCore'
import CopyButton from '../components/CopyButton'
import EmptyState from '../components/EmptyState'
import type { FaqItem } from '../types/trip'

function formatFaq(faq: FaqItem[], name: string): string {
  const lines = [`${name}: FAQ`, '']
  for (const item of faq) {
    lines.push(item.q, item.a, '')
  }
  return lines.join('\n').trim()
}

export default function Faq() {
  const trip = useTrip()
  const faq = trip.faq ?? []

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Family FAQ</h1>
        <p className="text-ink-soft">Quick answers for everyone joining the trip.</p>
      </header>

      {faq.length === 0 ? (
        <EmptyState icon="❓" title="No FAQ yet" body="Common questions will show up here." />
      ) : (
        <>
          <div className="flex justify-end">
            <CopyButton text={formatFaq(faq, trip.name)} label="Copy the FAQ" />
          </div>
          <ul className="space-y-3">
            {faq.map((item, i) => (
              <li key={i} className="bg-surface rounded-[8px] border border-rule p-5">
                <p className="font-semibold text-ink">{item.q}</p>
                <p className="mt-1 text-ink-soft leading-relaxed whitespace-pre-line">{item.a}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
