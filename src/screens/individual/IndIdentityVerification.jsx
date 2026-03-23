import { useState } from 'react'
import alloy from '@alloyidentity/web-sdk'
import ContinueOnPhoneModal from '../../components/ContinueOnPhoneModal'

const JOURNEY_TOKEN = import.meta.env.VITE_JOURNEY_TOKEN
const ALLOY_SDK_KEY = import.meta.env.VITE_ALLOY_SDK

export default function IndIdentityVerification({ formData, goNext, goBack }) {
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const [showPhoneModal, setShowPhoneModal] = useState(false)

  const { firstName, lastName, dob } = formData.individualData

  const handleLaunchSdk = async () => {
    setStatus('loading')
    setErrorMsg('')
    try {
      await alloy.init({
        key: ALLOY_SDK_KEY,
        journeyToken: JOURNEY_TOKEN,
        production: false,
        selfie: true,
        documents: ['license', 'passport'],
        evaluationData: {
          nameFirst: firstName || undefined,
          nameLast: lastName || undefined,
          birthDate: dob || undefined,
        },
      })

      alloy.open((result) => {
        console.log('Alloy SDK result:', result)
        if (result.status === 'completed') {
          const approved = result.journey_application_status === 'approved'
          setStatus(approved ? 'success' : 'error')
          if (approved) {
            setTimeout(() => goNext(), 1200)
          } else {
            setErrorMsg('Verification was not approved. Please try again.')
          }
        } else if (result.status === 'closed') {
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
        <div className="progress-segment active" />
        <div className="progress-segment active" />
        <div className="progress-segment active" />
        <div className="progress-segment active" />
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
              <button className="btn btn-secondary" onClick={() => setShowPhoneModal(true)}>
                Continue on phone
              </button>
            </div>
          </>
        )}
      </div>

      {showPhoneModal && <ContinueOnPhoneModal onClose={() => setShowPhoneModal(false)} />}
    </>
  )
}
