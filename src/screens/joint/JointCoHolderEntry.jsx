import { useState } from 'react'

export default function JointCoHolderEntry({ formData, dispatch, goNext, goBack, goTo }) {
  const [loading, setLoading] = useState(false)
  const [validationError, setValidationError] = useState('')

  const coHolders = formData.jointData.coHolders
  const maxCoHolders = 4
  const totalSteps = 5

  const handleAdd = () => {
    dispatch({ type: 'SET_EDITING_CO_HOLDER', index: null })
    goTo(211)
  }

  const handleEdit = (index) => {
    dispatch({ type: 'SET_EDITING_CO_HOLDER', index })
    goTo(211)
  }

  const handleDelete = (index) => {
    dispatch({ type: 'DELETE_CO_HOLDER', index })
  }

  const handleSubmit = () => {
    if (coHolders.length < 1) {
      setValidationError('Please add at least one joint account holder before submitting.')
      return
    }
    setValidationError('')
    setLoading(true)
    // Update numberOfHolders to match actual count (primary + co-holders)
    dispatch({ type: 'SET_JOINT_CONFIG', payload: { numberOfHolders: coHolders.length + 1 } })
    setTimeout(() => {
      setLoading(false)
      goNext()
    }, 1500)
  }

  return (
    <>
      <div className="progress-bar">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={`progress-segment ${i <= 4 ? 'active' : ''}`} />
        ))}
      </div>
      <div className="header">
        <button className="back-button" onClick={goBack}>←</button>
        <button className="lang-selector">En</button>
      </div>
      <div className="screen-content">
        <div className="card">
          <h1>Add your joint account holders</h1>
          <p className="subtitle">
            Please provide the following information for each additional account holder. Each person will receive a link to independently verify their identity. You can add up to {maxCoHolders} co-holders.
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: coHolders.length >= 1 ? '#DCFCE7' : '#EEF2FF',
            borderRadius: 'var(--radius-md)',
            marginBottom: 16,
            fontSize: 14,
            fontWeight: 600,
            color: coHolders.length >= 1 ? 'var(--color-green)' : 'var(--color-primary)',
          }}>
            <span>{coHolders.length} co-holder{coHolders.length !== 1 ? 's' : ''} added</span>
            {coHolders.length >= 1 && <span>✓</span>}
          </div>

          {coHolders.map((holder, index) => (
            <div key={index} className="party-card" style={{ marginBottom: 12 }}>
              <div className="party-card-header">
                <div className="party-avatar">👤</div>
                <div className="party-info">
                  <div className="party-name">{holder.firstName} {holder.lastName}</div>
                  <div className="party-email">{holder.email}</div>
                </div>
                <div className="party-actions">
                  <button onClick={() => handleEdit(index)} title="Edit">✏️</button>
                  <button onClick={() => handleDelete(index)} title="Delete">🗑️</button>
                </div>
              </div>
            </div>
          ))}

          {coHolders.length < maxCoHolders && (
            <button className="add-person-link" onClick={handleAdd}>
              + Add co-holder
            </button>
          )}
        </div>

        {validationError && (
          <div className="form-error" style={{ marginBottom: 12 }}>{validationError}</div>
        )}

        <div className="button-group">
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={loading || coHolders.length < 1}
          >
            {loading ? <span className="loading-dots"><span /><span /><span /></span> : 'Submit'}
          </button>
        </div>
      </div>
    </>
  )
}
