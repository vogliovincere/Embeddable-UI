import { useState } from 'react'
import { createPortal } from 'react-dom'

const linkStyle = { color: 'var(--color-accent)', textDecoration: 'underline', cursor: 'pointer' }

export default function Screen4Consent({ goNext, goBack }) {
  const [consent2, setConsent2] = useState(false)
  const [showRelease, setShowRelease] = useState(false)

  const canProceed = consent2

  const handleContinue = () => {
    if (canProceed) {
      goNext()
    }
  }

  const openRelease = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setShowRelease(true)
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
          Please review and accept the disclosures below to proceed with verification.
        </p>

        <p style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.5, marginBottom: 12 }}>
          By selecting &ldquo;Continue,&rdquo; you authorize Interro, LLC (&ldquo;Interro&rdquo;) to collect and use the following information to verify your identity for know-your-customer (KYC) compliance purposes; and consent to Interro retaining this information and using the information to verify your identity in future transactions, including any future transactions you enter directly with Interro. See Interro&rsquo;s{' '}
          <a href="#" style={linkStyle}>Privacy Policy</a>{' '}
          to learn more.
        </p>
        <p style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.5, marginBottom: 20 }}>
          This includes personal information such as your photo identity documents (like a passport or driver&rsquo;s license), your date of birth, your tax identification number, and your home address, along with device information like your device type, browser, and IP address.
        </p>

        <div className="checkbox-group" onClick={() => setConsent2(!consent2)}>
          <input type="checkbox" checked={consent2} readOnly />
          <label>
            I consent to the processing of my personal data, including biometric data, as described in the{' '}
            <a href="#" style={linkStyle} onClick={openRelease}>Biometric Written Release</a>.
          </label>
        </div>

        <div className="button-group">
          <button
            className="btn btn-primary"
            onClick={handleContinue}
            disabled={!canProceed}
          >
            Continue
          </button>
        </div>
      </div>

      {showRelease && createPortal(
        <div className="modal-overlay center" onClick={() => setShowRelease(false)}>
          <div className="modal-content" style={{ padding: 24 }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginBottom: 16, fontSize: 16, lineHeight: 1.35 }}>
              Written Release for Collection and Use of Biometric Information
            </h2>
            <p style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.5, marginBottom: 12 }}>
              Interro, LLC and its affiliates (&ldquo;Interro,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collect and process biometric information, including a self-portrait photograph (collectively, &ldquo;Your Biometric Information&rdquo;), to conduct identity verification screening for know-your-customer compliance under applicable law (collectively, the &ldquo;Permitted Purposes&rdquo;), as further described in our{' '}
              <a href="#" style={linkStyle} onClick={e => e.preventDefault()}>Biometric Privacy Policy</a>. By selecting &ldquo;I Consent&rdquo; below, you acknowledge and agree:
            </p>
            <ol style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.5, marginBottom: 16, paddingLeft: 20 }}>
              <li style={{ marginBottom: 10 }}>
                Interro may capture, generate, or otherwise collect Your Biometric Information for the Permitted Purposes.
              </li>
              <li style={{ marginBottom: 10 }}>
                Interro may retain Your Biometric Information for [RETENTION PERIOD], or as otherwise required by law.
              </li>
              <li style={{ marginBottom: 10 }}>
                Your consent to the collection of Your Biometric Information is voluntary. Please note, however, that if you choose not to consent, then you may not be able to engage in the applicable transaction(s) for which Interro is collecting Your Biometric Information.
              </li>
              <li>
                Selecting &ldquo;I CONSENT&rdquo; below constitutes your execution of this written release and signifies your consent and written release to the collection, use, and storage of Your Biometric Information as described herein.
              </li>
            </ol>
            <button className="btn btn-primary" onClick={() => setShowRelease(false)}>
              Close
            </button>
          </div>
        </div>,
        document.getElementById('phone-modal-root')
      )}
    </>
  )
}
