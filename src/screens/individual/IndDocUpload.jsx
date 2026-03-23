import { useState, useRef } from 'react'
import { docUploadSides } from '../../data/identityDocTypes'
import ContinueOnPhoneModal from '../../components/ContinueOnPhoneModal'

function UploadZone({ label, file, onUpload, onRemove }) {
  const inputRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) onUpload(f.name)
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-heading)', marginBottom: 8 }}>
        {label}
      </p>
      {file ? (
        <div className="upload-zone has-file">
          <div className="file-info">
            <span>📄</span>
            <span>{file}</span>
            <button className="remove-file" onClick={onRemove}>✕</button>
          </div>
        </div>
      ) : (
        <div
          className="upload-zone"
          onClick={() => inputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="cloud-icon">☁️</div>
          <div className="upload-text">Upload file</div>
          <div>
            <span className="upload-link">Choose</span> or drag and drop
          </div>
          <div className="upload-formats">JPG, PNG, HEIC, WEBP or PDF (max 10 MB)</div>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        style={{ display: 'none' }}
        accept=".jpg,.jpeg,.png,.heic,.webp,.pdf"
        onChange={e => {
          const f = e.target.files[0]
          if (f) onUpload(f.name)
          e.target.value = ''
        }}
      />
    </div>
  )
}

export default function IndDocUpload({ formData, dispatch, goNext, goBack, contextId }) {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showPhoneModal, setShowPhoneModal] = useState(false)

  const { idCountry, idDocType, idDocFront, idDocBack } = formData.individualData
  const sides = docUploadSides[idDocType] || ['Front side']
  const needsBack = sides.length > 1
  const totalSteps = 4

  const validate = () => {
    const errs = {}
    if (!idDocFront) errs.front = true
    if (needsBack && !idDocBack) errs.back = true
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleUpload = () => {
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
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {idCountry && <span style={{ fontSize: 20 }}>{idCountry.flag}</span>}
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-heading)' }}>
                {idDocType}
              </span>
            </div>
            <button
              onClick={goBack}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-accent)',
                cursor: 'pointer',
                fontSize: 18,
              }}
              title="Change selection"
            >
              ✏️
            </button>
          </div>

          <p className="subtitle" style={{ marginBottom: 16 }}>
            Ensure all details on the photo are visible and easy to read.
          </p>

          <UploadZone
            label={sides[0]}
            file={idDocFront}
            onUpload={name => dispatch({ type: 'SET_INDIVIDUAL_DATA', payload: { idDocFront: name } })}
            onRemove={() => dispatch({ type: 'SET_INDIVIDUAL_DATA', payload: { idDocFront: null } })}
          />
          {errors.front && !idDocFront && (
            <div className="form-error" style={{ marginTop: -8, marginBottom: 12 }}>Please upload this document</div>
          )}

          {needsBack && (
            <>
              <UploadZone
                label={sides[1]}
                file={idDocBack}
                onUpload={name => dispatch({ type: 'SET_INDIVIDUAL_DATA', payload: { idDocBack: name } })}
                onRemove={() => dispatch({ type: 'SET_INDIVIDUAL_DATA', payload: { idDocBack: null } })}
              />
              {errors.back && !idDocBack && (
                <div className="form-error" style={{ marginTop: -8, marginBottom: 12 }}>Please upload this document</div>
              )}
            </>
          )}
        </div>

        <div className="button-group">
          <button className="btn btn-primary" onClick={handleUpload} disabled={loading}>
            {loading ? <span className="loading-dots"><span /><span /><span /></span> : 'Upload document'}
          </button>
          <button className="btn btn-secondary" onClick={() => setShowPhoneModal(true)}>
            Continue on phone
          </button>
        </div>
      </div>

      {showPhoneModal && <ContinueOnPhoneModal onClose={() => setShowPhoneModal(false)} />}
    </>
  )
}
