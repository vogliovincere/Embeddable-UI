import { useState } from 'react'
import MaskedSsnInput from '../../components/MaskedSsnInput'

export default function IndPersonalInfo({ formData, dispatch, goNext, goBack, contextId, flowType }) {
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const { firstName, lastName, email, phone, dob, taxId } = formData.individualData
  const totalSteps = flowType === 'joint' ? 5 : 4

  const fieldRules = {
    firstName: (v) => (v?.trim() ? null : 'This field is required'),
    lastName: (v) => (v?.trim() ? null : 'This field is required'),
    email: (v) => {
      if (!v?.trim()) return 'This field is required'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Enter a valid email address'
      return null
    },
    phone: (v) => {
      if (!v?.trim()) return 'This field is required'
      if (v.replace(/\D/g, '').length !== 10) return 'Phone number must be 10 digits'
      return null
    },
    dob: (v) => {
      if (!v?.trim()) return 'This field is required'
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(v)) return 'The date must be valid (mm/dd/yyyy)'
      return null
    },
    taxId: (v) => {
      if (!v?.trim()) return 'This field is required'
      if (v.replace(/\D/g, '').length !== 9) return 'SSN must be 9 digits'
      return null
    },
  }

  const validate = () => {
    const values = { firstName, lastName, email, phone, dob, taxId }
    const errs = {}
    for (const [name, rule] of Object.entries(fieldRules)) {
      const e = rule(values[name])
      if (e) errs[name] = e
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleBlur = (name, value) => {
    const err = fieldRules[name]?.(value) ?? null
    setErrors(prev => {
      if (err === prev[name]) return prev
      const next = { ...prev }
      if (err) next[name] = err
      else delete next[name]
      return next
    })
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
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
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
          <h1>Identity information </h1>
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
              onBlur={e => handleBlur('firstName', e.target.value)}
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
              onBlur={e => handleBlur('lastName', e.target.value)}
            />
            {errors.lastName && <div className="form-error">{errors.lastName}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Email <span className="required">*</span>
            </label>
            <input
              className={`form-input ${errors.email ? 'error' : ''}`}
              type="email"
              placeholder="email@example.com"
              value={email || ''}
              onChange={e => updateField('email', e.target.value)}
              onBlur={e => handleBlur('email', e.target.value)}
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Phone number <span className="required">*</span>
            </label>
            <input
              className={`form-input ${errors.phone ? 'error' : ''}`}
              type="tel"
              placeholder="5551234567"
              value={phone || ''}
              onChange={e => updateField('phone', e.target.value.replace(/[^\d]/g, ''))}
              onBlur={e => handleBlur('phone', e.target.value)}
              maxLength={10}
              inputMode="numeric"
            />
            {errors.phone && <div className="form-error">{errors.phone}</div>}
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
              onBlur={e => handleBlur('dob', e.target.value)}
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
              onBlur={() => handleBlur('taxId', taxId)}
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
        </div>
      </div>
    </>
  )
}
