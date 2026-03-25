import { useState } from 'react'
import alloy from '@alloyidentity/web-sdk'
import { createJourneyApplication } from '../../utils/alloyApi'
import { toIsoDate, toStateAbbr } from '../../utils/formatters'

const JOURNEY_TOKEN = import.meta.env.VITE_JOURNEY_TOKEN
const ALLOY_SDK_KEY = import.meta.env.VITE_ALLOY_SDK

async function openAlloyVerification(holder, callback) {
  // Build personData for journey application
  const personData = {
    name_first: holder.firstName || undefined,
    name_last: holder.lastName || undefined,
    email_address: holder.email || undefined,
    phone_number: holder.phone || undefined,
    birth_date: toIsoDate(holder.dob) || undefined,
  }

  // Only include address if primary fields are populated
  if (holder.streetAddress && holder.city && holder.state && holder.postalCode) {
    personData.addresses = [{
      line_1: holder.streetAddress,
      city: holder.city,
      state: toStateAbbr(holder.state),
      postal_code: holder.postalCode,
      country_code: holder.country?.code || 'US',
      type: 'primary',
    }]
  }

  let journeyApplicationToken = null

  // Attempt to create journey application; fall back to SDK-only flow on failure
  try {
    const appResult = await createJourneyApplication(personData)
    console.log('Journey application result:', appResult)
    if (appResult.status !== 'completed') {
      journeyApplicationToken = appResult.journey_application_token
    }
  } catch (apiErr) {
    console.warn('Journey application API failed (CORS or network), falling back to SDK-only flow:', apiErr)
  }

  const initParams = {
    key: ALLOY_SDK_KEY,
    journeyToken: JOURNEY_TOKEN,
    production: false,
    evaluationData: {
      nameFirst: holder.firstName,
      nameLast: holder.lastName,
      emailAddress: holder.email,
      birthDate: holder.dob || undefined,
    },
  }

  if (journeyApplicationToken) {
    initParams.journeyApplicationToken = journeyApplicationToken
  }

  alloy.close()
  await alloy.init(initParams)

  alloy.open(callback)
}

export default function JointVerification({ formData, goNext, contextId }) {
  const [expanded, setExpanded] = useState(true)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [holderStatuses, setHolderStatuses] = useState({})
  const coHolders = formData.jointData.coHolders
  const isComplete = contextId !== 'kyc_basic'

  const setStatus = (index, status) => {
    setHolderStatuses(prev => ({ ...prev, [index]: status }))
  }

  const launchVerification = async (holder, index) => {
    const status = holderStatuses[index]
    if (status?.state === 'loading' || status?.state === 'approved' || status?.state === 'denied') return

    setStatus(index, { state: 'loading', message: 'Initializing...' })

    try {
      await openAlloyVerification(holder, (result) => {
        console.log('Alloy SDK result:', result)
        const sdkEvent = result.sdk?.sdkEvent
        const appStatus = (result.journey_application_status || '').toLowerCase()
        const outcome = (result.complete_outcome || result.recent_outcome || '').toLowerCase()

        if (sdkEvent === 'completed' || result.status === 'completed') {
          if (appStatus === 'approved' || outcome === 'approved') {
            setStatus(index, { state: 'approved', message: 'Verified' })
          } else if (appStatus === 'denied' || outcome === 'denied') {
            setStatus(index, { state: 'denied', message: 'Denied' })
          } else {
            setStatus(index, { state: 'review', message: 'Under Review' })
          }
        } else if (sdkEvent === 'closed' || result.status === 'closed') {
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
      review: { bg: '#FEF3C7', color: '#B45309' },
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

  const pendingCount = coHolders.filter((_, i) => {
    const s = holderStatuses[i]
    return !s || (s.state !== 'approved' && s.state !== 'denied')
  }).length

  return (
    <>
      <div className="progress-bar">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="progress-segment active" />
        ))}
      </div>
      <div className="screen-content" style={{ paddingTop: 24 }}>
        <h1>One last step</h1>
        <p className="subtitle">
          All joint account holders must verify their identity to complete account verification.
        </p>

        <button className="btn btn-secondary" style={{ marginBottom: 20 }}>
          Remind all pending holders
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
              <span className="count-badge">{pendingCount}</span>
              <span className={`chevron-icon ${expanded ? 'open' : ''}`}>▼</span>
            </div>
          </div>

          {expanded && (
            <div style={{ border: '1px solid var(--color-border)', borderTop: 'none', borderRadius: '0 0 var(--radius-md) var(--radius-md)', padding: '8px 0' }}>
              {coHolders.map((holder, index) => {
                const status = holderStatuses[index]
                const isLoading = status?.state === 'loading'
                const isDone = status?.state === 'approved' || status?.state === 'denied'

                return (
                  <div key={index} style={{ padding: '16px' }}>
                    <div className="party-card-header">
                      <div className="party-avatar">👤</div>
                      <div className="party-info">
                        <div className="party-name">
                          {holder.firstName} {holder.lastName}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--color-text)', marginTop: 4 }}>
                          {holder.email}
                        </div>
                      </div>
                    </div>
                    <div className="verify-buttons">
                      <button
                        className="btn-small btn-primary"
                        onClick={() => launchVerification(holder, index)}
                        disabled={isLoading || isDone}
                      >
                        {isLoading ? 'Verifying...' : isDone ? 'Done' : 'Verify now'}
                      </button>
                      <button
                        className="btn-small btn-secondary"
                        onClick={() => launchVerification(holder, index)}
                        disabled={isLoading || isDone}
                      >
                        Send to email
                      </button>
                      <button
                        className="btn-small btn-secondary"
                        onClick={() => handleCopyLink(index)}
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
            {[
              'Identity information',
              'Address information',
              'Supplementary documents',
              isComplete ? 'Identity verification' : 'Identity documents',
            ].map((item, i) => (
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
