import { useState } from 'react'

const linkStyle = { color: 'var(--color-accent)', textDecoration: 'underline', cursor: 'pointer' }

export default function ScreenBiometricConsent({ goNext, goBack }) {
  const [consent, setConsent] = useState(false)

  // Biometric consent is mandatory to proceed. The "Continue" button is disabled
  // until the user selects "I Consent", so verification cannot continue without it.
  // Combined with the KYC consent captured on the previous screen (Screen 4), the
  // user must give both consents to complete verification.
  const handleContinue = () => {
    if (consent) {
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
        <h1>Biometric Consent</h1>
        <p className="subtitle">
          Written Release for Collection and Use of Biometric Information
        </p>

        <p style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.5, marginBottom: 12 }}>
          Interro, LLC and its affiliates (&ldquo;Interro,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) collect and process biometric information, including a self-portrait photograph (collectively, &ldquo;Your Biometric Information&rdquo;), to conduct identity verification screening for know-your-customer compliance under applicable law (collectively, the &ldquo;Permitted Purposes&rdquo;), as further described in our{' '}
          <a href="#" style={linkStyle} onClick={e => e.preventDefault()}>Biometric Privacy Policy</a>. By selecting &ldquo;I Consent&rdquo; below, you acknowledge and agree:
        </p>
        <ol style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.5, marginBottom: 12, paddingLeft: 20 }}>
          <li style={{ marginBottom: 10 }}>
            Interro may capture, generate, or otherwise collect Your Biometric Information for the Permitted Purposes.
          </li>
          <li>
            Interro may retain Your Biometric Information for [RETENTION PERIOD], or as otherwise required by law.
          </li>
        </ol>
        <p style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.5, marginBottom: 12 }}>
          Your consent to the collection of Your Biometric Information is voluntary. Please note, however, that if you choose not to consent, then you may not be able to engage in the applicable transaction(s) for which Interro is collecting Your Biometric Information.
        </p>
        <p style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.5, marginBottom: 20 }}>
          Selecting &ldquo;I Consent&rdquo; below constitutes your execution of this written release and signifies your consent and written release to the collection, use, and storage of Your Biometric Information as described herein.
        </p>

        <div className="checkbox-group" onClick={() => setConsent(!consent)}>
          <input type="checkbox" checked={consent} readOnly />
          <label>I Consent</label>
        </div>

        <div className="button-group">
          <button
            className="btn btn-primary"
            onClick={handleContinue}
            disabled={!consent}
          >
            Continue
          </button>
        </div>
      </div>
    </>
  )
}
