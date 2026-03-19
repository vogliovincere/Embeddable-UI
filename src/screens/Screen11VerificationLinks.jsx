import { useState } from 'react'
import alloy from '@alloyidentity/web-sdk'

const JOURNEY_TOKEN = import.meta.env.VITE_JOURNEY_TOKEN
const ALLOY_SDK_KEY = import.meta.env.VITE_ALLOY_SDK

async function openAlloyVerification(party, callback) {
  await alloy.init({
    key: ALLOY_SDK_KEY,
    journeyToken: JOURNEY_TOKEN,
    production: false,
    selfie: true,
    documents: ['license', 'passport'],
    evaluationData: {
      nameFirst: party.firstName,
      nameLast: party.lastName,
      emailAddress: party.email,
      birthDate: party.dob || undefined,
      phoneNumber: party.phone || undefined,
    },
  })

  alloy.open(callback)
}

export default function Screen11VerificationLinks({ formData, goNext }) {
  const [expanded, setExpanded] = useState(true)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [partyStatuses, setPartyStatuses] = useState({})
  const parties = formData.associatedParties

  const setStatus = (index, status) => {
    setPartyStatuses(prev => ({ ...prev, [index]: status }))
  }

  const launchVerification = async (party, index) => {
    const status = partyStatuses[index]
    if (status?.state === 'loading' || status?.state === 'approved' || status?.state === 'denied') return

    setStatus(index, { state: 'loading', message: 'Initializing...' })

    try {
      await openAlloyVerification(party, (result) => {
        console.log('Alloy SDK result:', result)

        if (result.status === 'completed') {
          const approved = result.journey_application_status === 'approved'
          setStatus(index, {
            state: approved ? 'approved' : 'denied',
            message: approved ? 'Verified' : 'Denied',
          })
        } else if (result.status === 'closed') {
          setStatus(index, { state: 'idle', message: 'Closed by user' })
        } else {
          setStatus(index, { state: 'idle', message: result.status || 'Dismissed' })
        }
      })
    } catch (err) {
      console.error('Alloy SDK error:', err)
      setStatus(index, { state: 'error', message: err.message })
    }
  }

  const handleCopyLink = (index) => {
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const getStatusBadge = (status) => {
    if (!status) return null
    const colors = {
      loading: { bg: '#EEF2FF', color: 'var(--color-primary)' },
      approved: { bg: '#DCFCE7', color: 'var(--color-green)' },
      denied: { bg: '#FEE2E2', color: 'var(--color-error)' },
      error: { bg: '#FEE2E2', color: 'var(--color-error)' },
      idle: { bg: 'var(--color-gray-100)', color: 'var(--color-text)' },
    }
    const c = colors[status.state] || colors.idle
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: 12,
        fontWeight: 600,
        background: c.bg,
        color: c.color,
        marginTop: 8,
      }}>
        {status.state === 'loading' && <span className="spinner spinner-small" style={{ width: 14, height: 14, borderWidth: 2 }} />}
        {status.message}
      </span>
    )
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
              {parties.map((party, index) => {
                const status = partyStatuses[index]
                const isLoading = status?.state === 'loading'
                const isDone = status?.state === 'approved' || status?.state === 'denied'

                return (
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
                      <button
                        className="btn-small btn-primary"
                        onClick={() => launchVerification(party, index)}
                        disabled={isLoading || isDone}
                      >
                        {isLoading ? 'Verifying...' : isDone ? 'Done' : 'Verify now'}
                      </button>
                      <button
                        className="btn-small btn-secondary"
                        onClick={() => launchVerification(party, index)}
                        disabled={isLoading || isDone}
                      >
                        Send to email
                      </button>
                      <button
                        className="btn-small btn-secondary"
                        onClick={() => launchVerification(party, index)}
                        disabled={isLoading || isDone}
                      >
                        {copiedIndex === index ? 'Copied!' : 'Copy link'}
                      </button>
                    </div>
                    {getStatusBadge(status)}
                  </div>
                )
              })}
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
