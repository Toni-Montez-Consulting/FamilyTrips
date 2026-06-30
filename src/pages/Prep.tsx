import { useSearchParams } from 'react-router-dom'
import { ChecklistView } from './Checklist'
import { PackingView } from './Packing'

type Segment = 'todo' | 'pack'

const SEGMENTS: { id: Segment; label: string }[] = [
  { id: 'todo', label: 'To-do' },
  { id: 'pack', label: 'To-pack' },
]

export default function Prep() {
  const [searchParams, setSearchParams] = useSearchParams()
  const raw = searchParams.get('list')
  const active: Segment = raw === 'pack' ? 'pack' : 'todo'

  function select(segment: Segment) {
    const next = new URLSearchParams(searchParams)
    next.set('list', segment)
    setSearchParams(next, { replace: true })
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-bold">Prep</h1>
        <p className="text-ink-soft">To-do list and packing, in one place.</p>
      </header>

      <div
        role="tablist"
        aria-label="Prep view"
        className="inline-flex rounded-full border border-rule p-1"
      >
        {SEGMENTS.map((segment) => {
          const isActive = segment.id === active
          return (
            <button
              key={segment.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => select(segment.id)}
              className={`min-h-11 px-4 rounded-full text-sm font-medium transition-colors ${
                isActive ? 'bg-ink text-paper' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {segment.label}
            </button>
          )
        })}
      </div>

      {active === 'todo' ? <ChecklistView /> : <PackingView />}
    </div>
  )
}
