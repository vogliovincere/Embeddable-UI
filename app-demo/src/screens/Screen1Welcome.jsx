import { useState } from 'react'

export default function Screen1Welcome({ goNext, agreedToTerms, setAgreedToTerms, onSelectFlow }) {
  const [showPanel, setShowPanel] = useState(false)
  const [pendingFlow, setPendingFlow] = useState(null)
  const [showSubSelection, setShowSubSelection] = useState(false)

  const handleFlowClick = (type) => {
    if (type === 'individual') {
      // Show sub-selection for Solo vs Joint
      setShowSubSelection(true)
      return
    }
    if (agreedToTerms) {
      onSelectFlow(type)
    } else {
      setPendingFlow(type)
      setShowPanel(true)
    }
  }

  const handleSubSelect = (type) => {
    setShowSubSelection(false)
    if (agreedToTerms) {
      onSelectFlow(type)
    } else {
      setPendingFlow(type)
      setShowPanel(true)
    }
  }

  const handleAgree = () => {
    setAgreedToTerms(true)
    setShowPanel(false)
    if (pendingFlow) {
      onSelectFlow(pendingFlow)
    }
  }

  if (showSubSelection) {
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
          <button
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              background: 'none',
              border: 'none',
              fontSize: 20,
              cursor: 'pointer',
              color: 'var(--color-heading)',
              fontFamily: 'var(--font-family)',
            }}
            onClick={() => setShowSubSelection(false)}
          >
            ←
          </button>
          <div className="emoji-badge" style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'var(--color-primary-soft)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 36,
            marginBottom: 24,
          }}>
            <span className="emoji-deco">👤</span>
          </div>
          <h1>Individual Verification</h1>
          <p className="subtitle" style={{ maxWidth: 300 }}>
            Select the type of individual verification you need.
          </p>

          <div style={{ width: '100%', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className="btn btn-secondary" onClick={() => handleSubSelect('individual')}>
              Solo
            </button>
            <button className="btn btn-secondary" onClick={() => handleSubSelect('joint')}>
              Joint Account
            </button>
            <p style={{ fontSize: 13, color: 'var(--color-gray-400)', marginTop: 4, lineHeight: 1.5 }}>
              Select Joint Account if this account has multiple holders who each need to be verified.
            </p>
          </div>
        </div>
      </div>
    )
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
        <div className="emoji-badge" style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'var(--color-primary-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
          marginBottom: 24,
        }}>
          <span className="emoji-deco">🛡️</span>
        </div>
        <h1>Verification</h1>
        <p className="subtitle" style={{ maxWidth: 300 }}>
          We need to verify your information before you can proceed. Please select your verification type below.
        </p>

        <div style={{ width: '100%', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => handleFlowClick('individual')}>
            Individual
          </button>
          <button className="btn btn-secondary" onClick={() => handleFlowClick('entity')}>
            Corporate / Entity
          </button>
        </div>
      </div>

      {showPanel && (
        <>
          <div
            className="slide-up-overlay"
            onClick={() => setShowPanel(false)}
          />
          <div className="slide-up-panel">
            <h2 style={{ marginBottom: 4 }}>Before you continue</h2>
            <p style={{ fontSize: 13, color: 'var(--color-gray-400)', marginBottom: 12 }}>
              Identity &amp; compliance verification
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.5, marginBottom: 12 }}>
              By selecting &ldquo;Continue,&rdquo; you authorize Interro, LLC (&ldquo;Interro&rdquo;) to collect and use the following information to verify your identity for know-your-customer (KYC) compliance purposes; and consent to Interro retaining this information and using the information to verify your identity in future transactions, including any future transactions you enter directly with Interro. See Interro&rsquo;s{' '}
              <a href="#" style={{ color: 'var(--color-accent)' }}>Privacy Policy</a>{' '}
              to learn more.
            </p>
            <p style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.5, marginBottom: 16 }}>
              This includes personal information such as your photo identity documents (like a passport or driver&rsquo;s license), your date of birth, your tax identification number, and your home address, along with device information like your device type, browser, and IP address.
            </p>
            <button className="btn btn-primary" onClick={handleAgree}>
              Continue
            </button>
            <button
              className="btn btn-ghost"
              style={{ marginTop: 8, width: '100%' }}
              onClick={() => setShowPanel(false)}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  )
}
