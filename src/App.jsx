import { useState, useReducer } from 'react'
import interroLogo from './assets/interro-logo.png'
import Screen1Welcome from './screens/Screen1Welcome'
import Screen2Disclaimer from './screens/Screen2Disclaimer'
import Screen3StepOverview from './screens/Screen3StepOverview'
import Screen4Consent from './screens/Screen4Consent'
import Screen5EntityDetails from './screens/Screen5EntityDetails'
import Screen6ReviewConfirm from './screens/Screen6ReviewConfirm'
import Screen7DocRequest from './screens/Screen7DocRequest'
import Screen8EntityDocs from './screens/Screen8EntityDocs'
import Screen9AssociatedParties from './screens/Screen9AssociatedParties'
import Screen10AddParty from './screens/Screen10AddParty'
import Screen11VerificationLinks from './screens/Screen11VerificationLinks'
import Screen12Status from './screens/Screen12Status'

const initialState = {
  entityDetails: {
    country: null,
    state: '',
    entityName: '',
    fileNumber: '',
  },
  supplementaryDocs: {
    signatoryList: null,
    structureDiagram: null,
  },
  entityDocs: {
    legal_presence: [],
    entity_details: [],
    ownership_structure: [],
  },
  associatedParties: [],
  editingPartyIndex: null,
}

