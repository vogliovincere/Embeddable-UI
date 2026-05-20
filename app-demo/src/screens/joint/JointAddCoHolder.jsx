import { useState } from 'react'

export default function JointAddCoHolder({ formData, dispatch, goTo }) {
  const editIndex = formData.jointData.editingCoHolderIndex
  const isEditing = editIndex !== null
  const existing = isEditing ? formData.jointData.coHolders[editIndex] : null

  const [firstName, setFirstName] = useState(existing?.firstName || '')
  const [lastName, setLastName] = useState(existing?.lastName || '')
  const [dob, setDob] = useState(existing?.dob || '')
  const [email, setEmail] = useState(existing?.email || '')
  const [phone, setPhone] = useState(existing?.phone || '')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const fieldRules = {
    firstName: (v) => (v?.trim() ? null : 'This field is required'),
    lastName: (v) => (v?.trim() ? null : 'This field is required'),
    dob: (v) => {
      if (!v?.trim()) return 'This field is required'
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(v)) return 'The date must be valid (mm/dd/yyyy)'
      return null
    },
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
  }

  const clearError = (name) => {
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleDobChange = (e) => {
    let val = e.target.value.replace(/[^\d]/g, '')
    if (val.length > 8) val = val.slice(0, 8)
    if (val.length >= 5) {
      val = val.slice(0, 2) + '/' + val.slice(2, 4) + '/' + val.slice(4)
    } else if (val.length >= 3) {
      val = val.slice(0, 2) + '/' + val.slice(2)
    }
    setDob(val)
    clearError('dob')
  }

  const validate = () => {
    const values = { firstName, lastName, dob, email, phone }
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
      const coHolder = { firstName, lastName, dob, email, phone }
      if (isEditing) {
        dispatch({ type: 'UPDATE_CO_HOLDER', index: editIndex, payload: coHolder })
      } else {
        dispatch({ type: 'ADD_CO_HOLDER', payload: coHolder })
      }
      setLoading(false)
      goTo(210)
    }, 1000)
  }

  return (
    <>
      <div className="progress-bar">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`progress-segment ${i <= 4 ? 'active' : ''}`} />
        ))}
      </div>
      <div className="header">
        <button className="back-button" onClick={() => goTo(210)}>←</button>
        <button className="lang-selector">En</button>
      </div>
      <div className="screen-content">
        <div className="card">
          <h1>{isEditing ? 'Edit' : 'Add'} co-holder</h1>
          <p className="subtitle">
            {isEditing
              ? 'Update the details for this co-holder.'
              : 'Provide contact information for this co-holder. They will receive a link to provide their own address and verify their identity independently.'}
          </p>

          <div className="form-group">
            <label className="form-label">First name <span className="required">*</span></label>
            <input
              className={`form-input ${errors.firstName ? 'error' : ''}`}
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={e => { setFirstName(e.target.value); clearError('firstName') }}
              onBlur={e => handleBlur('firstName', e.target.value)}
            />
            {errors.firstName && <div className="form-error">{errors.firstName}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Last name <span className="required">*</span></label>
            <input
              className={`form-input ${errors.lastName ? 'error' : ''}`}
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={e => { setLastName(e.target.value); clearError('lastName') }}
              onBlur={e => handleBlur('lastName', e.target.value)}
            />
            {errors.lastName && <div className="form-error">{errors.lastName}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Date of birth <span className="required">*</span></label>
            <input
              className={`form-input ${errors.dob ? 'error' : ''}`}
              type="text"
              placeholder="MM/DD/YYYY"
              value={dob}
              onChange={handleDobChange}
              onBlur={e => handleBlur('dob', e.target.value)}
              maxLength={10}
            />
            {errors.dob && <div className="form-error">{errors.dob}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Email <span className="required">*</span></label>
            <input
              className={`form-input ${errors.email ? 'error' : ''}`}
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={e => { setEmail(e.target.value); clearError('email') }}
              onBlur={e => handleBlur('email', e.target.value)}
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Phone number <span className="required">*</span></label>
            <input
              className={`form-input ${errors.phone ? 'error' : ''}`}
              type="tel"
              placeholder="5551234567"
              value={phone}
              onChange={e => { setPhone(e.target.value.replace(/[^\d]/g, '')); clearError('phone') }}
              onBlur={e => handleBlur('phone', e.target.value)}
              maxLength={10}
              inputMode="numeric"
            />
            {errors.phone && <div className="form-error">{errors.phone}</div>}
          </div>
        </div>

        <div className="button-group">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="loading-dots"><span /><span /><span /></span> : (isEditing ? 'Update co-holder' : 'Add co-holder')}
          </button>
        </div>
      </div>
    </>
  )
}
