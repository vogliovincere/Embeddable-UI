import { useState, useRef } from 'react'
import { docUploadSides, docTypeToAlloyCode, docSideName } from '../../data/identityDocTypes'
import { createJourneyApplication, buildJourneyApplication, getEntityToken, uploadEntityDocument } from '../../utils/alloyApi'
import { toIsoDate, toStateAbbr } from '../../utils/formatters'

function UploadZone({ label, file, onUpload, onRemove }) {
  const inputRef = useRef(null)

  const handleDrop = (e) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) onUpload(f)
  }

  // `file` may be a File object (real upload) or a string (dev prefill).
  const fileName = file && typeof file === 'object' ? file.name : file

  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-heading)', marginBottom: 8 }}>
        {label}
      </p>
      {file ? (
        <div className="upload-zone has-file">
          <div className="file-info">
            <span className="emoji-deco">📄</span>
            <span>{fileName}</span>
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
          <div className="cloud-icon emoji-deco">☁️</div>
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
          if (f) onUpload(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}

export default function IndDocUpload({ formData, dispatch, goNext, goBack, flowType }) {
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  const ind = formData.individualData
  const { idCountry, idDocType, idDocFront, idDocBack } = ind
  const sides = docUploadSides[idDocType] || ['Front side']
  const needsBack = sides.length > 1
  const totalSteps = flowType === 'joint' ? 5 : 4

  // Dev "Identity document" prefill sets filenames (strings) with no bytes, so
  // those sides can't be uploaded to Alloy — surface a note rather than fail.
  const hasPrefilledOnly =
    typeof idDocFront === 'string' || (needsBack && typeof idDocBack === 'string')

  const validate = () => {
    const errs = {}
    if (!idDocFront) errs.front = true
    if (needsBack && !idDocBack) errs.back = true
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleUpload = async () => {
    if (!validate()) return
    setLoading(true)
    setSubmitError('')

    try {
      const person = {
        nameFirst: ind.firstName,
        nameLast: ind.lastName,
        email: ind.email,
        phone: ind.phone,
        birthDate: toIsoDate(ind.dob),
        ssn: ind.taxId ? ind.taxId.replace(/-/g, '') : undefined,
        address: (ind.streetAddress && ind.city && ind.addressState && ind.postalCode)
          ? { line1: ind.streetAddress, city: ind.city, state: toStateAbbr(ind.addressState), postalCode: ind.postalCode, countryCode: ind.addressCountry?.code }
          : undefined,
      }

      // KYC Basic: data-only journey. The post-CIP router skips Socure DocV for
      // kycVariant 'basic', so no SDK is launched.
      const appResult = await createJourneyApplication(
        buildJourneyApplication(person, { kycVariant: 'basic' })
      )
      console.log('KYC Basic journey result:', appResult)

      // Attach the uploaded ID document image(s) to the entity so they are
      // viewable against it in Alloy. (This does not change the CIP outcome.)
      const entityToken = getEntityToken(appResult)
      if (entityToken) {
        const alloyType = docTypeToAlloyCode[idDocType] || 'license'
        const uploads = []
        sides.forEach((side, i) => {
          const f = i === 0 ? idDocFront : idDocBack
          if (f && typeof f === 'object') {
            const ext = (f.name?.split('.').pop() || 'jpg').toLowerCase()
            uploads.push(
              uploadEntityDocument(entityToken, { name: docSideName(side), extension: ext, type: alloyType, file: f })
            )
          }
        })
        const settled = await Promise.allSettled(uploads)
        settled.forEach(r => { if (r.status === 'rejected') console.warn('Document upload failed:', r.reason) })
      } else {
        console.warn('No entity token returned; skipping document upload.')
      }

      // Resolve the outcome for the status screen.
      const status = (appResult.status || '').toLowerCase()
      const outcome = (appResult.complete_outcome || appResult.journey_application_status || '').toLowerCase()
      let basicOutcome = 'pending'
      if (outcome === 'approved') basicOutcome = 'approved'
      else if (outcome === 'denied') basicOutcome = 'denied'
      else if (status === 'completed') basicOutcome = 'approved'
      dispatch({ type: 'SET_INDIVIDUAL_DATA', payload: { basicOutcome } })

      setLoading(false)
      goNext()
    } catch (err) {
      console.error('KYC Basic submission failed:', err)
      setLoading(false)
      setSubmitError(err.message || 'Submission failed. Please try again.')
    }
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {idCountry && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 20, lineHeight: 1 }}>{idCountry.flag}</span>
                  <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>
                    {idCountry.name}
                  </span>
                </span>
              )}
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
              <span className="emoji-deco">✏️</span><span className="emoji-fallback">Change</span>
            </button>
          </div>

          <p className="subtitle" style={{ marginBottom: 16 }}>
            Ensure all details on the photo are visible and easy to read.
          </p>

          <UploadZone
            label={sides[0]}
            file={idDocFront}
            onUpload={f => dispatch({ type: 'SET_INDIVIDUAL_DATA', payload: { idDocFront: f } })}
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
                onUpload={f => dispatch({ type: 'SET_INDIVIDUAL_DATA', payload: { idDocBack: f } })}
                onRemove={() => dispatch({ type: 'SET_INDIVIDUAL_DATA', payload: { idDocBack: null } })}
              />
              {errors.back && !idDocBack && (
                <div className="form-error" style={{ marginTop: -8, marginBottom: 12 }}>Please upload this document</div>
              )}
            </>
          )}
        </div>

        {hasPrefilledOnly && (
          <div style={{
            background: '#FEF3C7',
            border: '1px solid #FDE68A',
            borderRadius: 'var(--radius-sm)',
            padding: 12,
            marginBottom: 12,
          }}>
            <p style={{ fontSize: 12, color: '#92400E', lineHeight: 1.5 }}>
              Prefilled documents have no image data — re-select the file to upload the actual image to Alloy.
            </p>
          </div>
        )}

        {submitError && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            borderRadius: 'var(--radius-sm)',
            padding: 14,
            marginBottom: 12,
          }}>
            <p style={{ fontSize: 13, color: '#991B1B', lineHeight: 1.5 }}>{submitError}</p>
          </div>
        )}

        <div className="button-group">
          <button className="btn btn-primary" onClick={handleUpload} disabled={loading}>
            {loading ? <span className="loading-dots"><span /><span /><span /></span> : 'Upload document'}
          </button>
        </div>
      </div>
    </>
  )
}
