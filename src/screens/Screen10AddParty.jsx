import { useState } from 'react'
import { createPortal } from 'react-dom'
import MaskedSsnInput from '../components/MaskedSsnInput'
import { countries } from '../data/countries'
import { usStates } from '../data/usStates'

export default function Screen10AddParty({ formData, dispatch, goTo }) {
  const editIndex = formData.editingPartyIndex
  const isEditing = editIndex !== null
  const existingParty = isEditing ? formData.associatedParties[editIndex] : null

  const [roles, setRoles] = useState(existingParty?.roles || [])
  const [firstName, setFirstName] = useState(existingParty?.firstName || '')
  const [lastName, setLastName] = useState(existingParty?.lastName || '')
  const [middleName, setMiddleName] = useState(existingParty?.middleName || '')
  const [dob, setDob] = useState(existingParty?.dob || '')
  const [email, setEmail] = useState(existingParty?.email || '')
  const [phone, setPhone] = useState(existingParty?.phone || '')
  const [ssn, setSsn] = useState(existingParty?.ssn || '')
  const [country, setCountry] = useState(existingParty?.country || null)
  const [addrState, setAddrState] = useState(existingParty?.state || '')
  const [streetAddress, setStreetAddress] = useState(existingParty?.streetAddress || '')
  const [city, setCity] = useState(existingParty?.city || '')
  const [postalCode, setPostalCode] = useState(existingParty?.postalCode || '')
  const [apartment, setApartment] = useState(existingParty?.apartment || '')
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showCountryModal, setShowCountryModal] = useState(false)
  const [showStateModal, setShowStateModal] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const [stateSearch, setStateSearch] = useState('')

  const isUS = country?.code === 'US'
  const isCA = country?.code === 'CA'
  const showSubdivision = isUS || isCA

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  )

  const filteredStates = usStates.filter(s =>
    s.toLowerCase().includes(stateSearch.toLowerCase())
  )

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
    if (!country) errs.country = 'This field is required'
    if (showSubdivision && !addrState) errs.addrState = 'This field is required'
    if (!streetAddress.trim()) errs.streetAddress = 'This field is required'
    if (!city.trim()) errs.city = 'This field is required'
    if (!postalCode.trim()) errs.postalCode = 'This field is required'
    if (isUS && postalCode.trim() && !/^\d{5}(-\d{4})?$/.test(postalCode.trim())) {
      errs.postalCode = 'Enter a valid US ZIP code'
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
        roles, firstName, lastName, middleName, dob, email, phone, ssn,
        country, state: addrState, streetAddress, city, postalCode, apartment,
      }
      if (isEditing) {
        dispatch({ type: 'UPDATE_PARTY', index: editIndex, payload: party })
      } else {
        dispatch({ type: 'ADD_PARTY', payload: party })
      }
      setLoading(false)
      goTo(9)
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
        <button className="back-button" onClick={() => goTo(9)}>←</button>
        <button className="lang-selector">En</button>
      </div>
      <div className="screen-content">
        <div className="card">
          <h1>{isEditing ? 'Edit' : 'Add'} associated party</h1>
          <p className="subtitle">
            {isEditing ? 'Update the details for this associated party.' : 'If this beneficiary has several roles, you can fill out a questionnaire for them automatically.'}
          </p>

          <div className="form-group">
            <label className="form-label">Role <span className="required">*</span></label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['UBO', 'Director', 'Shareholder'].map(role => (
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
            <label className="form-label">SSN</label>
            <MaskedSsnInput
              className="form-input"
              placeholder="000-00-0000"
              value={ssn}
              onChange={setSsn}
            />
          </div>

          <h2 style={{ fontSize: 16, marginTop: 24, marginBottom: 8 }}>Address</h2>

          <div className="form-group">
            <label className="form-label">Country <span className="required">*</span></label>
            <button
              className={`select-trigger ${errors.country ? 'error' : ''}`}
              onClick={() => setShowCountryModal(true)}
            >
              {country ? (
                <>
                  <span style={{ fontSize: 16 }}>{country.flag}</span>
                  <span>{country.name}</span>
                </>
              ) : (
                <span className="placeholder">Select country</span>
              )}
            </button>
            {errors.country && <div className="form-error">{errors.country}</div>}
          </div>

          {showSubdivision && (
            <div className="form-group">
              <label className="form-label">
                {isUS ? 'State' : 'Province'} <span className="required">*</span>
              </label>
              <button
                className={`select-trigger ${errors.addrState ? 'error' : ''}`}
                onClick={() => setShowStateModal(true)}
              >
                {addrState ? (
                  <span>{addrState}</span>
                ) : (
                  <span className="placeholder">Select {isUS ? 'state' : 'province'}</span>
                )}
              </button>
              {errors.addrState && <div className="form-error">{errors.addrState}</div>}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Street address <span className="required">*</span></label>
            <input
              className={`form-input ${errors.streetAddress ? 'error' : ''}`}
              type="text"
              placeholder="Enter street address"
              value={streetAddress}
              onChange={e => setStreetAddress(e.target.value)}
            />
            {errors.streetAddress && <div className="form-error">{errors.streetAddress}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Apartment / Suite / Unit</label>
            <input
              className="form-input"
              type="text"
              placeholder="Apt, suite, unit (optional)"
              value={apartment}
              onChange={e => setApartment(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">City / Town <span className="required">*</span></label>
            <input
              className={`form-input ${errors.city ? 'error' : ''}`}
              type="text"
              placeholder="Enter city or town"
              value={city}
              onChange={e => setCity(e.target.value)}
            />
            {errors.city && <div className="form-error">{errors.city}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Postal / ZIP code <span className="required">*</span></label>
            <input
              className={`form-input ${errors.postalCode ? 'error' : ''}`}
              type="text"
              placeholder="Enter postal code"
              value={postalCode}
              onChange={e => setPostalCode(e.target.value)}
            />
            {errors.postalCode && <div className="form-error">{errors.postalCode}</div>}
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

      {showCountryModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowCountryModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Select country</h2>
              <button className="modal-close" onClick={() => setShowCountryModal(false)}>✕</button>
            </div>
            <div className="modal-search">
              <span className="search-icon">🔍</span>
              <input
                placeholder="Search countries..."
                value={countrySearch}
                onChange={e => setCountrySearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="modal-list">
              {filteredCountries.map(c => (
                <div
                  key={c.code}
                  className="modal-list-item"
                  onClick={() => {
                    setCountry(c)
                    setAddrState('')
                    setShowCountryModal(false)
                    setCountrySearch('')
                  }}
                >
                  <span className="flag">{c.flag}</span>
                  <span>{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.getElementById('phone-modal-root')
      )}

      {showStateModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowStateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Select {isUS ? 'state' : 'province'}</h2>
              <button className="modal-close" onClick={() => setShowStateModal(false)}>✕</button>
            </div>
            <div className="modal-search">
              <span className="search-icon">🔍</span>
              <input
                placeholder={`Search ${isUS ? 'states' : 'provinces'}...`}
                value={stateSearch}
                onChange={e => setStateSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="modal-list">
              {filteredStates.map(s => (
                <div
                  key={s}
                  className="modal-list-item"
                  onClick={() => {
                    setAddrState(s)
                    setShowStateModal(false)
                    setStateSearch('')
                  }}
                >
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.getElementById('phone-modal-root')
      )}
    </>
  )
}
