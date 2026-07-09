const linkStyle = { color: 'var(--color-accent)', textDecoration: 'underline', cursor: 'pointer' }

export default function Screen4Consent({ goNext, goBack }) {
  return (
    <>
      <div className="header">
        <button className="back-button" onClick={goBack}>←</button>
        <button className="lang-selector">En</button>
      </div>
      <div className="screen-content">
        <h1>Privacy & Consent</h1>
        <p className="subtitle">
          Please review and accept the disclosures below to proceed with verification.
        </p>

        <p style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.5, marginBottom: 12 }}>
          By selecting &ldquo;Continue,&rdquo; you authorize Interro, LLC (&ldquo;Interro&rdquo;) to collect and use the following information to verify your identity for know-your-customer (KYC) compliance purposes; and consent to Interro retaining this information and using the information to verify your identity in future transactions, including any future transactions you enter directly with Interro. See Interro&rsquo;s{' '}
          <a href="#" style={linkStyle}>Privacy Policy</a>{' '}
          to learn more.
        </p>
        <p style={{ fontSize: 13, color: 'var(--color-text)', lineHeight: 1.5, marginBottom: 20 }}>
          This includes personal information such as your photo identity documents (like a passport or driver&rsquo;s license), your date of birth, your tax identification number, and your home address, along with device information like your device type, browser, and IP address.
        </p>

        {/*
          KYC consent is mandatory to proceed. Selecting "Continue" is the act of
          giving KYC consent, and it is the only way forward from this screen — the
          user cannot advance through verification without it. Biometric consent is
          then required on the next screen (Screen 4b); both consents are required
          to complete verification.
        */}
        <div className="button-group">
          <button className="btn btn-primary" onClick={goNext}>
            Continue
          </button>
        </div>
      </div>
    </>
  )
}
