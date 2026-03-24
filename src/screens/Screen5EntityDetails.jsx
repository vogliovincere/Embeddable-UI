import { useState } from 'react'
import { countries } from '../data/countries'
import { usStates } from '../data/usStates'

export default function Screen5EntityDetails({ formData, dispatch, goNext, goBack }) {
  const [errors, setErrors] = useState({})
  const [showCountryModal, setShowCountryModal] = useState(false)
  const [showStateModal, setShowStateModal] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const [stateSearch, setStateSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const { country, state, entityName, fileNumber } = formData.entityDetails
  const isUS = country?.code === 'US'

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  )

  const filteredStates = usStates.filter(s =>
    s.toLowerCase().includes(stateSearch.toLowerCase())
  )

  const validate = () => {
    const errs = {}
    if (!country) errs.country = 'This field is required'
    if (isUS && !state) errs.state = 'This field is required'
    if (!entityName.trim()) errs.entityName = 'This field is required'
    if (!fileNumber.trim()) errs.fileNumber = 'This field is required'
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

  return (
    <>
      <div className="progress-bar">
        <div className="progress-segment active" />
        <div className="progress-segment" />
        <div className="progress-segment" />
        <div className="progress-segment" />
      </div>
      <div className="header">
        <button className="back-button" onClick={goBack}>←</button>
        <button className="lang-selector">En</button>
      </div>
      <div className="screen-content">
        <div className="card">
          <h1>Entity information</h1>
          <p className="subtitle">Please provide your entity's registration details</p>

          <div className="form-group">
            <label className="form-label">
              Country of entity registration <span className="required">*</span>
            </label>
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

          {isUS && (
            <div className="form-group">
              <label className="form-label">
                State <span className="required">*</span>
              </label>
              <button
                className={`select-trigger ${errors.state ? 'error' : ''}`}
                onClick={() => setShowStateModal(true)}
              >
                {state ? (
                  <span>{state}</span>
                ) : (
                  <span className="placeholder">Select state</span>
                )}
              </button>
              {errors.state && <div className="form-error">{errors.state}</div>}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Entity name <span className="required">*</span>
            </label>
            <input
              className={`form-input ${errors.entityName ? 'error' : ''}`}
              type="text"
              placeholder="Enter entity name"
              value={entityName}
              onChange={e => dispatch({ type: 'SET_ENTITY_DETAILS', payload: { entityName: e.target.value } })}
            />
            {errors.entityName && <div className="form-error">{errors.entityName}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">
              File number <span className="required">*</span>
            </label>
            <input
              className={`form-input ${errors.fileNumber ? 'error' : ''}`}
              type="text"
              placeholder="File Number"
              value={fileNumber}
              onChange={e => dispatch({ type: 'SET_ENTITY_DETAILS', payload: { fileNumber: e.target.value } })}
            />
            <div className="form-helper">
              Can be found on your registration documents you receive from the registrar such as account reminders.
            </div>
            {errors.fileNumber && <div className="form-error">{errors.fileNumber}</div>}
          </div>
        </div>

        <div className="button-group">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="loading-dots"><span /><span /><span /></span> : 'Save and continue'}
          </button>
        </div>
      </div>

      {showCountryModal && (
        <div className="modal-overlay">
          <div className="modal-content">
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
                    dispatch({ type: 'SET_ENTITY_DETAILS', payload: { country: c, state: '' } })
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
        </div>
      )}

      {showStateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Select state</h2>
              <button className="modal-close" onClick={() => setShowStateModal(false)}>✕</button>
            </div>
            <div className="modal-search">
              <span className="search-icon">🔍</span>
              <input
                placeholder="Search states..."
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
                    dispatch({ type: 'SET_ENTITY_DETAILS', payload: { state: s } })
                    setShowStateModal(false)
                    setStateSearch('')
                  }}
                >
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
