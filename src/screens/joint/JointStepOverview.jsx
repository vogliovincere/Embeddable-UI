export default function JointStepOverview({ goNext, goBack, contextId }) {
  const isComplete = contextId !== 'kyc_basic'

  const steps = [
    {
      icon: '1',
      label: 'Provide your identity information',
      detail: 'Name, date of birth, and tax identifier',
    },
    {
      icon: '2',
      label: 'Provide your address information',
      detail: 'Current residential address',
    },
    {
      icon: '3',
      label: 'Provide supplementary documents',
      detail: 'Proof of address',
    },
    {
      icon: '4',
      label: isComplete ? 'Identity verification' : 'Upload identity documents',
      detail: isComplete
        ? 'Photo ID and selfie via secure verification'
        : 'Photo ID verification',
    },
    {
      icon: '5',
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
              <div className="step-icon" style={{
                background: i < 4 ? '#EEF2FF' : '#FEF3C7',
                color: i < 4 ? 'var(--color-primary)' : '#B45309',
                fontWeight: 700,
                fontSize: 15,
              }}>
                {step.icon}
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