function formReducer(state, action) {
  switch (action.type) {
    case 'SET_ENTITY_DETAILS':
      return { ...state, entityDetails: { ...state.entityDetails, ...action.payload } }
    case 'SET_SUPPLEMENTARY_DOC':
      return { ...state, supplementaryDocs: { ...state.supplementaryDocs, [action.field]: action.payload } }
    case 'SET_ENTITY_DOC': {
      const docs = { ...state.entityDocs }
      docs[action.category] = action.payload
      return { ...state, entityDocs: docs }
    }
    case 'ADD_PARTY':
      return { ...state, associatedParties: [...state.associatedParties, action.payload] }
    case 'UPDATE_PARTY': {
      const parties = [...state.associatedParties]
      parties[action.index] = action.payload
      return { ...state, associatedParties: parties }
    }
    case 'DELETE_PARTY':
      return { ...state, associatedParties: state.associatedParties.filter((_, i) => i !== action.index) }
    case 'SET_EDITING_PARTY':
      return { ...state, editingPartyIndex: action.index }
    case 'CLEAR_ENTITY_DETAILS':
      return { ...state, entityDetails: initialState.entityDetails }
    case 'CLEAR_SUPPLEMENTARY_DOCS':
      return { ...state, supplementaryDocs: initialState.supplementaryDocs }
    case 'CLEAR_ENTITY_DOCS':
      return { ...state, entityDocs: initialState.entityDocs }
    case 'CLEAR_PARTIES':
      return { ...state, associatedParties: [], editingPartyIndex: null }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(1)
  const [formData, dispatch] = useReducer(formReducer, initialState)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const goNext = () => setCurrentScreen(s => s + 1)
  const goBack = () => setCurrentScreen(s => Math.max(1, s - 1))
  const goTo = (screen) => setCurrentScreen(screen)

  const props = {
    formData,
    dispatch,
    goNext,
    goBack,
    goTo,
    currentScreen,
    agreedToTerms,
    setAgreedToTerms,
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 1: return <Screen1Welcome {...props} />
      case 2: return <Screen2Disclaimer {...props} />
      case 3: return <Screen3StepOverview {...props} />
      case 4: return <Screen4Consent {...props} />
      case 5: return <Screen5EntityDetails {...props} />
      case 6: return <Screen6ReviewConfirm {...props} />
      case 7: return <Screen7DocRequest {...props} />
      case 8: return <Screen8EntityDocs {...props} />
      case 9: return <Screen9AssociatedParties {...props} />
      case 10: return <Screen10AddParty {...props} />
      case 11: return <Screen11VerificationLinks {...props} />
      case 12: return <Screen12Status {...props} />
      default: return <Screen1Welcome {...props} />
    }
  }

  const prefillEntityDetails = () => {
    dispatch({
      type: 'SET_ENTITY_DETAILS',
      payload: {
        country: { code: 'US', name: 'United States', flag: '🇺🇸' },
        state: 'Delaware',
        entityName: 'Acme Holdings LLC',
        fileNumber: '12345678',
      },
    })
  }

  const prefillSupplementaryDocs = () => {
    dispatch({ type: 'SET_SUPPLEMENTARY_DOC', field: 'signatoryList', payload: 'signatory-list.pdf' })
    dispatch({ type: 'SET_SUPPLEMENTARY_DOC', field: 'structureDiagram', payload: 'structure-diagram.pdf' })
  }

  const prefillEntityDocs = () => {
    dispatch({ type: 'SET_ENTITY_DOC', category: 'legal_presence', payload: [{ name: 'incorporation-cert.pdf', type: 'Incorporation certificate' }] })
    dispatch({ type: 'SET_ENTITY_DOC', category: 'entity_details', payload: [{ name: 'articles-of-assoc.pdf', type: 'Articles and memorandum of association' }] })
    dispatch({ type: 'SET_ENTITY_DOC', category: 'ownership_structure', payload: [{ name: 'shareholder-registry.pdf', type: 'Shareholder registry' }] })
  }

  const prefillParty = () => {
    dispatch({
      type: 'ADD_PARTY',
      payload: {
        roles: ['Director', 'UBO'],
        firstName: 'Jane',
        lastName: 'Smith',
        middleName: '',
        dob: '01/15/1985',
        email: 'jane.smith@acme.com',
      },
    })
  }

  const screens = [
    { num: 1, label: 'Welcome' },
    { num: 2, label: 'Disclaimer' },
    { num: 3, label: 'Step Overview' },
    { num: 4, label: 'Consent' },
    { num: 5, label: 'Entity Details' },
    { num: 6, label: 'Review & Confirm' },
    { num: 7, label: 'Doc Request' },
    { num: 8, label: 'Entity Docs' },
    { num: 9, label: 'Associated Parties' },
    { num: 10, label: 'Add Party' },
    { num: 11, label: 'Verification Links' },
    { num: 12, label: 'Status' },
  ]

  const hasEntityDetails = !!formData.entityDetails.country || !!formData.entityDetails.entityName
  const hasSupDocs = !!formData.supplementaryDocs.signatoryList || !!formData.supplementaryDocs.structureDiagram
  const hasEntityDocs = Object.values(formData.entityDocs).some(arr => arr.length > 0)
  const hasParties = formData.associatedParties.length > 0

  const handleReset = () => {
    dispatch({ type: 'RESET' })
    setAgreedToTerms(false)
    setCurrentScreen(1)
  }

  return (
    <div className="phone-frame-wrapper">
      <div className="prefill-panel">
        <div className="prefill-title">Dev Tools</div>

        <div className="prefill-section">
          <div className="prefill-section-title">Navigate</div>
          <div className="prefill-nav-list">
            {screens.map(s => (
              <button
                key={s.num}
                className={`prefill-nav-item ${s.num === currentScreen ? 'active' : ''}`}
                onClick={() => goTo(s.num)}
              >
                <span className="prefill-nav-num">{s.num}</span>
                <span className="prefill-nav-label">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="prefill-section">
          <div className="prefill-section-title">Prefill Data</div>

          <div className="prefill-data-row">
            <button className="prefill-btn" onClick={() => setAgreedToTerms(true)} disabled={agreedToTerms}>
              Terms accepted
            </button>
            {agreedToTerms && <button className="prefill-clear-btn" onClick={() => setAgreedToTerms(false)}>Clear</button>}
          </div>

          <div className="prefill-data-row">
            <button className="prefill-btn" onClick={prefillEntityDetails} disabled={hasEntityDetails}>
              Entity details
            </button>
            {hasEntityDetails && <button className="prefill-clear-btn" onClick={() => dispatch({ type: 'CLEAR_ENTITY_DETAILS' })}>Clear</button>}
          </div>

          <div className="prefill-data-row">
            <button className="prefill-btn" onClick={prefillSupplementaryDocs} disabled={hasSupDocs}>
              Supplementary docs
            </button>
            {hasSupDocs && <button className="prefill-clear-btn" onClick={() => dispatch({ type: 'CLEAR_SUPPLEMENTARY_DOCS' })}>Clear</button>}
          </div>

          <div className="prefill-data-row">
            <button className="prefill-btn" onClick={prefillEntityDocs} disabled={hasEntityDocs}>
              Entity docs
            </button>
            {hasEntityDocs && <button className="prefill-clear-btn" onClick={() => dispatch({ type: 'CLEAR_ENTITY_DOCS' })}>Clear</button>}
          </div>

          <div className="prefill-data-row">
            <button className="prefill-btn" onClick={prefillParty}>
              + Add a party
            </button>
            {hasParties && <button className="prefill-clear-btn" onClick={() => dispatch({ type: 'CLEAR_PARTIES' })}>Clear</button>}
          </div>

          <button className="prefill-btn prefill-btn-all" onClick={() => {
            setAgreedToTerms(true)
            prefillEntityDetails()
            prefillSupplementaryDocs()
            prefillEntityDocs()
            if (!hasParties) prefillParty()
          }}>
            Fill everything
          </button>
        </div>

        <div className="prefill-section">
          <button className="prefill-btn prefill-btn-reset" onClick={handleReset}>
            Reset everything
          </button>
        </div>
      </div>

      <div className="phone-frame">
        {renderScreen()}
        <div className="powered-footer">
          <span>Powered by</span>
          <img src={interroLogo} alt="Interro" />
        </div>
      </div>
    </div>
  )
}
