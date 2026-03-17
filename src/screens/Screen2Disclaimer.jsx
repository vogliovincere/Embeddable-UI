import { useState, useEffect } from 'react'

export default function Screen2Disclaimer({ goNext, goBack }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <div className="header">
        <button className="back-button" onClick={goBack}>←</button>
        <button className="lang-selector">En</button>
      </div>
      <div className="screen-content">
        {loading ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <div className="spinner" />
            <p style={{ fontSize: 14, color: 'var(--color-text)' }}>Loading verification...</p>
          </div>
        ) : (
          <>
            <div className="card" style={{ flex: 1 }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: '#FEF3C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                marginBottom: 16,
              }}>
                ⚠️
              </div>
              <h1>Verivend Verification</h1>
              <p className="subtitle">
                You are about to submit sensitive personal and business data to <strong>Verivend</strong> for the purpose of identity and entity verification.
              </p>
              <div style={{
                background: '#FFF7ED',
                border: '1px solid #FED7AA',
                borderRadius: 'var(--radius-sm)',
                padding: 16,
                marginBottom: 20,
              }}>
                <p style={{ fontSize: 13, color: '#92400E', lineHeight: 1.5 }}>
                  <strong>Security notice:</strong> If you received a link to this page from a suspicious source, please close this page immediately and do not submit any information.
                </p>
              </div>
            </div>
            <div className="button-group">
              <button className="btn btn-primary" onClick={goNext}>
                Continue
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
