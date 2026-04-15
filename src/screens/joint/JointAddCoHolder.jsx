import { useState } from 'react'
import { createPortal } from 'react-dom'
import { countries } from '../../data/countries'
import { usStates } from '../../data/usStates'

export default function JointAddCoHolder({ formData, dispatch, goTo }) {
  const editIndex = formData.jointData.editingCoHolderIndex
  const isEditing = editIndex !== null
  const existing = isEditing ? formData.jointData.coHolders[editIndex] : null

  const [firstName, setFirstName] = useState(existing?.firstName || '')
  const [lastName, setLastName] = useState(existing?.lastName || '')
  const [dob, setDob] = useState(existing?.dob || '')
  const [email, setEmail] = useState(existing?.email || '')
  const [phone, setPhone] = useState(existing?.phone || '')
  const [country, setCountry] = useState(existing?.country || null)
  const [addrState, setAddrState] = useState(existing?.state || '')
  const [streetAddress, setStreetAddress] = useState(existing?.streetAddress || '')
  const [city, setCity] = useState(existing?.city || '')
  const [postalCode, setPostalCode] = useState(existing?.postalCode || '')
  const [apartment, setApartment] = useState(existing?.apartment || '')
  const [errors, setErrors] = useState({})
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
    if (!country) errs.country = 'This field is required'
    if (showSubdivision && !addrState) errs.addrState = 'This field is required'
    if (!streetAddress.trim()) errs.streetAddress = 'This field is required'
    if (!city.trim()) errs.city = 'This field is required'
    if (!postalCode.trim()) errs.postalCode = 'This field is required'
    if (isUS && postalCode.trim() && !/^\d{5}(-\d{4})?$/.test(postalCode.trim())) {
      errs.postalCode = 'Enter a valid US ZIP code'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    setLoading(true)
    setTimeout(() => {
      const coHolder = {
        firstName, lastName, dob, email, phone,
        country, state: addrState, streetAddress, city, postalCode, apartment,
      }
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
              : 'Provide contact and address information. They will receive a link to verify their identity independently.'}
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

        <div className="button-group">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="loading-dots"><span /><span /><span /></span> : (isEditing ? 'Update co-holder' : 'Add co-holder')}
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
              <span className="search-icon emoji-deco">🔍</span>
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
              <span className="search-icon emoji-deco">🔍</span>
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
