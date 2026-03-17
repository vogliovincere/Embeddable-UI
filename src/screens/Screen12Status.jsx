import { useState } from 'react'

export default function Screen12Status() {
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
        <div className="spinner" style={{ width: 56, height: 56, borderWidth: 4, marginBottom: 24 }} />
        <div className="terminal-heading">Verification in progress</div>
        <div className="terminal-subtext">
          We are reviewing your submission. This page will automatically update once all verifications are complete.
        </div>
      </div>
    </div>
  )
}
