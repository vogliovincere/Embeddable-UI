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

  return (
    <div className="phone-frame-wrapper">
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
