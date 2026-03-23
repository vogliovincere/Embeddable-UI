export default function IndStepOverview({ goNext, goBack, contextId }) {
  const isComplete = contextId !== 'kyc_basic'

  const steps = [
    {
      icon: '👤',
      label: 'Step 1: Provide identity information',
      detail: 'Name, date of birth, and tax identifier',
    },
    {
      icon: '🏠',
      label: 'Step 2: Provide address information',
      detail: 'Current residential address',
    },
    {
      icon: '📄',
      label: 'Step 3: Provide supplementary documents',
      detail: 'Proof of address',
    },
  ]

  if (isComplete) {
    steps.push({
      icon: '🪪',
      label: 'Step 4: Identity Verification',
      detail: 'Photo ID and selfie via secure verification',
    })
  } else {
    steps.push({
      icon: '🪪',
      label: 'Step 4: Upload identity documents',
      detail: 'Photo ID verification',
    })
  }

  return (
    <>
      <div className="header">
        <button className="back-button" onClick={goBack}>←</button>
        <button className="lang-selector">En</button>
      </div>
      <div className="screen-content">
        <h1>Individual Verification</h1>
        <p className="subtitle">
          Complete the following steps to verify your identity. You can save progress and return at any time.
        </p>
        <div className="step-list">
          {steps.map((step, i) => (
            <div key={i} className="step-item">
              <div className="step-icon">{step.icon}</div>
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
