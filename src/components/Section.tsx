import CopyButton from './CopyButton'

type Props = {
  title: string
  icon?: string
  copyText?: string
  copyLabel?: string
  children: React.ReactNode
  id?: string
}

export default function Section({ title, icon, copyText, copyLabel, children, id }: Props) {
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
