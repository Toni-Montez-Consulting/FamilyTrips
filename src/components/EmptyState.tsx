type Props = {
  icon?: string
  title: string
  body?: string
}

export default function EmptyState({ icon = '📝', title, body }: Props) {
  return (
    <div className="rounded-[8px] border border-dashed border-rule bg-paper p-6 text-center">
      <div aria-hidden className="text-3xl mb-1">{icon}</div>
      <p className="font-medium text-ink">{title}</p>
      {body && <p className="text-sm text-ink-soft mt-1">{body}</p>}
    </div>
  )
}
