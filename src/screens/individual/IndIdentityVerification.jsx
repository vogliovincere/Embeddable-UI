import { useState } from 'react'
import alloy from '@alloyidentity/web-sdk'
import { createJourneyApplication } from '../../utils/alloyApi'
import { toIsoDate, toStateAbbr } from '../../utils/formatters'

const JOURNEY_TOKEN = import.meta.env.VITE_JOURNEY_TOKEN
const ALLOY_SDK_KEY = import.meta.env.VITE_ALLOY_SDK

export default function IndIdentityVerification({ formData, goNext, goBack, flowType }) {
  const [status, setStatus] = useState('idle') // idle | loading | success | error | review
  const [errorMsg, setErrorMsg] = useState('')

  const { firstName, lastName, email, phone, dob, taxId, streetAddress, city, addressState, postalCode, addressCountry } = formData.individualData

  const handleLaunchSdk = async () => {
    setStatus('loading')
    setErrorMsg('')

    // Build personData for journey application
    const personData = {
      name_first: firstName || undefined,
      name_last: lastName || undefined,
      email_address: email || undefined,
      phone_number: phone || undefined,
      birth_date: toIsoDate(dob) || undefined,
      document_ssn: taxId ? taxId.replace(/-/g, '') : undefined,
    }

    // Only include address if primary fields are populated
    if (streetAddress && city && addressState && postalCode) {
      personData.addresses = [{
        line_1: streetAddress,
        city: city,
        state: toStateAbbr(addressState),
        postal_code: postalCode,
        country_code: addressCountry?.code || 'US',
        type: 'primary',
      }]
    }

    let journeyApplicationToken = null

    // Attempt to create journey application; fall back to SDK-only flow on failure
    try {
      const appResult = await createJourneyApplication(personData)
      console.log('Journey application result:', appResult)

      const apiStatus = appResult.status
      const completeOutcome = appResult.complete_outcome

      // Only use the token if the application is not already completed
      if (apiStatus !== 'completed') {
        journeyApplicationToken = appResult.journey_application_token
      }

      // If already completed (rare - no doc verification needed)
      if (apiStatus === 'completed') {
        if (completeOutcome === 'Approved') {
          setStatus('success')
          setTimeout(() => goNext(), 1200)
        } else {
          setStatus('error')
          setErrorMsg('Verification was not approved. Please try again or contact support.')
        }
        return
      }
    } catch (apiErr) {
      console.warn('Journey application API failed (CORS or network), falling back to SDK-only flow:', apiErr)
      // Continue without journeyApplicationToken - preserves existing functionality
    }

    try {
      const initParams = {
        key: ALLOY_SDK_KEY,
        journeyToken: JOURNEY_TOKEN,
        production: false,
        evaluationData: {
          nameFirst: firstName || undefined,
          nameLast: lastName || undefined,
          birthDate: dob || undefined,
        },
      }

      if (journeyApplicationToken) {
        initParams.journeyApplicationToken = journeyApplicationToken
      }

      alloy.close()
      await alloy.init(initParams)

      alloy.open((result) => {
        console.log('Alloy SDK result:', result)
        const sdkEvent = result.sdk?.sdkEvent
        const appStatus = (result.journey_application_status || '').toLowerCase()
        const outcome = (result.complete_outcome || result.recent_outcome || '').toLowerCase()

        if (sdkEvent === 'completed' || result.status === 'completed') {
          if (appStatus === 'approved' || outcome === 'approved') {
            setStatus('success')
            setTimeout(() => goNext(), 1200)
          } else if (appStatus === 'denied' || outcome === 'denied') {
            setStatus('error')
            setErrorMsg('Verification was not approved. Please try again or contact support.')
          } else {
            // pending manual review
            setStatus('review')
          }
        } else if (sdkEvent === 'closed' || result.status === 'closed') {
          setStatus('idle')
        } else {
          setStatus('idle')
        }
      })
    } catch (err) {
      console.error('Alloy SDK error:', err)
      setStatus('error')
      setErrorMsg(err.message || 'Failed to initialize verification. Please try again.')
    }
  }

  return (
    <>
      <div className="progress-bar">
        {Array.from({ length: flowType === 'joint' ? 5 : 4 }).map((_, i) => (
          <div key={i} className={`progress-segment ${i <= 3 ? 'active' : ''}`} />
        ))}
      </div>
      <div className="header">
        <button className="back-button" onClick={goBack}>←</button>
        <button className="lang-selector">En</button>
      </div>
      <div className="screen-content">
        {status === 'success' ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '40px 0',
          }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'var(--color-success)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
            }}>
              ✓
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-heading)' }}>
              Identity verified
            </p>
            <p style={{ fontSize: 14, color: 'var(--color-text)', textAlign: 'center' }}>
              Proceeding to submission...
            </p>
          </div>
        ) : status === 'review' ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '40px 0',
          }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: '#FEF3C7',
              color: '#B45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
            }}>
              &#128269;
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-heading)' }}>
              Under Review
            </p>
            <p style={{ fontSize: 14, color: 'var(--color-text)', textAlign: 'center' }}>
              Your verification is being reviewed. We'll notify you once complete.
            </p>
          </div>
        ) : (
          <>
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              paddingTop: 24,
            }}>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: '#EEF2FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
                marginBottom: 24,
              }}>
                🪪
              </div>
              <h1 style={{ marginBottom: 12 }}>Identity Verification</h1>
              <p style={{
                fontSize: 14,
                color: 'var(--color-text)',
                lineHeight: 1.6,
                marginBottom: 32,
                maxWidth: 300,
              }}>
                Complete your identity verification by following these two steps:
              </p>

              <div style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                marginBottom: 32,
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '16px 20px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-white)',
                  textAlign: 'left',
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: '#EEF2FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    minWidth: 40,
                  }}>
                    1
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-heading)' }}>
                      Snap a photo of your ID
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--color-text)', marginTop: 2 }}>
                      or upload a document image
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '16px 20px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-white)',
                  textAlign: 'left',
                }}>
                  <div style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: '#EEF2FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--color-primary)',
                    minWidth: 40,
                  }}>
                    2
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-heading)' }}>
                      Take a selfie
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--color-text)', marginTop: 2 }}>
                      to verify your identity
                    </div>
                  </div>
                </div>
              </div>

              {status === 'error' && (
                <div style={{
                  width: '100%',
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: 'var(--radius-sm)',
                  padding: 14,
                  marginBottom: 16,
                }}>
                  <p style={{ fontSize: 13, color: '#991B1B', lineHeight: 1.5 }}>
                    {errorMsg || 'Verification failed. Please try again.'}
                  </p>
                </div>
              )}
            </div>

            <div className="button-group">
              <button
                className="btn btn-primary"
                onClick={handleLaunchSdk}
                disabled={status === 'loading'}
              >
                {status === 'loading'
                  ? <span className="loading-dots"><span /><span /><span /></span>
                  : status === 'error'
                    ? 'Try again'
                    : 'Begin verification'
                }
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
