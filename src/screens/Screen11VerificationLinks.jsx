import { useState } from 'react'

export default function Screen11VerificationLinks({ formData, goNext }) {
  const [expanded, setExpanded] = useState(true)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const parties = formData.associatedParties

  const handleCopyLink = (index) => {
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleVerifyNow = () => {
    // Simulate navigation to verification — in prototype just show as clicked
  }

  const handleSendEmail = () => {
    // Simulate send
  }

  return (
    <>
      <div className="progress-bar">
        <div className="progress-segment active" />
        <div className="progress-segment active" />
        <div className="progress-segment active" />
        <div className="progress-segment active" />
      </div>
      <div className="screen-content" style={{ paddingTop: 24 }}>
        <h1>One last step</h1>
        <p className="subtitle">
          To complete your business verification, all associated parties must verify their identity.
        </p>

        <button className="btn btn-secondary" style={{ marginBottom: 20 }}>
          Remind all pending applicants
        </button>

        <div style={{ marginBottom: 20 }}>
          <div
            className="collapsible-header"
            onClick={() => setExpanded(!expanded)}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="status-dot pending" />
              <strong style={{ color: 'var(--color-heading)' }}>Verification required</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="count-badge">{parties.length}</span>
              <span className={`chevron-icon ${expanded ? 'open' : ''}`}>▼</span>
            </div>
          </div>

          {expanded && (
            <div style={{ border: '1px solid var(--color-border)', borderTop: 'none', borderRadius: '0 0 var(--radius-md) var(--radius-md)', padding: '8px 0' }}>
              {parties.map((party, index) => (
                <div key={index} style={{ padding: '16px' }}>
                  <div className="party-card-header">
                    <div className="party-avatar">👤</div>
                    <div className="party-info">
                      <div className="party-name">
                        {party.firstName} {party.lastName}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        {party.roles.map(r => (
                          <span key={r} className={`role-badge ${r.toLowerCase()}`}>{r}</span>
                        ))}
                        <span style={{ fontSize: 13, color: 'var(--color-text)' }}>• {party.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="verify-buttons">
                    <button className="btn-small btn-primary" onClick={handleVerifyNow}>
                      Verify now
                    </button>
                    <button className="btn-small btn-secondary" onClick={handleSendEmail}>
                      Send to email
                    </button>
                    <button
                      className="btn-small btn-secondary"
                      onClick={() => handleCopyLink(index)}
                    >
                      {copiedIndex === index ? 'Copied!' : 'Copy link'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <h2 style={{ marginBottom: 12 }}>Checking info</h2>
          <div className="card" style={{ padding: 0 }}>
            {['Entity details', 'Supplementary documents', 'Entity documents'].map((item, i) => (
              <div key={i} className="checking-item">
                <div className="spinner spinner-small" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="button-group">
          <button className="btn btn-primary" onClick={goNext}>
            Continue
          </button>
        </div>
      </div>
    </>
  )
}
