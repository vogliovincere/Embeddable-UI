export default function JointStepOverview({ goNext, goBack, contextId }) {
  const isComplete = contextId !== 'kyc_basic'

  const steps = [
    {
      icon: '👤',
      label: 'Provide your identity information',
      detail: 'Name, date of birth, and tax identifier',
    },
    {
      icon: '🏠',
      label: 'Provide your address information',
      detail: 'Current residential address',
    },
    {
      icon: '📄',
      label: 'Provide supplementary documents',
      detail: 'Proof of address',
    },
    {
      icon: isComplete ? '📷' : '🪪',
      label: isComplete ? 'Identity verification' : 'Upload identity documents',
      detail: isComplete
        ? 'Photo ID and selfie via secure verification'
        : 'Photo ID verification',
    },
    {
      icon: '👥',
      label: 'Provide co-holder information',
      detail: 'Enter details for each additional joint account holder',
    },
  ]

  return (
    <>
      <div className="header">
        <button className="back-button" onClick={goBack}>←</button>
        <button className="lang-selector">En</button>
      </div>
      <div className="screen-content">
        <h1>Joint Account Verification</h1>
        <p className="subtitle">
          Complete the following steps to verify your identity. Steps 1–4 verify your own identity. In Step 5, you'll provide information for the other account holders.
        </p>
        <div className="step-list">
          {steps.map((step, i) => (
            <div key={i} className="step-item">
              <div className="step-icon emoji-badge" style={{
                background: 'var(--color-primary-soft)',
                color: 'var(--color-primary)',
                fontWeight: 700,
                fontSize: 15,
              }}>
                <span className={`emoji-deco${step.icon === '🪪' ? ' emoji-id' : ''}`}>{step.icon}</span>
              </div>
              <div>
                <div className="step-label">{step.label}</div>
                <div className="step-description">{step.detail}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="button-group">
          <button className="btn btn-primary" onClick={goNext}>
            Start verification
          </button>
        </div>
      </div>
    </>
  )
}
