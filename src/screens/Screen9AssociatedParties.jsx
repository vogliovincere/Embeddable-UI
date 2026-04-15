import { useState } from 'react'

export default function Screen9AssociatedParties({ formData, dispatch, goNext, goBack, goTo }) {
  const [loading, setLoading] = useState(false)
  const [validationError, setValidationError] = useState('')

  const parties = formData.associatedParties

  const getPartiesByRole = (role) => parties.filter(p => p.roles.includes(role))

  const controlPersonCount = getPartiesByRole('Control Person').length
  const hasAny = parties.length > 0
  const canSubmit = controlPersonCount === 1

  const handleSubmit = () => {
    if (controlPersonCount === 0) {
      setValidationError('Exactly one Control Person is required per 31 CFR § 1010.230(d). Please add a Control Person before continuing.')
      return
    }
    if (controlPersonCount > 1) {
      setValidationError('Only one Control Person may be designated. Please remove additional Control Persons before continuing.')
      return
    }
    setValidationError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      goTo(10)
    }, 1500)
  }

  const handleAddIndividual = (defaultRole) => {
    dispatch({ type: 'SET_EDITING_PARTY', index: null })
    dispatch({ type: 'SET_DEFAULT_PARTY_ROLE', payload: defaultRole })
    goTo(9)
  }

  const handleEdit = (index) => {
    dispatch({ type: 'SET_EDITING_PARTY', index })
    goTo(9)
  }

  const handleDelete = (index) => {
    dispatch({ type: 'DELETE_PARTY', index })
  }

  const categories = [
    {
      role: 'UBO',
      title: 'UBO (Ultimate Beneficial Owner)',
      description: 'Individuals with direct or indirect ownership above 25%',
      allowEntity: false,
    },
    {
      role: 'Control Person',
      title: 'Control Person',
      description: 'The single individual with significant responsibility to control, manage, or direct the legal entity',
      allowEntity: false,
    },
  ]

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
        <h1>Associated parties</h1>
        <p className="subtitle">
          Add all associated parties for your entity.
        </p>

        {categories.map(cat => {
          const catParties = getPartiesByRole(cat.role)
          return (
            <div key={cat.role} className="party-category">
              <h3>{cat.title}</h3>
              <p className="category-description">{cat.description}</p>

              {catParties.map(p => {
                const globalIndex = parties.indexOf(p)
                return (
                  <div key={globalIndex} className="party-card">
                    <div className="party-card-header">
                      <div className="party-avatar emoji-badge"><span className="emoji-deco">👤</span></div>
                      <div className="party-info">
                        <div className="party-name">
                          {p.firstName} {p.middleName ? p.middleName + ' ' : ''}{p.lastName}
                        </div>
                        <div className="party-email">{p.email}</div>
                      </div>
                      <div className="party-actions">
                        <button onClick={() => handleEdit(globalIndex)} title="Edit"><span className="emoji-deco">✏️</span><span className="emoji-fallback">Edit</span></button>
                        <button onClick={() => handleDelete(globalIndex)} title="Delete"><span className="emoji-deco">🗑️</span><span className="emoji-fallback">Delete</span></button>
                      </div>
                    </div>
                    <div>
                      {p.roles.map(r => (
                        <span key={r} className={`role-badge ${r.toLowerCase().replace(/\s+/g, '-')}`}>{r}</span>
                      ))}
                    </div>
                  </div>
                )
              })}

              <button className="add-person-link" onClick={() => handleAddIndividual(cat.role)}>
                + Add individual
              </button>
              {cat.allowEntity && (
                <button className="add-person-link" style={{ marginLeft: 16 }} onClick={() => handleAddIndividual(cat.role)}>
                  + Add entity
                </button>
              )}
            </div>
          )
        })}

        {validationError && (
          <div className="form-error" style={{ marginBottom: 12 }}>{validationError}</div>
        )}

        <div className="button-group">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <span className="loading-dots"><span /><span /><span /></span> : 'Submit'}
          </button>
        </div>
      </div>
    </>
  )
}
