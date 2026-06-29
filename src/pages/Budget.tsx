import { useTrip } from '../context/tripContextCore'
import Section from '../components/Section'
import EmptyState from '../components/EmptyState'
import {
  budgetAmount,
  formatBudget,
  formatBudgetAmount,
  formatBudgetShare,
  formatMoney,
  formatSplitCount,
  isBudgetTbd,
} from '../utils/formatters'

export default function Budget() {
  const trip = useTrip()
  const items = trip.budget
  const currency = trip.currency

  const grandTotal = items.reduce((s, i) => s + budgetAmount(i), 0)
  const hasTbd = items.some(isBudgetTbd)
  const hasEstimate = items.some((item) => item.status === 'estimate')
  const hasKnownItems = items.some((item) => !isBudgetTbd(item))

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Budget</h1>
        <p className="text-ink-soft">Tracked shared expenses, read-only.</p>
        <p className="text-sm text-ink-soft">
          Splits can vary by line item, so each cost shows its own share math.
        </p>
      </header>

      <div className="rounded-[8px] bg-ink text-paper p-6 text-center">
        <p className="text-held text-sm font-mono uppercase tracking-[0.1em]">
          {hasEstimate ? 'Tracked total incl. estimates' : 'Tracked group total'}
        </p>
        <p className="text-4xl font-bold mt-1">
          {hasKnownItems ? formatMoney(grandTotal, currency) : 'TBD'}
        </p>
        {hasTbd && (
          <p className="text-held text-sm mt-1">
            {hasKnownItems ? 'Some line items are still TBD.' : 'Line items are still TBD.'}
          </p>
        )}
        {hasEstimate && (
          <p className="text-held text-sm mt-1">
            Confirmed costs and estimates are shown together below.
          </p>
        )}
      </div>

      <Section
        title="Breakdown"
        icon="💰"
        copyText={items.length ? formatBudget(items, currency) : undefined}
        copyLabel="Copy full budget"
      >
        {items.length === 0 && (
          <EmptyState icon="💰" title="Budget TBD" body="Line items and per-share splits will appear here as they’re set." />
        )}
        <ul className="divide-y divide-rule">
          {items.map((b) => {
            const tbd = isBudgetTbd(b)
            return (
              <li key={b.id} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-ink">{b.name}</p>
                  <p className="text-sm text-ink-soft">
                    {tbd ? 'Optional / TBD' : `Split ${formatSplitCount(b.splitCount)}`}
                  </p>
                  {b.notes && <p className="text-sm text-ink-soft mt-1">{b.notes}</p>}
                </div>
                <div className="text-right">
                  <p className="font-semibold text-ink">{formatBudgetAmount(b, currency)}</p>
                  <p className="text-sm text-ink-soft">{formatBudgetShare(b, currency)}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </Section>
    </div>
  )
}
