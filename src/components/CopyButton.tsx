import { useEffect, useState } from 'react'
import { toPlainText } from '../utils/plainText'

type Props = {
  text: string
  label?: string
  className?: string
  size?: 'sm' | 'md'
}

export default function CopyButton({ text, label = 'Copy for text', className = '', size = 'sm' }: Props) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1600)
    return () => clearTimeout(t)
  }, [copied])

  const onClick = async () => {
    // Everything copied out of the app is destined for a text/chat, so normalize
    // fancy punctuation to plain ASCII before it lands on the clipboard.
    const out = toPlainText(text)
    try {
      await navigator.clipboard.writeText(out)
      setCopied(true)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = out
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
        setCopied(true)
      } catch {
        // no-op
      }
      document.body.removeChild(ta)
    }
  }

  const padding = size === 'md' ? 'px-4 py-3 text-base' : 'px-3 py-2 text-sm'

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copied ? 'Copied' : label}
      className={`inline-flex items-center gap-2 rounded-full border border-rule bg-surface text-ink-soft hover:text-ink active:scale-95 transition whitespace-nowrap ${padding} ${className}`}
    >
      <span aria-hidden>{copied ? '✅' : '📋'}</span>
      <span>{copied ? 'Copied!' : label}</span>
    </button>
  )
}
