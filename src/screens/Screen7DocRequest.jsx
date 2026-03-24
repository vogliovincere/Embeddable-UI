import { useState, useRef } from 'react'

function UploadZone({ label, description, file, onUpload, onRemove, required }) {
  const inputRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) onUpload(f.name)
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ marginBottom: 6 }}>{label}</h3>
      <p style={{ fontSize: 14, color: 'var(--color-text)', lineHeight: 1.5, marginBottom: 12 }}>
        {description}
        {required && <span style={{ color: 'var(--color-error)' }}> *</span>}
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

export default function Screen7DocRequest({ formData, dispatch, goNext, goBack }) {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { signatoryList, structureDiagram } = formData.supplementaryDocs

  const validate = () => {
    const errs = {}
    if (!signatoryList) errs.signatoryList = true
    if (!structureDiagram) errs.structureDiagram = true
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleContinue = () => {
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
        <div className="progress-segment active" />
        <div className="progress-segment" />
        <div className="progress-segment" />
      </div>
      <div className="header">
        <button className="back-button" onClick={goBack}>←</button>
        <button className="lang-selector">En</button>
      </div>
      <div className="screen-content">
        <div className="card">
          <h1>Corporate KYC Document Request</h1>

          <UploadZone
            label="Authorised Signatory List"
            description="Please upload a signed authorised signatory list below"
            file={signatoryList}
            required
            onUpload={name => dispatch({ type: 'SET_SUPPLEMENTARY_DOC', field: 'signatoryList', payload: name })}
            onRemove={() => dispatch({ type: 'SET_SUPPLEMENTARY_DOC', field: 'signatoryList', payload: null })}
          />
          {errors.signatoryList && !signatoryList && (
            <div className="form-error" style={{ marginTop: -16, marginBottom: 16 }}>Please upload this document</div>
          )}

          <UploadZone
            label="Structure Diagram"
            description="Please upload a structure diagram, outlining the organisational structure and/or ownership structure"
            file={structureDiagram}
            required
            onUpload={name => dispatch({ type: 'SET_SUPPLEMENTARY_DOC', field: 'structureDiagram', payload: name })}
            onRemove={() => dispatch({ type: 'SET_SUPPLEMENTARY_DOC', field: 'structureDiagram', payload: null })}
          />
          {errors.structureDiagram && !structureDiagram && (
            <div className="form-error" style={{ marginTop: -16, marginBottom: 16 }}>Please upload this document</div>
          )}
        </div>

        <div className="button-group">
          <button className="btn btn-primary" onClick={handleContinue} disabled={loading}>
            {loading ? <span className="loading-dots"><span /><span /><span /></span> : 'Continue'}
          </button>
        </div>
      </div>
    </>
  )
}
