/**
 * ContinueOnPhoneModal
 * Reusable modal that appears when the user clicks "Continue on phone".
 * Displays a QR code placeholder and a copy-link option so the user can
 * resume the current step on a mobile device.
 */
export default function ContinueOnPhoneModal({ onClose }) {
  const mockUrl = 'https://verify.interro.co/session/abc123'

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(mockUrl).catch(() => {})
    onClose()
  }

  return (
    <div className="modal-overlay center">
      <div className="modal-content" style={{ padding: 24, width: 360, maxWidth: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2>Continue on phone</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <p style={{ fontSize: 14, color: 'var(--color-text)', lineHeight: 1.5, marginBottom: 20 }}>
          Scan the QR code with your phone or copy the link to resume this step on your mobile device. All your progress will be saved.
        </p>

        {/* QR code placeholder */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          padding: '20px 0',
        }}>
          <div style={{
            width: 160,
            height: 160,
            background: '#F8FAFC',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontSize: 13,
            color: 'var(--color-gray-400)',
          }}>
            <div style={{ fontSize: 40 }}>QR</div>
            <div style={{ fontSize: 11, textAlign: 'center', padding: '0 8px' }}>QR code placeholder</div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text)' }}>Scan with your phone camera</p>
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0 16px' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          <span style={{ fontSize: 12, color: 'var(--color-gray-400)' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
        </div>

        <button className="btn btn-secondary" onClick={handleCopyLink}>
          Copy link
        </button>
      </div>
    </div>
  )
}
