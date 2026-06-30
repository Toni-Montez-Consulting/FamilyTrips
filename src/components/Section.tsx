import CopyButton from './CopyButton'

type Props = {
  title: string
  icon?: string
  copyText?: string
  copyLabel?: string
  children: React.ReactNode
  id?: string
  // Collapsible mode (all optional, backward compatible). When `collapsible`
  // is falsy the component renders exactly as before (Trip.tsx relies on this).
  collapsible?: boolean
  open?: boolean
  onOpenChange?: (next: boolean) => void
  progress?: { done: number; total: number }
}

export default function Section({
  title,
  icon,
  copyText,
  copyLabel,
  children,
  id,
  collapsible,
  open,
  onOpenChange,
  progress,
}: Props) {
  if (!collapsible) {
    return (
      <section id={id} className="bg-surface rounded-[8px] border border-rule overflow-hidden">
        <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-rule">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-ink">
            {icon && <span aria-hidden className="text-2xl">{icon}</span>}
            <span>{title}</span>
          </h2>
          {copyText && <CopyButton text={copyText} label={copyLabel ?? 'Copy for text'} />}
        </header>
        <div className="p-5 space-y-4 text-ink">{children}</div>
      </section>
    )
  }

  const panelId = `${id}-content`
  const isDone = !!progress && progress.total > 0 && progress.done === progress.total

  return (
    <section
      id={id}
      className="bg-surface rounded-[8px] border border-rule overflow-hidden scroll-mt-24"
    >
      <header className={`flex items-center justify-between gap-3 ${open ? 'border-b border-rule' : ''}`}>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => onOpenChange?.(!open)}
          className="group flex min-h-11 flex-1 items-center gap-2 px-5 py-4 text-left"
        >
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            className={`h-4 w-4 shrink-0 text-ink-soft transition-transform duration-150 motion-reduce:transition-none ${
              open ? 'rotate-90' : ''
            }`}
          >
            <path
              d="M6 4l4 4-4 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {icon && <span aria-hidden className="text-xl">{icon}</span>}
          <h2 className="text-xl font-semibold text-ink">{title}</h2>
          {progress && (
            <span
              className={`ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 pr-1 font-mono text-xs tabular-nums tracking-tight ${
                isDone ? 'border border-open/30 bg-open/10 text-open' : 'text-ink-soft'
              }`}
            >
              {isDone && <span aria-hidden>✓</span>}
              {progress.done}/{progress.total}
            </span>
          )}
        </button>
        {copyText && <CopyButton text={copyText} label={copyLabel ?? 'Copy for text'} />}
      </header>
      <div id={panelId} role="region" aria-label={title} hidden={!open} className="p-5 space-y-4 text-ink">
        {children}
      </div>
    </section>
  )
}
