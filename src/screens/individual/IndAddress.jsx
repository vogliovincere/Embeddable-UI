import { useState } from 'react'
import { createPortal } from 'react-dom'
import { countries } from '../../data/countries'
import { usStates } from '../../data/usStates'

export default function IndAddress({ formData, dispatch, goNext, goBack, contextId, flowType }) {
  const [errors, setErrors] = useState({})
  const [showCountryModal, setShowCountryModal] = useState(false)
  const [showStateModal, setShowStateModal] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const [stateSearch, setStateSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const { addressCountry, addressState, streetAddress, city, postalCode, apartment } = formData.individualData
  const isUS = addressCountry?.code === 'US'
  const isCA = addressCountry?.code === 'CA'
  const showSubdivision = isUS || isCA
  const totalSteps = flowType === 'joint' ? 5 : 4

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  )

  const filteredStates = usStates.filter(s =>
    s.toLowerCase().includes(stateSearch.toLowerCase())
  )

  const validate = () => {
    const errs = {}
    if (!addressCountry) errs.addressCountry = 'This field is required'
    if (showSubdivision && !addressState) errs.addressState = 'This field is required'
    if (!streetAddress.trim()) errs.streetAddress = 'This field is required'
    if (!city.trim()) errs.city = 'This field is required'
    if (!postalCode.trim()) errs.postalCode = 'This field is required'
    if (isUS && postalCode.trim() && !/^\d{5}(-\d{4})?$/.test(postalCode.trim())) {
      errs.postalCode = 'Enter a valid US ZIP code (e.g., 12345 or 12345-6789)'
    }
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

  return (
    <>
      <div className="progress-bar">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={`progress-segment ${i <= 1 ? 'active' : ''}`} />
        ))}
      </div>
      <div className="header">
        <button className="back-button" onClick={goBack}>←</button>
        <button className="lang-selector">En</button>
      </div>
      <div className="screen-content">
        <div className="card">
          <h1>Address information</h1>
          <p className="subtitle">Please provide your current residential address</p>

          <div className="form-group">
            <label className="form-label">
              Country <span className="required">*</span>
            </label>
            <button
              className={`select-trigger ${errors.addressCountry ? 'error' : ''}`}
              onClick={() => setShowCountryModal(true)}
            >
              {addressCountry ? (
                <>
                  <span style={{ fontSize: 16 }}>{addressCountry.flag}</span>
                  <span>{addressCountry.name}</span>
                </>
              ) : (
                <span className="placeholder">Select country</span>
              )}
            </button>
            {errors.addressCountry && <div className="form-error">{errors.addressCountry}</div>}
          </div>

          {showSubdivision && (
            <div className="form-group">
              <label className="form-label">
                {isUS ? 'State' : 'Province'} <span className="required">*</span>
              </label>
              <button
                className={`select-trigger ${errors.addressState ? 'error' : ''}`}
                onClick={() => setShowStateModal(true)}
              >
                {addressState ? (
                  <span>{addressState}</span>
                ) : (
                  <span className="placeholder">Select {isUS ? 'state' : 'province'}</span>
                )}
              </button>
              {errors.addressState && <div className="form-error">{errors.addressState}</div>}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Street address <span className="required">*</span>
            </label>
            <input
              className={`form-input ${errors.streetAddress ? 'error' : ''}`}
              type="text"
              placeholder="Enter street address"
              value={streetAddress}
              onChange={e => updateField('streetAddress', e.target.value)}
            />
            {errors.streetAddress && <div className="form-error">{errors.streetAddress}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Apartment / Suite / Unit
            </label>
            <input
              className="form-input"
              type="text"
              placeholder="Apt, suite, unit (optional)"
              value={apartment}
              onChange={e => updateField('apartment', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              City / Town <span className="required">*</span>
            </label>
            <input
              className={`form-input ${errors.city ? 'error' : ''}`}
              type="text"
              placeholder="Enter city or town"
              value={city}
              onChange={e => updateField('city', e.target.value)}
            />
            {errors.city && <div className="form-error">{errors.city}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Postal / ZIP code <span className="required">*</span>
            </label>
            <input
              className={`form-input ${errors.postalCode ? 'error' : ''}`}
              type="text"
              placeholder="Enter postal code"
              value={postalCode}
              onChange={e => updateField('postalCode', e.target.value)}
            />
            {errors.postalCode && <div className="form-error">{errors.postalCode}</div>}
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
                    updateField('addressCountry', c)
                    updateField('addressState', '')
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
                    updateField('addressState', s)
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
