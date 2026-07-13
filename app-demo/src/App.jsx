import { useState, useReducer, useEffect } from 'react'
import interroLogo from './assets/interro-logo.png'
import Screen1Welcome from './screens/Screen1Welcome'
import Screen2Disclaimer from './screens/Screen2Disclaimer'
import Screen3StepOverview from './screens/Screen3StepOverview'
import Screen4Consent from './screens/Screen4Consent'
import ScreenBiometricConsent from './screens/ScreenBiometricConsent'
import Screen5EntityDetails from './screens/Screen5EntityDetails'
import Screen6ReviewConfirm from './screens/Screen6ReviewConfirm'
import Screen7DocRequest from './screens/Screen7DocRequest'
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
import JointStepOverview from './screens/joint/JointStepOverview'
import JointCoHolderEntry from './screens/joint/JointCoHolderEntry'
import JointAddCoHolder from './screens/joint/JointAddCoHolder'
import JointVerification from './screens/joint/JointVerification'
import JointStatus from './screens/joint/JointStatus'
import { generateIndividual, generateCompany, generateParty, generateCoHolder } from './utils/dataGen'

const individualInitialState = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
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
  basicOutcome: null,
}

const jointInitialState = {
  coHolders: [],
  editingCoHolderIndex: null,
  numberOfHolders: 3,
  jointAccountType: 'JTWROS',
}

const initialState = {
  entityDetails: {
    country: null,
    state: '',
    entityName: '',
    fileNumber: '',
  },
  entityDocs: {
    formation_documents: [],
  },
  associatedParties: [],
  editingPartyIndex: null,
  defaultPartyRole: null,
  individualData: { ...individualInitialState },
  jointData: { ...jointInitialState },
}

