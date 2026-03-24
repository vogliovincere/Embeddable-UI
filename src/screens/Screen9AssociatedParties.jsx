import { useState } from 'react'

export default function Screen9AssociatedParties({ formData, dispatch, goNext, goBack, goTo }) {
  const [loading, setLoading] = useState(false)
  const [validationError, setValidationError] = useState('')

  const parties = formData.associatedParties

  const getPartiesByRole = (role) => parties.filter(p => p.roles.includes(role))

  const hasDirector = getPartiesByRole('Director').length > 0
  const hasAny = parties.length > 0
  const canSubmit = hasDirector || (getPartiesByRole('UBO').length > 0 || getPartiesByRole('Shareholder').length > 0)

  const handleSubmit = () => {
    if (!canSubmit) {
      setValidationError('At minimum, one Director must be added. If no Director is provided, at least one Shareholder or UBO must be entered.')
      return
    }
    setValidationError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      goTo(11)
    }, 1500)
  }

  const handleAddIndividual = (defaultRole) => {
    dispatch({ type: 'SET_EDITING_PARTY', index: null })
    goTo(10)
  }

  const handleEdit = (index) => {
    dispatch({ type: 'SET_EDITING_PARTY', index })
    goTo(10)
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
      role: 'Shareholder',
      title: 'Shareholder',
      description: 'Parties with direct ownership above 25%',
      allowEntity: true,
    },
    {
      role: 'Director',
      title: 'Director',
      description: 'Company directors and officers',
      allowEntity: true,
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
                      <div className="party-avatar">👤</div>
                      <div className="party-info">
                        <div className="party-name">
                          {p.firstName} {p.middleName ? p.middleName + ' ' : ''}{p.lastName}
                        </div>
                        <div className="party-email">{p.email}</div>
                      </div>
                      <div className="party-actions">
                        <button onClick={() => handleEdit(globalIndex)} title="Edit">✏️</button>
                        <button onClick={() => handleDelete(globalIndex)} title="Delete">🗑️</button>
                      </div>
                    </div>
                    <div>
                      {p.roles.map(r => (
                        <span key={r} className={`role-badge ${r.toLowerCase()}`}>{r}</span>
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
