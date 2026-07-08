import { useState } from 'react'
import { createPortal } from 'react-dom'

export default function Screen4Consent({ goNext, goBack }) {
  const [showModal, setShowModal] = useState(true)
  const [consent2, setConsent2] = useState(false)

  const canProceed = consent2

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
            <p style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.5, marginBottom: 12 }}>
              By selecting &ldquo;Continue,&rdquo; you authorize Interro, LLC (&ldquo;Interro&rdquo;) to collect and use the following information to verify your identity for know-your-customer (KYC) compliance purposes; and consent to Interro retaining this information and using the information to verify your identity in future transactions, including any future transactions you enter directly with Interro. See Interro&rsquo;s{' '}
              <a href="#" onClick={e => e.stopPropagation()}>Privacy Policy</a>{' '}
              to learn more.
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.5, marginBottom: 20 }}>
              This includes personal information such as your photo identity documents (like a passport or driver&rsquo;s license), your date of birth, your tax identification number, and your home address, along with device information like your device type, browser, and IP address.
            </p>

            <div className="checkbox-group" onClick={() => setConsent2(!consent2)}>
              <input type="checkbox" checked={consent2} readOnly />
              <label>
                I consent to the processing of my personal data, including biometric data, as described in the{' '}
                <a href="#" onClick={e => e.stopPropagation()}>Biometric Written Release</a>.
              </label>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
              <button
                className="btn btn-primary"
                onClick={handleAgree}
                disabled={!canProceed}
              >
                Continue
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
