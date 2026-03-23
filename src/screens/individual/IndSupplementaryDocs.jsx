import { useState, useRef } from 'react'
import ContinueOnPhoneModal from '../../components/ContinueOnPhoneModal'

const proofOfAddressTypes = [
  'Utility bill',
  'Bank statement',
  'Government correspondence',
]

/**
 * Inline upload zone rendered after a document type is selected.
 * Shows a dashed drop zone; once a file is chosen it shows a file-pill
 * with a remove button.
 */
function InlineUploadZone({ docType, onUpload, onCancel }) {
  const inputRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) onUpload(f.name, docType)
  }

  return (
    <div style={{ marginTop: 8 }}>
      <div
        className="upload-zone"
        style={{ padding: '20px 16px' }}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="cloud-icon" style={{ fontSize: 24 }}>&#9729;&#65039;</div>
        <div className="upload-text" style={{ fontSize: 13 }}>
          Upload <strong>{docType}</strong>
        </div>
        <div style={{ fontSize: 12 }}>
          <span className="upload-link">Choose</span> or drag and drop
        </div>
        <div className="upload-formats">JPG, PNG, HEIC, WEBP or PDF (max 10 MB)</div>
      </div>
      <button
        className="btn-ghost"
        style={{ fontSize: 12, padding: '6px 0', marginTop: 4, display: 'block' }}
        onClick={onCancel}
      >
        Cancel
      </button>
      <input
        ref={inputRef}
        type="file"
        style={{ display: 'none' }}
        accept=".jpg,.jpeg,.png,.heic,.webp,.pdf"
        onChange={e => {
          const f = e.target.files[0]
          if (f) onUpload(f.name, docType)
          e.target.value = ''
        }}
      />
    </div>
  )
}

export default function IndSupplementaryDocs({ formData, dispatch, goNext, goBack, contextId, flowType }) {
  const [loading, setLoading] = useState(false)
  const [validationAttempted, setValidationAttempted] = useState(false)
  // null = no pending upload; string = doc type selected, awaiting file
  const [pendingDocType, setPendingDocType] = useState(null)
  const [showTypeModal, setShowTypeModal] = useState(false)
  const [showPhoneModal, setShowPhoneModal] = useState(false)

  const proofDocs = formData.individualData.proofOfAddress || []
  const fulfilled = proofDocs.length > 0
  const totalSteps = flowType === 'joint' ? 5 : 4

  const handleContinue = () => {
    setValidationAttempted(true)
    if (!fulfilled) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      goNext()
    }, 1500)
  }

  const handleDocTypeSelect = (dt) => {
    setShowTypeModal(false)
    setPendingDocType(dt)
  }

  const handleUpload = (fileName, docType) => {
    const updated = [...proofDocs, { name: fileName, type: docType }]
    dispatch({ type: 'SET_INDIVIDUAL_DATA', payload: { proofOfAddress: updated } })
    setPendingDocType(null)
  }

  const removeDoc = (index) => {
    const updated = proofDocs.filter((_, i) => i !== index)
    dispatch({ type: 'SET_INDIVIDUAL_DATA', payload: { proofOfAddress: updated } })
  }

  return (
    <>
      <div className="progress-bar">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={`progress-segment ${i <= 2 ? 'active' : ''}`} />
        ))}
      </div>
      <div className="header">
        <button className="back-button" onClick={goBack}>&#8592;</button>
        <button className="lang-selector">En</button>
      </div>
      <div className="screen-content">
        <h1>Supplementary documents</h1>
        <p className="subtitle">
          Upload the required documents below. Documents must be dated within the last 3 months.
        </p>

        <div className="doc-category">
          <div className="doc-category-header">
            <div className={`doc-status-icon ${fulfilled ? 'fulfilled' : 'missing'}`}>
              {fulfilled ? '✓' : '!'}
            </div>
            <span className="doc-category-name">Proof of address</span>
          </div>

          <p style={{ fontSize: 13, color: 'var(--color-text)', marginBottom: 12, lineHeight: 1.4 }}>
            Accepted: utility bill, bank statement, or government correspondence.
          </p>

          {validationAttempted && !fulfilled && (
            <div className="doc-validation-msg">
              You need to upload at least one document for Proof of address
            </div>
          )}

          {proofDocs.map((doc, i) => (
            <div key={i} className="doc-uploaded-item">
              <div className="doc-thumb">&#128196;</div>
              <div className="doc-name">
                <div>{doc.name}</div>
                <div style={{ fontSize: 11, color: 'var(--color-gray-400)' }}>{doc.type}</div>
              </div>
              <button className="doc-delete" onClick={() => removeDoc(i)}>&#128465;</button>
            </div>
          ))}

          {pendingDocType ? (
            <InlineUploadZone
              docType={pendingDocType}
              onUpload={handleUpload}
              onCancel={() => setPendingDocType(null)}
            />
          ) : (
            <button
              className="add-person-link"
              onClick={() => setShowTypeModal(true)}
            >
              + Select document type
            </button>
          )}
        </div>

        <div className="button-group">
          <button className="btn btn-primary" onClick={handleContinue} disabled={loading}>
            {loading ? <span className="loading-dots"><span /><span /><span /></span> : 'Continue'}
          </button>
          <button className="btn btn-secondary" onClick={() => setShowPhoneModal(true)}>
            Continue on phone
          </button>
        </div>
      </div>

      {showPhoneModal && <ContinueOnPhoneModal onClose={() => setShowPhoneModal(false)} />}

      {showTypeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Select document type</h2>
              <button className="modal-close" onClick={() => setShowTypeModal(false)}>&#10005;</button>
            </div>
            <div className="modal-list">
              {proofOfAddressTypes.map(dt => (
                <div
                  key={dt}
                  className="modal-list-item"
                  onClick={() => handleDocTypeSelect(dt)}
                >
                  <span>&#128196;</span>
                  <span>{dt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
