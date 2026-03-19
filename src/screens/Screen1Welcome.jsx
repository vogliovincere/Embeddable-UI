import { useState } from 'react'

export default function Screen1Welcome({ goNext, agreedToTerms, setAgreedToTerms }) {
  const [showPanel, setShowPanel] = useState(false)

  const handleCorporateClick = () => {
    if (agreedToTerms) {
      goNext()
    } else {
      setShowPanel(true)
    }
  }

  const handleAgree = () => {
    setAgreedToTerms(true)
    setShowPanel(false)
    goNext()
  }

  return (
    <div className="screen-content" style={{ position: 'relative', padding: 0, flex: 1 }}>
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        textAlign: 'center',
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: '#EEF2FF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
          marginBottom: 24,
        }}>
          🛡️
        </div>
        <h1>Verification</h1>
        <p className="subtitle" style={{ maxWidth: 300 }}>
          We need to verify your information before you can proceed. Please select your verification type below.
        </p>

        <div style={{ width: '100%', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button className="btn btn-secondary" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            Individual
          </button>
          <button className="btn btn-primary" onClick={handleCorporateClick}>
            Corporate / Entity
          </button>
        </div>
      </div>

      {showPanel && (
        <div className="slide-up-panel">
          <h2>Terms & Conditions</h2>
          <p style={{ fontSize: 14, color: 'var(--color-text)', lineHeight: 1.6, margin: '16px 0' }}>
            By proceeding, you agree to share your information for the purpose of identity verification and compliance screening. Your data will be processed in accordance with our{' '}
            <a href="#" style={{ color: 'var(--color-accent)' }}>Privacy Policy</a>{' '}
            and{' '}
            <a href="#" style={{ color: 'var(--color-accent)' }}>Data Sharing Agreement</a>.
          </p>
          <p style={{ fontSize: 14, color: 'var(--color-text)', lineHeight: 1.6, marginBottom: 24 }}>
            We collect and process personal information including identification documents, business registration details, and beneficial ownership information as required by applicable anti-money laundering regulations.
          </p>
          <button className="btn btn-primary" onClick={handleAgree}>
            I agree
          </button>
          <button
            className="btn btn-ghost"
            style={{ marginTop: 8, width: '100%' }}
            onClick={() => setShowPanel(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
