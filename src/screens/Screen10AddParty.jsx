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

  const toggleRole = (role) => {
    setRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role])
  }

  const validate = () => {
    const errs = {}
    if (roles.length === 0) errs.roles = 'Select at least one role'
    if (!firstName.trim()) errs.firstName = 'This field is required'
    if (!lastName.trim()) errs.lastName = 'This field is required'
    if (!email.trim()) errs.email = 'This field is required'
    if (!dob.trim()) errs.dob = 'This field is required'
    if (dob && !/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) errs.dob = 'The date must be valid (mm/dd/yyyy)'
    if (ownershipPercentage !== '' && ownershipPercentage !== null) {
      const n = Number(ownershipPercentage)
      if (Number.isNaN(n) || n < 0 || n > 100) {
        errs.ownershipPercentage = 'Enter a number between 0 and 100'
      }
    }
    setErrors(errs)
    const valid = Object.keys(errs).length === 0
    setSubmitError(!valid)
    return valid
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
                    background: roles.includes(role) ? '#EEF2FF' : 'white',
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
              onChange={e => setFirstName(e.target.value)}
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
              onChange={e => setLastName(e.target.value)}
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
              placeholder="mm/dd/yyyy"
              value={dob}
              onChange={e => setDob(e.target.value)}
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
              onChange={e => setEmail(e.target.value)}
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Phone number</label>
            <input
              className="form-input"
              type="tel"
              placeholder="5551234567"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/[^\d]/g, ''))}
              maxLength={15}
            />
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
              onChange={e => setOwnershipPercentage(e.target.value)}
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
