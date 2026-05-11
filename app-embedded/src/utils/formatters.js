// Convert MM/DD/YYYY to YYYY-MM-DD (ISO 8601) for Alloy API
export function toIsoDate(dob) {
  if (!dob) return ''
  const parts = dob.split('/')
  if (parts.length !== 3) return dob
  const [mm, dd, yyyy] = parts
  return `${yyyy}-${mm}-${dd}`
}

// US state full name → 2-letter abbreviation
const STATE_ABBR = {
  'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR',
  'California': 'CA', 'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE',
  'Florida': 'FL', 'Georgia': 'GA', 'Hawaii': 'HI', 'Idaho': 'ID',
  'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA', 'Kansas': 'KS',
  'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
  'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS',
  'Missouri': 'MO', 'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM', 'New York': 'NY',
  'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH', 'Oklahoma': 'OK',
  'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
  'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT',
  'Vermont': 'VT', 'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV',
  'Wisconsin': 'WI', 'Wyoming': 'WY',
}

export function toStateAbbr(stateName) {
  if (!stateName) return ''
  // Already an abbreviation
  if (stateName.length === 2) return stateName.toUpperCase()
  return STATE_ABBR[stateName] || stateName
}

// Normalize a phone string to E.164 (e.g., "+13105550101"). Alloy KYC rejects
// raw 10-digit US numbers like "5559876543". Strip non-digits, then:
// - if already starts with "+", trust it (after stripping spaces/dashes upstream)
// - if 10 digits, default to US country code (+1)
// - if 11 digits starting with "1", treat as US (+1XXXXXXXXXX)
// - otherwise return undefined so the field is omitted rather than sent malformed
export function toE164Phone(phone, defaultCountry = 'US') {
  if (!phone) return undefined
  const trimmed = String(phone).trim()
  if (trimmed.startsWith('+')) {
    const rest = trimmed.slice(1).replace(/\D/g, '')
    return rest ? `+${rest}` : undefined
  }
  const digits = trimmed.replace(/\D/g, '')
  if (!digits) return undefined
  if (defaultCountry === 'US') {
    if (digits.length === 10) return `+1${digits}`
    if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  }
  return undefined
}