function formReducer(state, action) {
  switch (action.type) {
    case 'SET_ENTITY_DETAILS':
      return { ...state, entityDetails: { ...state.entityDetails, ...action.payload } }
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
    case 'SET_DEFAULT_PARTY_ROLE':
      return { ...state, defaultPartyRole: action.payload }
    case 'SET_INDIVIDUAL_DATA':
      return { ...state, individualData: { ...state.individualData, ...action.payload } }
    // Joint flow actions
    case 'ADD_CO_HOLDER':
      return { ...state, jointData: { ...state.jointData, coHolders: [...state.jointData.coHolders, action.payload] } }
    case 'UPDATE_CO_HOLDER': {
      const coHolders = [...state.jointData.coHolders]
      coHolders[action.index] = action.payload
      return { ...state, jointData: { ...state.jointData, coHolders } }
    }
    case 'DELETE_CO_HOLDER':
      return { ...state, jointData: { ...state.jointData, coHolders: state.jointData.coHolders.filter((_, i) => i !== action.index) } }
    case 'SET_EDITING_CO_HOLDER':
      return { ...state, jointData: { ...state.jointData, editingCoHolderIndex: action.index } }
    case 'SET_JOINT_CONFIG':
      return { ...state, jointData: { ...state.jointData, ...action.payload } }
    case 'CLEAR_JOINT_DATA':
      return { ...state, jointData: { ...jointInitialState } }
    case 'CLEAR_CO_HOLDERS':
      return { ...state, jointData: { ...state.jointData, coHolders: [], editingCoHolderIndex: null } }
    case 'CLEAR_ENTITY_DETAILS':
      return { ...state, entityDetails: initialState.entityDetails }
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
const IND_SCREENS = {
  DISCLAIMER: 101,
  STEP_OVERVIEW: 102,
  CONSENT: 103,
  BIOMETRIC_CONSENT: 111,
  PERSONAL_INFO: 104,
  ADDRESS: 105,
  SUPPLEMENTARY_DOCS: 106,
  IDENTITY_VERIFICATION: 107,
  DOC_COUNTRY_TYPE: 108,
  DOC_UPLOAD: 109,
  STATUS: 110,
}

// Joint flow screen numbers: 201+
const JOINT_SCREENS = {
  DISCLAIMER: 201,
  STEP_OVERVIEW: 202,
  CONSENT: 203,
  BIOMETRIC_CONSENT: 214,
  PERSONAL_INFO: 204,
  ADDRESS: 205,
  SUPPLEMENTARY_DOCS: 206,
  IDENTITY_VERIFICATION: 207,
  DOC_COUNTRY_TYPE: 208,
  DOC_UPLOAD: 209,
  CO_HOLDER_ENTRY: 210,
  ADD_CO_HOLDER: 211,
  VERIFICATION: 212,
  STATUS: 213,
}

// KYC Complete: personal info → address → supp docs → SDK verification → status
const indScreenOrderComplete = [101, 102, 103, 111, 104, 105, 106, 107, 110]
// KYC Basic: personal info → address → supp docs → doc country/type → doc upload → status
const indScreenOrderBasic = [101, 102, 103, 111, 104, 105, 106, 108, 109, 110]

// Joint KYC Complete: disclaimer → overview → consent → personal → address → supp docs → SDK → co-holders → verification → status
const jointScreenOrderComplete = [201, 202, 203, 214, 204, 205, 206, 207, 210, 212, 213]
// Joint KYC Basic: disclaimer → overview → consent → personal → address → supp docs → doc type → doc upload → co-holders → verification → status
const jointScreenOrderBasic = [201, 202, 203, 214, 204, 205, 206, 208, 209, 210, 212, 213]

// Entity flow: welcome → disclaimer → overview → consent → entity details → review → KYB docs → parties → add party → verification links → status
// Entity flow: welcome → disclaimer → overview → consent → entity details → review → KYB docs → parties → add party → verification links → status
const entityScreenOrder = [1, 2, 3, 4, 41, 5, 6, 7, 8, 9, 10, 11]

const THEMES = [
  { id: 'verivend', label: 'Verivend Strict' },
  { id: 'interro-green', label: 'Interro Green' },
  { id: 'interro-gold', label: 'Interro Gold' },
  { id: 'interro-light-green', label: 'Interro Light Green' },
  { id: 'interro-dark-gold', label: 'Interro Dark Gold' },
  { id: 'minimalist', label: 'Minimalist' },
]

export default function App() {
  const [currentScreen, setCurrentScreen] = useState(1)
  const [formData, dispatch] = useReducer(formReducer, initialState)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [flowType, setFlowType] = useState(null) // null | 'entity' | 'individual' | 'joint'
  const [contextId, setContextId] = useState('kyc_complete') // kyc_complete | kyc_basic
  // Dev override: when true, journey applications are sent with kycVariant 'basic'
  // even in the Complete flow (individual + joint). Off = use the flow's own variant.
  const [forceKycBasic, setForceKycBasic] = useState(false)
  // Dev override (individual only): when true, the journey application's address
  // postal code is forced to 33449, which routes the account to manual review
  // in the Alloy sandbox.
  const [forceReview, setForceReview] = useState(false)

  // Display toggles. Applied to <html data-theme=... data-emojis=...> so only
  // the CSS cascade re-runs — the React tree never remounts and no form
  // state is lost when the user flips themes or hides emojis mid-flow.
  const [colorScheme, setColorScheme] = useState('verivend')
  const [showEmojis, setShowEmojis] = useState(true)

  useEffect(() => {
    document.documentElement.dataset.theme = colorScheme
    document.documentElement.dataset.emojis = showEmojis ? 'on' : 'off'
  }, [colorScheme, showEmojis])

  // Read initialization params from URL query string.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const pathType = params.get('path_type')
    const ctxId = params.get('context_id')
    const numHolders = parseInt(params.get('number_of_holders'), 10)
    const jointType = params.get('joint_account_type')

    if (ctxId === 'kyc_basic' || ctxId === 'kyc_complete') {
      setContextId(ctxId)
    }
    if (pathType === 'individual') {
      setFlowType('individual')
      setCurrentScreen(IND_SCREENS.DISCLAIMER)
    } else if (pathType === 'entity') {
      setFlowType('entity')
      setCurrentScreen(2)
    } else if (pathType === 'joint') {
      setFlowType('joint')
      if (numHolders >= 2 && numHolders <= 5) {
        dispatch({ type: 'SET_JOINT_CONFIG', payload: { numberOfHolders: numHolders } })
      }
        setCurrentScreen(JOINT_SCREENS.DISCLAIMER)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const getScreenOrder = () => {
    if (flowType === 'entity') {
      return entityScreenOrder
    }
    if (flowType === 'joint') {
      return contextId === 'kyc_basic' ? jointScreenOrderBasic : jointScreenOrderComplete
    }
    return contextId === 'kyc_basic' ? indScreenOrderBasic : indScreenOrderComplete
  }

  const goNext = () => {
    const order = getScreenOrder()
    const idx = order.indexOf(currentScreen)
    if (idx >= 0 && idx < order.length - 1) {
      setCurrentScreen(order[idx + 1])
    }
  }

  const goBack = () => {
    const order = getScreenOrder()
    const idx = order.indexOf(currentScreen)
    if (idx > 0) {
      setCurrentScreen(order[idx - 1])
    } else {
      setFlowType(null)
      setCurrentScreen(1)
    }
  }

  const goTo = (screen) => setCurrentScreen(screen)

  const handleSelectFlow = (type) => {
    setFlowType(type)
    if (type === 'individual') {
      setCurrentScreen(IND_SCREENS.DISCLAIMER)
    } else if (type === 'joint') {
      setCurrentScreen(JOINT_SCREENS.DISCLAIMER)
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
    flowType,
    forceKycBasic,
    forceReview,
  }

  const renderScreen = () => {
    // Welcome screen (shared)
    if (currentScreen === 1) {
      return <Screen1Welcome {...props} onSelectFlow={handleSelectFlow} />
    }

    // Joint flow screens (201+)
    if (currentScreen >= 201) {
      switch (currentScreen) {
        case JOINT_SCREENS.DISCLAIMER:
          return <Screen2Disclaimer {...props} />
        case JOINT_SCREENS.STEP_OVERVIEW:
          return <JointStepOverview {...props} />
        case JOINT_SCREENS.CONSENT:
          return <Screen4Consent {...props} />
        case JOINT_SCREENS.BIOMETRIC_CONSENT:
          return <ScreenBiometricConsent {...props} />
        case JOINT_SCREENS.PERSONAL_INFO:
          return <IndPersonalInfo {...props} />
        case JOINT_SCREENS.ADDRESS:
          return <IndAddress {...props} />
        case JOINT_SCREENS.SUPPLEMENTARY_DOCS:
          return <IndSupplementaryDocs {...props} />
        case JOINT_SCREENS.IDENTITY_VERIFICATION:
          return <IndIdentityVerification {...props} />
        case JOINT_SCREENS.DOC_COUNTRY_TYPE:
          return <IndDocCountryType {...props} />
        case JOINT_SCREENS.DOC_UPLOAD:
          return <IndDocUpload {...props} />
        case JOINT_SCREENS.CO_HOLDER_ENTRY:
          return <JointCoHolderEntry {...props} />
        case JOINT_SCREENS.ADD_CO_HOLDER:
          return <JointAddCoHolder {...props} />
        case JOINT_SCREENS.VERIFICATION:
          return <JointVerification {...props} />
        case JOINT_SCREENS.STATUS:
          return <JointStatus {...props} />
        default:
          return <Screen1Welcome {...props} onSelectFlow={handleSelectFlow} />
      }
    }

    // Individual flow screens (101+)
    if (currentScreen >= 101) {
      switch (currentScreen) {
        case IND_SCREENS.DISCLAIMER:
          return <Screen2Disclaimer {...props} />
        case IND_SCREENS.STEP_OVERVIEW:
          return <IndStepOverview {...props} />
        case IND_SCREENS.CONSENT:
          return <Screen4Consent {...props} />
        case IND_SCREENS.BIOMETRIC_CONSENT:
          return <ScreenBiometricConsent {...props} />
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
      case 41: return <ScreenBiometricConsent {...props} />
      case 5: return <Screen5EntityDetails {...props} />
      case 6: return <Screen6ReviewConfirm {...props} />
      case 7: return <Screen7DocRequest {...props} />
      case 8: return <Screen9AssociatedParties {...props} />
      case 9: return <Screen10AddParty {...props} />
      case 10: return <Screen11VerificationLinks {...props} />
      case 11: return <Screen12Status {...props} />
      default: return <Screen1Welcome {...props} onSelectFlow={handleSelectFlow} />
    }
  }

  // Entity prefill helpers — fresh company every click.
  const prefillEntityDetails = () => {
    dispatch({ type: 'SET_ENTITY_DETAILS', payload: generateCompany() })
  }

  const prefillEntityDocs = () => {
    dispatch({ type: 'SET_ENTITY_DOC', category: 'formation_documents', payload: [{ name: 'articles-of-incorporation.pdf', type: 'Formation document' }] })
  }

  // Each click adds a brand-new generated UBO. The first party added is a
  // Control Person + UBO; subsequent ones are UBOs.
  const prefillParty = () => {
    const isControlPerson = formData.associatedParties.length === 0
    dispatch({ type: 'ADD_PARTY', payload: generateParty(isControlPerson) })
  }

  // Individual prefill helpers — each granular button generates fresh data.
  const prefillIndPersonalInfo = () => {
    const p = generateIndividual()
    dispatch({
      type: 'SET_INDIVIDUAL_DATA',
      payload: { firstName: p.firstName, lastName: p.lastName, email: p.email, phone: p.phone, dob: p.dob, taxId: p.taxId },
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
    const p = generateIndividual()
    dispatch({
      type: 'SET_INDIVIDUAL_DATA',
      payload: { addressCountry: p.addressCountry, addressState: p.addressState, streetAddress: p.streetAddress, city: p.city, postalCode: p.postalCode, apartment: p.apartment },
    })
  }

  const prefillIndSupDocs = () => {
    dispatch({ type: 'SET_INDIVIDUAL_DATA', payload: { proofOfAddress: generateIndividual().proofOfAddress } })
  }

  // "Fill everything" generates ONE internally-consistent persona so the name,
  // address, and docs all belong to the same generated identity.
  const prefillIndAll = () => {
    setAgreedToTerms(true)
    const p = generateIndividual()
    dispatch({
      type: 'SET_INDIVIDUAL_DATA',
      payload: {
        firstName: p.firstName, lastName: p.lastName, email: p.email, phone: p.phone, dob: p.dob, taxId: p.taxId,
        addressCountry: p.addressCountry, addressState: p.addressState, streetAddress: p.streetAddress, city: p.city, postalCode: p.postalCode, apartment: p.apartment,
        proofOfAddress: p.proofOfAddress,
      },
    })
    if (contextId === 'kyc_basic') prefillIndIdentityDoc()
  }

  // Joint prefill helpers — fresh generated co-holder every click.
  const prefillCoHolder = () => {
    dispatch({ type: 'ADD_CO_HOLDER', payload: generateCoHolder() })
  }

  const prefillJointAll = () => {
    setAgreedToTerms(true)
    const p = generateIndividual()
    dispatch({
      type: 'SET_INDIVIDUAL_DATA',
      payload: {
        firstName: p.firstName, lastName: p.lastName, email: p.email, phone: p.phone, dob: p.dob, taxId: p.taxId,
        addressCountry: p.addressCountry, addressState: p.addressState, streetAddress: p.streetAddress, city: p.city, postalCode: p.postalCode, apartment: p.apartment,
        proofOfAddress: p.proofOfAddress,
      },
    })
    if (contextId === 'kyc_basic') prefillIndIdentityDoc()
    // Add generated co-holders up to the required count.
    const required = formData.jointData.numberOfHolders - 1
    let added = formData.jointData.coHolders.length
    while (added < required) {
      dispatch({ type: 'ADD_CO_HOLDER', payload: generateCoHolder() })
      added++
    }
  }

  // Dev tools screen lists
  const entityScreens = [
    { num: 1, label: 'Welcome' },
    { num: 2, label: 'Disclaimer' },
    { num: 3, label: 'Step Overview' },
    { num: 4, label: 'Consent' },
    { num: 41, label: 'Biometric Consent' },
    { num: 5, label: 'Entity Details' },
    { num: 6, label: 'Review & Confirm' },
    { num: 7, label: 'KYB Document Request' },
    { num: 8, label: 'Associated Parties' },
    { num: 9, label: 'Add Party' },
    { num: 10, label: 'Verification Links' },
    { num: 11, label: 'Status' },
  ]

  const individualScreensComplete = [
    { num: 1, label: 'Welcome' },
    { num: 101, label: 'Disclaimer' },
    { num: 102, label: 'Step Overview' },
    { num: 103, label: 'Consent' },
    { num: 111, label: 'Biometric Consent' },
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
    { num: 111, label: 'Biometric Consent' },
    { num: 104, label: 'Personal Info' },
    { num: 105, label: 'Address' },
    { num: 106, label: 'Supp. Docs' },
    { num: 108, label: 'ID Country & Type' },
    { num: 109, label: 'ID Upload' },
    { num: 110, label: 'Status' },
  ]

  const jointScreensComplete = [
    { num: 1, label: 'Welcome' },
    { num: 201, label: 'Disclaimer' },
    { num: 202, label: 'Step Overview' },
    { num: 203, label: 'Consent' },
    { num: 214, label: 'Biometric Consent' },
    { num: 204, label: 'Personal Info' },
    { num: 205, label: 'Address' },
    { num: 206, label: 'Supp. Docs' },
    { num: 207, label: 'Identity Verification' },
    { num: 210, label: 'Co-Holders' },
    { num: 211, label: 'Add Co-Holder' },
    { num: 212, label: 'Verification' },
    { num: 213, label: 'Status' },
  ]

  const jointScreensBasic = [
    { num: 1, label: 'Welcome' },
    { num: 201, label: 'Disclaimer' },
    { num: 202, label: 'Step Overview' },
    { num: 203, label: 'Consent' },
    { num: 214, label: 'Biometric Consent' },
    { num: 204, label: 'Personal Info' },
    { num: 205, label: 'Address' },
    { num: 206, label: 'Supp. Docs' },
    { num: 208, label: 'ID Country & Type' },
    { num: 209, label: 'ID Upload' },
    { num: 210, label: 'Co-Holders' },
    { num: 211, label: 'Add Co-Holder' },
    { num: 212, label: 'Verification' },
    { num: 213, label: 'Status' },
  ]

  const isIndividualFlow = flowType === 'individual' || (currentScreen >= 101 && currentScreen < 201)
  const isJointFlow = flowType === 'joint' || currentScreen >= 201
  const screens = isJointFlow
    ? (contextId === 'kyc_basic' ? jointScreensBasic : jointScreensComplete)
    : isIndividualFlow
      ? (contextId === 'kyc_basic' ? individualScreensBasic : individualScreensComplete)
      : entityScreens

  const hasEntityDetails = !!formData.entityDetails.country || !!formData.entityDetails.entityName
  const hasEntityDocs = Object.values(formData.entityDocs).some(arr => arr.length > 0)
  const hasParties = formData.associatedParties.length > 0

  const ind = formData.individualData
  const hasIndPersonalInfo = !!ind.firstName || !!ind.lastName || !!ind.dob || !!ind.taxId
  const hasIndIdDoc = !!ind.idCountry || !!ind.idDocType
  const hasIndAddress = !!ind.addressCountry || !!ind.streetAddress
  const hasIndSupDocs = ind.proofOfAddress.length > 0
  const hasCoHolders = formData.jointData.coHolders.length > 0

  const handleReset = () => {
    dispatch({ type: 'RESET' })
    setAgreedToTerms(false)
    setFlowType(null)
    setCurrentScreen(1)
  }

  const handleNavClick = (num) => {
    if (num >= 201) {
      setFlowType('joint')
    } else if (num >= 101) {
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
              className={`prefill-btn ${flowType === 'entity' || (!isIndividualFlow && !isJointFlow && currentScreen > 1) ? 'prefill-btn-flow-active' : ''}`}
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
                if (currentScreen > 1 && (currentScreen < 101 || currentScreen >= 201)) setCurrentScreen(1)
              }}
            >
              Individual
            </button>
            <button
              className={`prefill-btn ${isJointFlow ? 'prefill-btn-flow-active' : ''}`}
              style={{ flex: 1, textAlign: 'center', marginBottom: 0 }}
              onClick={() => {
                setFlowType('joint')
                if (currentScreen > 1 && currentScreen < 201) setCurrentScreen(1)
              }}
            >
              Joint
            </button>
          </div>
          {(isIndividualFlow || isJointFlow) && (
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
          {(isIndividualFlow || isJointFlow) && (
            <button
              className={`prefill-btn ${forceKycBasic ? 'prefill-btn-flow-active' : ''}`}
              style={{ width: '100%', textAlign: 'center', marginTop: 4, marginBottom: 0, fontSize: 10 }}
              onClick={() => setForceKycBasic((v) => !v)}
              title="When ON, journey applications send kycVariant 'basic' even in the Complete flow (individual + joint). Entity flow is unaffected."
            >
              {forceKycBasic ? '⚡ Forcing BASIC payload' : 'Force BASIC payload: off'}
            </button>
          )}
          {isIndividualFlow && (
            <button
              className={`prefill-btn ${forceReview ? 'prefill-btn-flow-active' : ''}`}
              style={{ width: '100%', textAlign: 'center', marginTop: 4, marginBottom: 0, fontSize: 10 }}
              onClick={() => setForceReview((v) => !v)}
              title="When ON, the individual journey application's postal code is forced to 33449, which routes the account to manual review in the Alloy sandbox."
            >
              {forceReview ? '⚡ Forcing REVIEW (ZIP 33449)' : 'Force review: off'}
            </button>
          )}
        </div>

        {/* Display controls — theme picker + emoji switch.
            Writes to <html data-theme> / <html data-emojis> via useEffect,
            triggering pure-CSS re-render without unmounting the form. */}
        <div className="prefill-section">
          <div className="prefill-section-title">Display</div>
          <select
            className="prefill-theme-select"
            value={colorScheme}
            onChange={(e) => setColorScheme(e.target.value)}
            style={{ marginBottom: 8 }}
          >
            {THEMES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
          <label className="prefill-toggle-row">
            <span>Show emojis</span>
            <span className="prefill-toggle">
              <input
                type="checkbox"
                checked={showEmojis}
                onChange={(e) => setShowEmojis(e.target.checked)}
              />
              <span className="prefill-toggle-slider" />
            </span>
          </label>
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
                <span className="prefill-nav-num">{s.num > 200 ? s.num - 199 : s.num > 100 ? s.num - 99 : s.num}</span>
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

          {isJointFlow ? (
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

              <div className="prefill-data-row">
                <button
                  className="prefill-btn"
                  onClick={prefillCoHolder}
                  disabled={formData.jointData.coHolders.length >= (formData.jointData.numberOfHolders - 1)}
                >
                  + Add co-holder
                </button>
                {hasCoHolders && <button className="prefill-clear-btn" onClick={() => dispatch({ type: 'CLEAR_CO_HOLDERS' })}>Clear</button>}
              </div>

              <button className="prefill-btn prefill-btn-all" onClick={prefillJointAll}>
                Fill everything
              </button>
            </>
          ) : isIndividualFlow ? (
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
                <button className="prefill-btn" onClick={prefillEntityDocs} disabled={hasEntityDocs}>
                  Formation docs
                </button>
                {hasEntityDocs && <button className="prefill-clear-btn" onClick={() => dispatch({ type: 'CLEAR_ENTITY_DOCS' })}>Clear</button>}
              </div>

              <div className="prefill-data-row">
                <button className="prefill-btn" onClick={prefillParty} disabled={formData.associatedParties.length >= 10}>
                  + Add a party
                </button>
                {hasParties && <button className="prefill-clear-btn" onClick={() => dispatch({ type: 'CLEAR_PARTIES' })}>Clear</button>}
              </div>

              <button className="prefill-btn prefill-btn-all" onClick={() => {
                setAgreedToTerms(true)
                prefillEntityDetails()
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
        <div className="phone-frame-scroll">
          {renderScreen()}
          <div className="powered-footer">
            <span>Powered by</span>
            <img src={interroLogo} alt="Interro" />
          </div>
        </div>
        <div id="phone-modal-root" />
      </div>
    </div>
  )
}
