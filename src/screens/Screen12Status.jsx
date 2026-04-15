import { useState } from 'react'

export default function Screen12Status({ goTo }) {
  const [status, setStatus] = useState('pending')

  const cycleStatus = () => {
    const order = ['pending', 'success', 'failure']
    const current = order.indexOf(status)
    setStatus(order[(current + 1) % order.length])
  }

  if (status === 'success') {
    return (
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="dev-toggle">
          <button onClick={cycleStatus}>Toggle: {status}</button>
          <button onClick={() => goTo(1)}>Restart</button>
        </div>
        <div className="terminal-screen">
          <div className="terminal-icon success">✓</div>
          <div className="terminal-heading">Verification complete</div>
          <div className="terminal-subtext">
            Your entity verification has been successfully completed. Thank you for your submission.
          </div>
        </div>
      </div>
    )
  }

  if (status === 'failure') {
    return (
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="dev-toggle">
          <button onClick={cycleStatus}>Toggle: {status}</button>
          <button onClick={() => goTo(1)}>Restart</button>
        </div>
        <div className="terminal-screen">
          <div className="terminal-icon failure">✕</div>
          <div className="terminal-heading">Verification failed</div>
          <div className="terminal-subtext">
            We were unable to complete verification at this time. Please contact support for assistance.
          </div>
        </div>
      </div>
    )
  }

  // Pending state
  return (
    <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="dev-toggle">
        <button onClick={cycleStatus}>Toggle: {status}</button>
      </div>
      <div className="terminal-screen">
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'var(--color-primary-soft)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="5" y="4" width="14" height="17" rx="2" />
            <path d="M9 4h6v3H9z" />
            <circle cx="16" cy="16" r="4.5" fill="var(--color-primary-soft)" />
            <path d="M16 13.5v2.5l1.5 1" />
          </svg>
        </div>
        <div className="terminal-heading">Verification Under Review</div>
        <div className="terminal-subtext">
          Your information has been securely submitted. Our team is currently reviewing your details. This process typically takes 1 to 2 business days.
        </div>
      </div>
    </div>
  )
}
