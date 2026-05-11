export default function Screen3StepOverview({ goNext, goBack }) {
  const steps = [
    { icon: '🏢', label: 'Provide entity details', description: 'Company registration information' },
    { icon: '📋', label: 'Provide supplementary documents', description: 'Signatory list & structure diagram' },
    { icon: '📄', label: 'Provide entity documents', description: 'Legal and ownership documents' },
    { icon: '👥', label: 'Provide associated parties', description: 'UBOs, shareholders & directors' },
  ]

  return (
    <>
      <div className="header">
        <button className="back-button" onClick={goBack}>←</button>
        <button className="lang-selector">En</button>
      </div>
      <div className="screen-content">
        <h1>Entity Verification</h1>
        <p className="subtitle">
          Complete the following steps to verify your entity. You can save progress and return at any time.
        </p>
        <div className="step-list">
          {steps.map((step, i) => (
            <div key={i} className="step-item">
              <div className="step-icon emoji-badge"><span className="emoji-deco">{step.icon}</span></div>
              <div>
                <div className="step-label">Step {i + 1}</div>
                <div className="step-description">{step.label}</div>
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
