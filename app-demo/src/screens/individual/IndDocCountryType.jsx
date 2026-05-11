import { useState } from 'react'
import { createPortal } from 'react-dom'
import { countries } from '../../data/countries'
import { getDocTypesForCountry } from '../../data/identityDocTypes'

export default function IndDocCountryType({ formData, dispatch, goNext, goBack, contextId, flowType }) {
  const [errors, setErrors] = useState({})
  const [showCountryModal, setShowCountryModal] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const [loading, setLoading] = useState(false)

  const { idCountry, idDocType } = formData.individualData
  const totalSteps = flowType === 'joint' ? 5 : 4

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.toLowerCase().includes(countrySearch.toLowerCase())
  )

  const availableDocTypes = idCountry ? getDocTypesForCountry(idCountry.code) : []

  const validate = () => {
    const errs = {}
    if (!idCountry) errs.idCountry = 'This field is required'
    if (!idDocType) errs.idDocType = 'This field is required'
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

  const selectCountry = (c) => {
    dispatch({
      type: 'SET_INDIVIDUAL_DATA',
      payload: {
        idCountry: c,
        idDocType: '',
        idDocFront: null,
        idDocBack: null,
      },
    })
    setShowCountryModal(false)
    setCountrySearch('')
  }

  const selectDocType = (dt) => {
    dispatch({
      type: 'SET_INDIVIDUAL_DATA',
      payload: { idDocType: dt, idDocFront: null, idDocBack: null },
    })
  }

  return (
    <>
      <div className="progress-bar">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={`progress-segment ${i <= 3 ? 'active' : ''}`} />
        ))}
      </div>
      <div className="header">
        <button className="back-button" onClick={goBack}>←</button>
        <button className="lang-selector">En</button>
      </div>
      <div className="screen-content">
        <div className="card">
          <h1>Identity document</h1>
          <p className="subtitle">Select the issuing country and document type</p>

          <div className="form-group">
            <label className="form-label">
              Issuing country <span className="required">*</span>
            </label>
            <button
              className={`select-trigger ${errors.idCountry ? 'error' : ''}`}
              onClick={() => setShowCountryModal(true)}
            >
              {idCountry ? (
                <>
                  <span style={{ fontSize: 16 }}>{idCountry.flag}</span>
                  <span>{idCountry.name}</span>
                </>
              ) : (
                <span className="placeholder">Select country</span>
              )}
            </button>
            {errors.idCountry && <div className="form-error">{errors.idCountry}</div>}
          </div>

          {idCountry && (
            <div className="form-group">
              <label className="form-label">
                Document type <span className="required">*</span>
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {availableDocTypes.map(dt => (
                  <label
                    key={dt}
                    className="radio-option"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '12px 14px',
                      border: `1px solid ${idDocType === dt ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      background: idDocType === dt ? 'var(--color-primary-soft)' : 'var(--color-white)',
                      transition: 'all 0.15s',
                    }}
                    onClick={() => selectDocType(dt)}
                  >
                    <input
                      type="radio"
                      name="docType"
                      checked={idDocType === dt}
                      readOnly
                      style={{ accentColor: 'var(--color-primary)', width: 18, height: 18 }}
                    />
                    <span style={{ fontSize: 15, color: 'var(--color-heading)', fontWeight: idDocType === dt ? 600 : 400 }}>
                      {dt}
                    </span>
                  </label>
                ))}
              </div>
              {errors.idDocType && <div className="form-error">{errors.idDocType}</div>}
            </div>
          )}

          <div style={{ fontSize: 12, color: 'var(--color-text)', marginTop: 8 }}>
            <span style={{ color: 'var(--color-error)' }}>*</span> Required fields
          </div>
        </div>

        <div className="button-group">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="loading-dots"><span /><span /><span /></span> : 'Continue'}
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
                  onClick={() => selectCountry(c)}
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
    </>
  )
}
