import { useState } from 'react'
import { createPortal } from 'react-dom'

export default function Screen4Consent({ goNext, goBack }) {
  const [showModal, setShowModal] = useState(true)
  const [consent1, setConsent1] = useState(false)
  const [consent2, setConsent2] = useState(false)

  const canProceed = consent1 && consent2

  const handleAgree = () => {
    if (canProceed) {
      setShowModal(false)
      goNext()
    }
  }

  return (
    <>
      <div className="header">
        <button className="back-button" onClick={goBack}>←</button>
        <button className="lang-selector">En</button>
      </div>
      <div className="screen-content">
        <h1>Privacy & Consent</h1>
        <p className="subtitle">
          Please review and accept the privacy disclosures below to proceed with verification.
        </p>
      </div>

      {showModal && createPortal(
        <div className="modal-overlay center" onClick={goBack}>
          <div className="modal-content" style={{ padding: 24 }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 16 }}>Privacy & Consent</h2>
            <p style={{ fontSize: 14, color: 'var(--color-text)', lineHeight: 1.6, marginBottom: 20 }}>
              Before proceeding, please confirm the following:
            </p>

            <div className="checkbox-group" onClick={() => setConsent1(!consent1)}>
              <input type="checkbox" checked={consent1} readOnly />
              <label>
                I confirm that I have read and understood the{' '}
                <a href="#" onClick={e => e.stopPropagation()}>Privacy Notice</a>{' '}
                and the{' '}
                <a href="#" onClick={e => e.stopPropagation()}>Notification to Processing of Personal Data</a>.
              </label>
            </div>

            <div className="checkbox-group" onClick={() => setConsent2(!consent2)}>
              <input type="checkbox" checked={consent2} readOnly />
              <label>
                I consent to the processing of my personal data, including biometric data, as described in the{' '}
                <a href="#" onClick={e => e.stopPropagation()}>Privacy User Acknowledgement and Consent</a>.
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
              <button
                className="btn btn-primary"
                onClick={handleAgree}
                disabled={!canProceed}
              >
                Agree and continue
              </button>
              <button className="btn btn-secondary" onClick={goBack}>
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.getElementById('phone-modal-root')
      )}
    </>
  )
}
