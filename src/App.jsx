import { useState, useReducer, useEffect } from 'react'
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
import IndStepOverview from './screens/individual/IndStepOverview'
import IndPersonalInfo from './screens/individual/IndPersonalInfo'
import IndAddress from './screens/individual/IndAddress'
import IndSupplementaryDocs from './screens/individual/IndSupplementaryDocs'
import IndDocCountryType from './screens/individual/IndDocCountryType'
import IndDocUpload from './screens/individual/IndDocUpload'
import IndIdentityVerification from './screens/individual/IndIdentityVerification'
import IndStatus from './screens/individual/IndStatus'

const individualInitialState = {
  firstName: '',
  lastName: '',
  dob: '',
  taxId: '',
  idCountry: null,
  idDocType: '',
  idDocFront: null,
  idDocBack: null,
  addressCountry: null,
  addressState: '',
  streetAddress: '',
  city: '',
  postalCode: '',
  apartment: '',
  proofOfAddress: [],
}

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
  individualData: { ...individualInitialState },
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
    case 'SET_INDIVIDUAL_DATA':
      return { ...state, individualData: { ...state.individualData, ...action.payload } }
    case 'CLEAR_ENTITY_DETAILS':
      return { ...state, entityDetails: initialState.entityDetails }
    case 'CLEAR_SUPPLEMENTARY_DOCS':
      return { ...state, supplementaryDocs: initialState.supplementaryDocs }
    case 'CLEAR_ENTITY_DOCS':
      return { ...state, entityDocs: initialState.entityDocs }
    case 'CLEAR_PARTIES':
      return { ...state, associatedParties: [], editingPartyIndex: null }
    case 'CLEAR_INDIVIDUAL_DATA':
      return { ...state, individualData: { ...individualInitialState } }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

// Individual flow screen numbers: 101+
// Shared: Disclaimer (101), Step Overview (102), Consent (103)
// v2 flow: Personal Info (104), Address (105), Supp Docs (106)
// KYC Complete: Identity Verification via SDK (107)
// KYC Basic: Doc Country/Type (108), Doc Upload (109)
// Status (110)
const IND_SCREENS = {
  DISCLAIMER: 101,
  STEP_OVERVIEW: 102,
  CONSENT: 103,
  PERSONAL_INFO: 104,
  ADDRESS: 105,
  SUPPLEMENTARY_DOCS: 106,
  IDENTITY_VERIFICATION: 107,  // KYC Complete only — Alloy SDK
  DOC_COUNTRY_TYPE: 108,       // KYC Basic only
  DOC_UPLOAD: 109,             // KYC Basic only
  STATUS: 110,
}

