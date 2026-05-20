import { useState } from 'react'

export default function Screen10AddParty({ formData, dispatch, goTo }) {
  const editIndex = formData.editingPartyIndex
  const isEditing = editIndex !== null
  const existingParty = isEditing ? formData.associatedParties[editIndex] : null

  const [roles, setRoles] = useState(existingParty?.roles || (formData.defaultPartyRole ? [formData.defaultPartyRole] : []))
  const [firstName, setFirstName] = useState(existingParty?.firstName || '')
  const [lastName, setLastName] = useState(existingParty?.lastName || '')
  const [middleName, setMiddleName] = useState(existingParty?.middleName || '')
  const [dob, setDob] = useState(existingParty?.dob || '')
  const [email, setEmail] = useState(existingParty?.email || '')
  const [phone, setPhone] = useState(existingParty?.phone || '')
  const [ownershipPercentage, setOwnershipPercentage] = useState(
    existingParty?.ownershipPercentage ?? ''
  )
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(false)
  const [loading, setLoading] = useState(false)

  const fieldRules = {
    firstName: (v) => (v?.trim() ? null : 'This field is required'),
    lastName: (v) => (v?.trim() ? null : 'This field is required'),
    email: (v) => {
      if (!v?.trim()) return 'This field is required'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return 'Enter a valid email address'
      return null
    },
    phone: (v) => {
      if (!v?.trim()) return null
      if (v.replace(/\D/g, '').length !== 10) return 'Phone number must be 10 digits'
      return null
    },
    dob: (v) => {
      if (!v?.trim()) return 'This field is required'
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(v)) return 'The date must be valid (mm/dd/yyyy)'
      return null
    },
    ownershipPercentage: (v) => {
      if (v === '' || v === null) return null
      const n = Number(v)
      if (Number.isNaN(n) || n < 0 || n > 100) return 'Enter a number between 0 and 100'
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

  const toggleRole = (role) => {
    setRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role])
    clearError('roles')
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
    const values = { firstName, lastName, email, phone, dob, ownershipPercentage }
    const errs = {}
    if (roles.length === 0) errs.roles = 'Select at least one role'
    for (const [name, rule] of Object.entries(fieldRules)) {
      const e = rule(values[name])
      if (e) errs[name] = e
    }
    setErrors(errs)
    const valid = Object.keys(errs).length === 0
    setSubmitError(!valid)
    return valid
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
      const party = {
        roles, firstName, lastName, middleName, dob, email, phone,
        ownershipPercentage: ownershipPercentage === '' ? null : Number(ownershipPercentage),
      }
      if (isEditing) {
        dispatch({ type: 'UPDATE_PARTY', index: editIndex, payload: party })
      } else {
        dispatch({ type: 'ADD_PARTY', payload: party })
      }
      setLoading(false)
      goTo(8)
    }, 1000)
  }

  return (
    <>
      <div className="progress-bar">
        <div className="progress-segment active" />
        <div className="progress-segment active" />
        <div className="progress-segment active" />
        <div className="progress-segment active" />
      </div>
      <div className="header">
        <button className="back-button" onClick={() => goTo(8)}>←</button>
        <button className="lang-selector">En</button>
      </div>
      <div className="screen-content">
        <div className="card">
          <h1>{isEditing ? 'Edit' : 'Add'} associated party</h1>
          <p className="subtitle">
            {isEditing
              ? 'Update the details for this associated party.'
              : 'Enter contact details for this person. They will receive a link to provide their own address and verify their identity. If this beneficiary has several roles, you can fill out a questionnaire for them automatically.'}
          </p>

          <div className="form-group">
            <label className="form-label">Role <span className="required">*</span></label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['UBO', 'Control Person'].map(role => (
                <label
                  key={role}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    border: `2px solid ${roles.includes(role) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: roles.includes(role) ? 'var(--color-primary-soft)' : 'white',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 500,
                    transition: 'all 0.15s',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={roles.includes(role)}
                    onChange={() => toggleRole(role)}
                    style={{ display: 'none' }}
                  />
                  {roles.includes(role) && <span style={{ color: 'var(--color-primary)' }}>✓</span>}
                  {role}
                </label>
              ))}
            </div>
            {errors.roles && <div className="form-error">{errors.roles}</div>}
          </div>

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
            <label className="form-label">Middle name</label>
            <input
              className="form-input"
              type="text"
              placeholder="Middle name (optional)"
              value={middleName}
              onChange={e => setMiddleName(e.target.value)}
            />
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
              inputMode="numeric"
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
            <label className="form-label">Phone number</label>
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

          <div className="form-group">
            <label className="form-label">% of the company owned (directly or indirectly)</label>
            <input
              className={`form-input ${errors.ownershipPercentage ? 'error' : ''}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.01"
              placeholder="e.g., 25 (optional)"
              value={ownershipPercentage}
              onChange={e => { setOwnershipPercentage(e.target.value); clearError('ownershipPercentage') }}
              onBlur={e => handleBlur('ownershipPercentage', e.target.value)}
            />
            {errors.ownershipPercentage && <div className="form-error">{errors.ownershipPercentage}</div>}
          </div>
        </div>

        {submitError && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            marginBottom: 16,
          }}>
            <p style={{ fontSize: 13, color: '#991B1B', lineHeight: 1.5, margin: 0 }}>
              Please complete all required fields before submitting.
            </p>
          </div>
        )}

        <div className="button-group">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="loading-dots"><span /><span /><span /></span> : (isEditing ? 'Update beneficiary' : 'Create beneficiary')}
          </button>
        </div>
      </div>
    </>
  )
}
