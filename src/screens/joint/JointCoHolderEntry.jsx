import { useState } from 'react'
import ContinueOnPhoneModal from '../../components/ContinueOnPhoneModal'

export default function JointCoHolderEntry({ formData, dispatch, goNext, goBack, goTo }) {
  const [loading, setLoading] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [showPhoneModal, setShowPhoneModal] = useState(false)

  const coHolders = formData.jointData.coHolders
  const required = formData.jointData.numberOfHolders - 1
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
    if (coHolders.length < required) {
      setValidationError(`Please add all joint account holders before submitting. ${coHolders.length} of ${required} added.`)
      return
    }
    setValidationError('')
    setLoading(true)
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
            Please provide the following information for each additional account holder. Each person will receive a link to independently verify their identity.
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            background: coHolders.length >= required ? '#DCFCE7' : '#EEF2FF',
            borderRadius: 'var(--radius-md)',
            marginBottom: 16,
            fontSize: 14,
            fontWeight: 600,
            color: coHolders.length >= required ? 'var(--color-green)' : 'var(--color-primary)',
          }}>
            <span>{coHolders.length} of {required} co-holder{required !== 1 ? 's' : ''} added</span>
            {coHolders.length >= required && <span>✓</span>}
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

          {coHolders.length < required && (
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
            disabled={loading || coHolders.length < required}
          >
            {loading ? <span className="loading-dots"><span /><span /><span /></span> : 'Submit'}
          </button>
          <button className="btn btn-secondary" onClick={() => setShowPhoneModal(true)}>
            Continue on phone
          </button>
        </div>
      </div>

      {showPhoneModal && <ContinueOnPhoneModal onClose={() => setShowPhoneModal(false)} />}
    </>
  )
}