// KYC Complete: personal info → address → supp docs → SDK verification → status
const indScreenOrderComplete = [101, 102, 103, 104, 105, 106, 107, 110]
// KYC Basic: personal info → address → supp docs → doc country/type → doc upload → status
const indScreenOrderBasic = [101, 102, 103, 104, 105, 106, 108, 109, 110]

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(1)
  const [formData, dispatch] = useReducer(formReducer, initialState)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [flowType, setFlowType] = useState(null) // null | 'entity' | 'individual'
  const [contextId, setContextId] = useState('kyc_complete') // kyc_complete | kyc_basic

  // Read initialization params from URL query string.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const pathType = params.get('path_type')
    const ctxId = params.get('context_id')
    if (ctxId === 'kyc_basic' || ctxId === 'kyc_complete') {
      setContextId(ctxId)
    }
    if (pathType === 'individual') {
      setFlowType('individual')
      setCurrentScreen(IND_SCREENS.DISCLAIMER)
    } else if (pathType === 'entity') {
      setFlowType('entity')
      setCurrentScreen(2)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const getIndScreenOrder = () =>
    contextId === 'kyc_basic' ? indScreenOrderBasic : indScreenOrderComplete

  const goNext = () => {
    if (flowType === 'individual') {
      const order = getIndScreenOrder()
      const idx = order.indexOf(currentScreen)
      if (idx >= 0 && idx < order.length - 1) {
        setCurrentScreen(order[idx + 1])
      }
    } else {
      setCurrentScreen(s => s + 1)
    }
  }

  const goBack = () => {
    if (flowType === 'individual') {
      const order = getIndScreenOrder()
      const idx = order.indexOf(currentScreen)
      if (idx > 0) {
        setCurrentScreen(order[idx - 1])
      } else {
        // Back to welcome
        setFlowType(null)
        setCurrentScreen(1)
      }
    } else {
      setCurrentScreen(s => Math.max(1, s - 1))
    }
  }

  const goTo = (screen) => setCurrentScreen(screen)

  const handleSelectFlow = (type) => {
    setFlowType(type)
    if (type === 'individual') {
      setCurrentScreen(IND_SCREENS.DISCLAIMER)
    } else {
      setCurrentScreen(2) // entity disclaimer
    }
  }

  const props = {
    formData,
    dispatch,
    goNext,
    goBack,
    goTo,
    currentScreen,
    agreedToTerms,
    setAgreedToTerms,
    contextId,
  }

  const renderScreen = () => {
    // Welcome screen (shared)
    if (currentScreen === 1) {
      return <Screen1Welcome {...props} onSelectFlow={handleSelectFlow} />
    }

    // Individual flow screens
    if (currentScreen >= 101) {
      switch (currentScreen) {
        case IND_SCREENS.DISCLAIMER:
          return <Screen2Disclaimer {...props} />
        case IND_SCREENS.STEP_OVERVIEW:
          return <IndStepOverview {...props} />
        case IND_SCREENS.CONSENT:
          return <Screen4Consent {...props} />
        case IND_SCREENS.PERSONAL_INFO:
          return <IndPersonalInfo {...props} />
        case IND_SCREENS.ADDRESS:
          return <IndAddress {...props} />
        case IND_SCREENS.SUPPLEMENTARY_DOCS:
          return <IndSupplementaryDocs {...props} />
        case IND_SCREENS.IDENTITY_VERIFICATION:
          return <IndIdentityVerification {...props} />
        case IND_SCREENS.DOC_COUNTRY_TYPE:
          return <IndDocCountryType {...props} />
        case IND_SCREENS.DOC_UPLOAD:
          return <IndDocUpload {...props} />
        case IND_SCREENS.STATUS:
          return <IndStatus {...props} />
        default:
          return <Screen1Welcome {...props} onSelectFlow={handleSelectFlow} />
      }
    }

    // Entity flow screens (existing)
    switch (currentScreen) {
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
      default: return <Screen1Welcome {...props} onSelectFlow={handleSelectFlow} />
    }
  }

  // Entity prefill helpers
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
        ssn: '000-00-0001',
      },
    })
  }

  // Individual prefill helpers
  const prefillIndPersonalInfo = () => {
    dispatch({
      type: 'SET_INDIVIDUAL_DATA',
      payload: {
        firstName: 'John',
        lastName: 'Doe',
        dob: '03/22/1990',
        taxId: '123-45-6789',
      },
    })
  }

  const prefillIndIdentityDoc = () => {
    dispatch({
      type: 'SET_INDIVIDUAL_DATA',
      payload: {
        idCountry: { code: 'US', name: 'United States of America', flag: '🇺🇸' },
        idDocType: 'Driving license',
        idDocFront: 'drivers-license-front.jpg',
        idDocBack: 'drivers-license-back.jpg',
      },
    })
  }

  const prefillIndAddress = () => {
    dispatch({
      type: 'SET_INDIVIDUAL_DATA',
      payload: {
        addressCountry: { code: 'US', name: 'United States of America', flag: '🇺🇸' },
        addressState: 'California',
        streetAddress: '123 Main Street',
        city: 'San Francisco',
        postalCode: '94102',
        apartment: 'Apt 4B',
      },
    })
  }

  const prefillIndSupDocs = () => {
    dispatch({
      type: 'SET_INDIVIDUAL_DATA',
      payload: {
        proofOfAddress: [{ name: 'utility-bill-march.pdf', type: 'Utility bill' }],
      },
    })
  }

  const prefillIndAll = () => {
    setAgreedToTerms(true)
    prefillIndPersonalInfo()
    prefillIndAddress()
    prefillIndSupDocs()
    if (contextId === 'kyc_basic') prefillIndIdentityDoc()
  }

  // Dev tools screen lists
  const entityScreens = [
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

  const individualScreensComplete = [
    { num: 1, label: 'Welcome' },
    { num: 101, label: 'Disclaimer' },
    { num: 102, label: 'Step Overview' },
    { num: 103, label: 'Consent' },
    { num: 104, label: 'Personal Info' },
    { num: 105, label: 'Address' },
    { num: 106, label: 'Supp. Docs' },
    { num: 107, label: 'Identity Verification' },
    { num: 110, label: 'Status' },
  ]

  const individualScreensBasic = [
    { num: 1, label: 'Welcome' },
    { num: 101, label: 'Disclaimer' },
    { num: 102, label: 'Step Overview' },
    { num: 103, label: 'Consent' },
    { num: 104, label: 'Personal Info' },
    { num: 105, label: 'Address' },
    { num: 106, label: 'Supp. Docs' },
    { num: 108, label: 'ID Country & Type' },
    { num: 109, label: 'ID Upload' },
    { num: 110, label: 'Status' },
  ]

  const isIndividualFlow = flowType === 'individual' || currentScreen >= 101
  const screens = isIndividualFlow
    ? (contextId === 'kyc_basic' ? individualScreensBasic : individualScreensComplete)
    : entityScreens

  const hasEntityDetails = !!formData.entityDetails.country || !!formData.entityDetails.entityName
  const hasSupDocs = !!formData.supplementaryDocs.signatoryList || !!formData.supplementaryDocs.structureDiagram
  const hasEntityDocs = Object.values(formData.entityDocs).some(arr => arr.length > 0)
  const hasParties = formData.associatedParties.length > 0

  const ind = formData.individualData
  const hasIndPersonalInfo = !!ind.firstName || !!ind.lastName || !!ind.dob || !!ind.taxId
  const hasIndIdDoc = !!ind.idCountry || !!ind.idDocType
  const hasIndAddress = !!ind.addressCountry || !!ind.streetAddress
  const hasIndSupDocs = ind.proofOfAddress.length > 0

  const handleReset = () => {
    dispatch({ type: 'RESET' })
    setAgreedToTerms(false)
    setFlowType(null)
    setCurrentScreen(1)
  }

  const handleNavClick = (num) => {
    if (num >= 101) {
      setFlowType('individual')
    } else if (num >= 2) {
      setFlowType('entity')
    }
    goTo(num)
  }

  return (
    <div className="phone-frame-wrapper">
      <div className="prefill-panel">
        <div className="prefill-title">Dev Tools</div>

        {/* Flow toggle */}
        <div className="prefill-section">
          <div className="prefill-section-title">Flow</div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            <button
              className={`prefill-btn ${!isIndividualFlow ? 'prefill-btn-flow-active' : ''}`}
              style={{ flex: 1, textAlign: 'center', marginBottom: 0 }}
              onClick={() => {
                setFlowType('entity')
                if (currentScreen >= 101) setCurrentScreen(1)
              }}
            >
              Entity
            </button>
            <button
              className={`prefill-btn ${isIndividualFlow ? 'prefill-btn-flow-active' : ''}`}
              style={{ flex: 1, textAlign: 'center', marginBottom: 0 }}
              onClick={() => {
                setFlowType('individual')
                if (currentScreen > 1 && currentScreen < 101) setCurrentScreen(1)
              }}
            >
              Individual
            </button>
          </div>
          {isIndividualFlow && (
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                className={`prefill-btn ${contextId === 'kyc_complete' ? 'prefill-btn-flow-active' : ''}`}
                style={{ flex: 1, textAlign: 'center', marginBottom: 0, fontSize: 10 }}
                onClick={() => setContextId('kyc_complete')}
              >
                KYC Complete
              </button>
              <button
                className={`prefill-btn ${contextId === 'kyc_basic' ? 'prefill-btn-flow-active' : ''}`}
                style={{ flex: 1, textAlign: 'center', marginBottom: 0, fontSize: 10 }}
                onClick={() => setContextId('kyc_basic')}
              >
                KYC Basic
              </button>
            </div>
          )}
        </div>

        <div className="prefill-section">
          <div className="prefill-section-title">Navigate</div>
          <div className="prefill-nav-list">
            {screens.map(s => (
              <button
                key={s.num}
                className={`prefill-nav-item ${s.num === currentScreen ? 'active' : ''}`}
                onClick={() => handleNavClick(s.num)}
              >
                <span className="prefill-nav-num">{s.num > 100 ? s.num - 100 : s.num}</span>
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

          {isIndividualFlow ? (
            <>
              <div className="prefill-data-row">
                <button className="prefill-btn" onClick={prefillIndPersonalInfo} disabled={hasIndPersonalInfo}>
                  Personal info
                </button>
                {hasIndPersonalInfo && <button className="prefill-clear-btn" onClick={() => dispatch({
                  type: 'SET_INDIVIDUAL_DATA',
                  payload: { firstName: '', lastName: '', dob: '', taxId: '' },
                })}>Clear</button>}
              </div>

              <div className="prefill-data-row">
                <button className="prefill-btn" onClick={prefillIndAddress} disabled={hasIndAddress}>
                  Address info
                </button>
                {hasIndAddress && <button className="prefill-clear-btn" onClick={() => dispatch({
                  type: 'SET_INDIVIDUAL_DATA',
                  payload: { addressCountry: null, addressState: '', streetAddress: '', city: '', postalCode: '', apartment: '' },
                })}>Clear</button>}
              </div>

              <div className="prefill-data-row">
                <button className="prefill-btn" onClick={prefillIndSupDocs} disabled={hasIndSupDocs}>
                  Proof of address
                </button>
                {hasIndSupDocs && <button className="prefill-clear-btn" onClick={() => dispatch({
                  type: 'SET_INDIVIDUAL_DATA',
                  payload: { proofOfAddress: [] },
                })}>Clear</button>}
              </div>

              {contextId === 'kyc_basic' && (
                <div className="prefill-data-row">
                  <button className="prefill-btn" onClick={prefillIndIdentityDoc} disabled={hasIndIdDoc}>
                    Identity document
                  </button>
                  {hasIndIdDoc && <button className="prefill-clear-btn" onClick={() => dispatch({
                    type: 'SET_INDIVIDUAL_DATA',
                    payload: { idCountry: null, idDocType: '', idDocFront: null, idDocBack: null },
                  })}>Clear</button>}
                </div>
              )}

              <button className="prefill-btn prefill-btn-all" onClick={prefillIndAll}>
                Fill everything
              </button>
            </>
          ) : (
            <>
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
            </>
          )}
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
