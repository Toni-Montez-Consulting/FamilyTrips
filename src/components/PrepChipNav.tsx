type Chip = { cat: string; id: string; icon?: string }

type Props = {
  chips: Chip[]
  activeId: string | null
  onJump: (id: string) => void
}

export default function PrepChipNav({ chips, activeId, onJump }: Props) {
  return (
    <div className="sticky top-0 z-10 -mx-5 bg-paper/90 px-5 py-2 backdrop-blur supports-[backdrop-filter]:bg-paper/75">
      <nav aria-label="Jump to category" className="flex gap-2 overflow-x-auto">
        {chips.map((c) => {
          const isActive = c.id === activeId
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onJump(c.id)}
              aria-current={isActive ? 'true' : undefined}
              className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-sm font-medium ${
                isActive ? 'border border-ink bg-ink text-paper' : 'border border-rule bg-surface text-ink'
              }`}
            >
              {c.icon && <span aria-hidden>{c.icon}</span>}
              {c.cat}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
