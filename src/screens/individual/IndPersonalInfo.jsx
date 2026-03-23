import { useState } from 'react'
import ContinueOnPhoneModal from '../../components/ContinueOnPhoneModal'
import MaskedSsnInput from '../../components/MaskedSsnInput'

export default function IndPersonalInfo({ formData, dispatch, goNext, goBack, contextId, flowType }) {
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPhoneModal, setShowPhoneModal] = useState(false)

  const { firstName, lastName, dob, taxId } = formData.individualData
  const totalSteps = flowType === 'joint' ? 5 : 4

  const validate = () => {
    const errs = {}
    if (!firstName?.trim()) errs.firstName = 'This field is required'
    if (!lastName?.trim()) errs.lastName = 'This field is required'
    if (!dob?.trim()) errs.dob = 'This field is required'
    if (!taxId?.trim()) errs.taxId = 'This field is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      goNext()
    }, 1500)
  }

  const updateField = (field, value) => {
    dispatch({ type: 'SET_INDIVIDUAL_DATA', payload: { [field]: value } })
  }

  // Format DOB as MM/DD/YYYY while typing
  const handleDobChange = (e) => {
    let val = e.target.value.replace(/[^\d]/g, '')
    if (val.length > 8) val = val.slice(0, 8)
    if (val.length >= 5) {
      val = val.slice(0, 2) + '/' + val.slice(2, 4) + '/' + val.slice(4)
    } else if (val.length >= 3) {
      val = val.slice(0, 2) + '/' + val.slice(2)
    }
    updateField('dob', val)
  }

  return (
    <>
      <div className="progress-bar">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={`progress-segment ${i === 0 ? 'active' : ''}`} />
        ))}
      </div>
      <div className="header">
        <button className="back-button" onClick={goBack}>←</button>
        <button className="lang-selector">En</button>
      </div>
      <div className="screen-content">
        <div className="card">
          <h1>Identity information</h1>
          <p className="subtitle">Please provide your personal details</p>

          <div className="form-group">
            <label className="form-label">
              First name <span className="required">*</span>
            </label>
            <input
              className={`form-input ${errors.firstName ? 'error' : ''}`}
              type="text"
              placeholder="Enter first name"
              value={firstName || ''}
              onChange={e => updateField('firstName', e.target.value)}
            />
            {errors.firstName && <div className="form-error">{errors.firstName}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Last name <span className="required">*</span>
            </label>
            <input
              className={`form-input ${errors.lastName ? 'error' : ''}`}
              type="text"
              placeholder="Enter last name"
              value={lastName || ''}
              onChange={e => updateField('lastName', e.target.value)}
            />
            {errors.lastName && <div className="form-error">{errors.lastName}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Date of birth <span className="required">*</span>
            </label>
            <input
              className={`form-input ${errors.dob ? 'error' : ''}`}
              type="text"
              placeholder="MM/DD/YYYY"
              value={dob || ''}
              onChange={handleDobChange}
              maxLength={10}
            />
            {errors.dob && <div className="form-error">{errors.dob}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              SSN / Tax identifier <span className="required">*</span>
            </label>
            <MaskedSsnInput
              className={`form-input ${errors.taxId ? 'error' : ''}`}
              placeholder="Enter SSN or tax identifier"
              value={taxId || ''}
              onChange={val => updateField('taxId', val)}
            />
            {errors.taxId && <div className="form-error">{errors.taxId}</div>}
          </div>

          <div style={{ fontSize: 12, color: 'var(--color-text)', marginTop: 8 }}>
            <span style={{ color: 'var(--color-error)' }}>*</span> Required fields
          </div>
        </div>

        <div className="button-group">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="loading-dots"><span /><span /><span /></span> : 'Save and continue'}
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
