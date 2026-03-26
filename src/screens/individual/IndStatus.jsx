import { useState, useEffect } from 'react'

export default function IndStatus({ goTo, contextId }) {
  const [phase, setPhase] = useState('checking') // checking | success | failure
  const [checkedItems, setCheckedItems] = useState({})
  const isComplete = contextId !== 'kyc_basic'

  const checkItems = [
    { key: 'identity_info', label: 'Identity information' },
    { key: 'address', label: 'Address information' },
    { key: 'supplementary', label: 'Supplementary documents' },
  ]
  if (isComplete) {
    checkItems.push({ key: 'identity_verification', label: 'Identity verification' })
  } else {
    checkItems.push({ key: 'identity_documents', label: 'Identity documents' })
  }

  // Simulate sequential verification of each item
  useEffect(() => {
    if (phase !== 'checking') return

    const timers = checkItems.map((item, i) =>
      setTimeout(() => {
        setCheckedItems(prev => ({ ...prev, [item.key]: true }))
      }, 1200 * (i + 1))
    )

    // After all items checked, show success
    const finalTimer = setTimeout(() => {
      setPhase('success')
    }, 1200 * (checkItems.length + 1))

    return () => {
      timers.forEach(clearTimeout)
      clearTimeout(finalTimer)
    }
  }, [phase])

  const cycleStatus = () => {
    const order = ['checking', 'success', 'failure']
    const current = order.indexOf(phase)
    const next = order[(current + 1) % order.length]
    if (next === 'checking') {
      setCheckedItems({})
    }
    setPhase(next)
  }

  if (phase === 'success') {
    return (
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="dev-toggle">
          <button onClick={cycleStatus}>Toggle: {phase}</button>
          <button onClick={() => goTo(1)}>Restart</button>
        </div>
        <div className="terminal-screen">
          <div className="terminal-icon success">✓</div>
          <div className="terminal-heading">Verification complete</div>
          <div className="terminal-subtext">
            Your identity verification has been successfully completed. Thank you for your submission.
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'failure') {
    return (
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="dev-toggle">
          <button onClick={cycleStatus}>Toggle: {phase}</button>
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

  // Checking phase
  return (
    <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="dev-toggle">
        <button onClick={cycleStatus}>Toggle: {phase}</button>
      </div>
      <div className="screen-content" style={{ paddingTop: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div className="spinner" style={{ width: 48, height: 48, borderWidth: 4, margin: '0 auto 16px' }} />
          <h1>Verification Submitted</h1>
          <p className="subtitle">Please wait while we verify your submission...</p>
        </div>

        <div style={{
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
        }}>
          {checkItems.map(item => (
            <div key={item.key} className="checking-item">
              {checkedItems[item.key] ? (
                <div style={{
                  width: 18,
                  height: 18,
                  borderRadius: '50%',
                  background: 'var(--color-green)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  minWidth: 18,
                }}>
                  ✓
                </div>
              ) : (
                <div className="spinner spinner-small" />
              )}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
