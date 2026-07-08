import { useState } from 'react'

export default function Screen1Welcome({ setAgreedToTerms, onSelectFlow }) {
  const [showSubSelection, setShowSubSelection] = useState(false)

  const handleFlowClick = (type) => {
    if (type === 'individual') {
      // Show sub-selection for Solo vs Joint
      setShowSubSelection(true)
      return
    }
    setAgreedToTerms(true)
    onSelectFlow(type)
  }

  const handleSubSelect = (type) => {
    setShowSubSelection(false)
    setAgreedToTerms(true)
    onSelectFlow(type)
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
    </div>
  )
}
