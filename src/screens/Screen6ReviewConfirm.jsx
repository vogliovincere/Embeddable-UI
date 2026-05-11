import { useState } from 'react'

export default function Screen6ReviewConfirm({ formData, goNext, goTo }) {
  const [loading, setLoading] = useState(false)
  const { country, state, entityName, fileNumber } = formData.entityDetails

  const handleConfirm = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      goNext()
    }, 1500)
  }

  return (
    <>
      <div className="progress-bar">
        <div className="progress-segment active" />
        <div className="progress-segment" />
        <div className="progress-segment" />
        <div className="progress-segment" />
      </div>
      <div className="header">
        <button className="back-button" onClick={() => goTo(5)}>←</button>
        <button className="lang-selector">En</button>
      </div>
      <div className="screen-content">
        <div className="card">
          <h1>Review entity details</h1>
          <p className="subtitle">
            Please review the entity information below and confirm it is correct.
          </p>

          <div className="review-fields">
            <div className="review-field">
              <div className="review-field-label">Country of entity registration</div>
              <div className="review-field-value">
                {country && <span>{country.flag}</span>}
                <span>{country?.name || '—'}</span>
              </div>
            </div>
            {state && (
              <div className="review-field">
                <div className="review-field-label">State</div>
                <div className="review-field-value">{state}</div>
              </div>
            )}
            <div className="review-field">
              <div className="review-field-label">Entity name</div>
              <div className="review-field-value">{entityName || '—'}</div>
            </div>
            <div className="review-field">
              <div className="review-field-label">File number</div>
              <div className="review-field-value">{fileNumber || '—'}</div>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginTop: 12 }}>
            <button className="edit-link" onClick={() => goTo(5)}>Edit</button>
          </div>
        </div>

        <div className="button-group">
          <button className="btn btn-primary" onClick={handleConfirm} disabled={loading}>
            {loading ? <span className="loading-dots"><span /><span /><span /></span> : 'Confirm and continue'}
          </button>
        </div>
      </div>
    </>
  )
}
