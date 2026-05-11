import { useState, useRef, useLayoutEffect } from 'react'

const BULLET = '\u2022'
const REVEAL_MS = 750

export default function MaskedSsnInput({ value, onChange, placeholder, className, style }) {
  const [showAll, setShowAll] = useState(false)
  const [revealIdx, setRevealIdx] = useState(-1)
  const inputRef = useRef(null)
  const cursorRef = useRef(null)
  const timerRef = useRef(null)

  // Restore cursor position after controlled re-render
  useLayoutEffect(() => {
    if (cursorRef.current !== null && inputRef.current) {
      inputRef.current.setSelectionRange(cursorRef.current, cursorRef.current)
      cursorRef.current = null
    }
  })

  const real = value || ''

  const getDisplay = () => {
    if (showAll || !real) return real
    return real.split('').map((ch, i) => (i === revealIdx ? ch : BULLET)).join('')
  }

  const applyChange = (newVal, cursor, revealAt) => {
    onChange(newVal)
    cursorRef.current = cursor
    if (timerRef.current) clearTimeout(timerRef.current)
    if (revealAt >= 0) {
      setRevealIdx(revealAt)
      timerRef.current = setTimeout(() => setRevealIdx(-1), REVEAL_MS)
    } else {
      setRevealIdx(-1)
    }
  }

  const handleKeyDown = (e) => {
    if (showAll) return

    const start = e.target.selectionStart
    const end = e.target.selectionEnd

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      const next = real.slice(0, start) + e.key + real.slice(end)
      applyChange(next, start + 1, start)
    } else if (e.key === 'Backspace') {
      e.preventDefault()
      if (start !== end) {
        applyChange(real.slice(0, start) + real.slice(end), start, -1)
      } else if (start > 0) {
        applyChange(real.slice(0, start - 1) + real.slice(start), start - 1, -1)
      }
    } else if (e.key === 'Delete') {
      e.preventDefault()
      if (start !== end) {
        applyChange(real.slice(0, start) + real.slice(end), start, -1)
      } else if (start < real.length) {
        applyChange(real.slice(0, start) + real.slice(start + 1), start, -1)
      }
    }
  }

  const handlePaste = (e) => {
    if (showAll) return
    e.preventDefault()
    const paste = e.clipboardData.getData('text')
    const start = e.target.selectionStart
    const end = e.target.selectionEnd
    const next = real.slice(0, start) + paste + real.slice(end)
    applyChange(next, start + paste.length, -1)
  }

  const handleChange = (e) => {
    if (showAll) onChange(e.target.value)
  }

  return (
    <div style={{ position: 'relative', ...(style || {}) }}>
      <input
        ref={inputRef}
        className={className}
        type="text"
        placeholder={placeholder}
        value={getDisplay()}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onChange={handleChange}
        style={{ paddingRight: 64 }}
      />
      <button
        type="button"
        onClick={() => {
          if (timerRef.current) clearTimeout(timerRef.current)
          setRevealIdx(-1)
          setShowAll(v => !v)
        }}
        style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          color: 'var(--color-accent)',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'var(--font-family)',
        }}
      >
        {showAll ? 'Hide' : 'Show'}
      </button>
    </div>
  )
}
