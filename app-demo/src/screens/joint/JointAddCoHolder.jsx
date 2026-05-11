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

  const handleDobChange = (e) => {
    let val = e.target.value.replace(/[^\d]/g, '')
    if (val.length > 8) val = val.slice(0, 8)
    if (val.length >= 5) {
      val = val.slice(0, 2) + '/' + val.slice(2, 4) + '/' + val.slice(4)
    } else if (val.length >= 3) {
      val = val.slice(0, 2) + '/' + val.slice(2)
    }
    setDob(val)
  }

  const validate = () => {
    const errs = {}
    if (!firstName.trim()) errs.firstName = 'This field is required'
    if (!lastName.trim()) errs.lastName = 'This field is required'
    if (!dob.trim()) errs.dob = 'This field is required'
    if (dob && !/^\d{2}\/\d{2}\/\d{4}$/.test(dob)) errs.dob = 'The date must be valid (mm/dd/yyyy)'
    if (!email.trim()) errs.email = 'This field is required'
    if (!phone.trim()) errs.phone = 'This field is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
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
            <label className="form-label">Date of birth <span className="required">*</span></label>
            <input
              className={`form-input ${errors.dob ? 'error' : ''}`}
              type="text"
              placeholder="MM/DD/YYYY"
              value={dob}
              onChange={handleDobChange}
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
              onChange={e => setEmail(e.target.value)}
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
              onChange={e => setPhone(e.target.value.replace(/[^\d]/g, ''))}
              maxLength={15}
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
