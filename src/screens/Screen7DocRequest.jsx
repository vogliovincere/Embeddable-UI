import { useState, useRef } from 'react'
import { documentCategories } from '../data/documentTypes'

function DocUploadZone({ onUpload }) {
  const inputRef = useRef(null)

  return (
    <>
      <div
        className="upload-zone"
        style={{ padding: '20px 16px', marginTop: 8 }}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => {
          e.preventDefault()
          const f = e.dataTransfer.files[0]
          if (f) onUpload(f.name)
        }}
      >
        <div className="cloud-icon" style={{ fontSize: 24 }}>☁️</div>
        <div className="upload-text" style={{ fontSize: 13 }}>Upload file</div>
        <div style={{ fontSize: 12 }}>
          <span className="upload-link">Choose</span> or drag and drop
        </div>
        <div className="upload-formats">JPG, PNG, HEIC, WEBP or PDF (max 10 MB)</div>
      </div>
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
    </>
  )
}

export default function Screen7DocRequest({ formData, dispatch, goNext, goBack }) {
  const [loading, setLoading] = useState(false)
  const [validationAttempted, setValidationAttempted] = useState(false)

  const allFulfilled = documentCategories.every(
    cat => formData.entityDocs[cat.id]?.length > 0
  )

  const handleContinue = () => {
    setValidationAttempted(true)
    if (!allFulfilled) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      goNext()
    }, 1500)
  }

  const addDoc = (categoryId, fileName, docType) => {
    const current = formData.entityDocs[categoryId] || []
    dispatch({
      type: 'SET_ENTITY_DOC',
      category: categoryId,
      payload: [...current, { name: fileName, type: docType }],
    })
  }

  const removeDoc = (categoryId, index) => {
    const current = formData.entityDocs[categoryId] || []
    dispatch({
      type: 'SET_ENTITY_DOC',
      category: categoryId,
      payload: current.filter((_, i) => i !== index),
    })
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
        <h1>KYB Document Request</h1>
        <p className="subtitle">
          Upload the document establishing your entity's legal existence.
        </p>
        <p style={{ fontSize: 13, color: 'var(--color-gray-400)', lineHeight: 1.6, marginBottom: 20 }}>
          <strong>Corporations:</strong> Articles / Certificate of Incorporation<br />
          <strong>LLCs:</strong> Articles / Certificate of Organization<br />
          <strong>Partnerships:</strong> Certificate of Limited Partnership<br />
          <strong>Trusts:</strong> Trust Agreement or Certificate of Trust
        </p>

        {documentCategories.map(cat => {
          const docs = formData.entityDocs[cat.id] || []
          const fulfilled = docs.length > 0
          const showError = validationAttempted && !fulfilled

          return (
            <div key={cat.id} className="doc-category">
              <div className="doc-category-header">
                <div className={`doc-status-icon ${fulfilled ? 'fulfilled' : 'missing'}`}>
                  {fulfilled ? '✓' : '!'}
                </div>
                <span className="doc-category-name">{cat.name}</span>
              </div>

              {showError && (
                <div className="doc-validation-msg">
                  You need to upload at least one document for {cat.name}
                </div>
              )}

              {docs.map((doc, i) => (
                <div key={i} className="doc-uploaded-item">
                  <div className="doc-thumb">📄</div>
                  <div className="doc-name">
                    <div>{doc.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-gray-400)' }}>{doc.type}</div>
                  </div>
                  <button className="doc-delete" onClick={() => removeDoc(cat.id, i)}>🗑</button>
                </div>
              ))}

              <DocUploadZone
                onUpload={fileName => addDoc(cat.id, fileName, cat.documentTypes[0])}
              />
            </div>
          )
        })}

        <div className="button-group">
          <button className="btn btn-primary" onClick={handleContinue} disabled={loading}>
            {loading ? <span className="loading-dots"><span /><span /><span /></span> : 'Continue'}
          </button>
        </div>
      </div>
    </>
  )
}
