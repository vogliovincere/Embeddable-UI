// Document types available per country.
// Countries not listed here get the default set.
const countryDocTypes = {
  US: ['ID card', 'Passport', 'Driving license'],
  GB: ['ID card', 'Passport', 'Driving license', 'Residence permit'],
  CA: ['ID card', 'Passport', 'Driving license', 'Residence permit'],
  AU: ['ID card', 'Passport', 'Driving license'],
  DE: ['ID card', 'Passport', 'Residence permit', 'Driving license'],
  FR: ['ID card', 'Passport', 'Residence permit', 'Driving license'],
  JP: ['Passport', 'Residence permit', 'Driving license'],
  CH: ['ID card', 'Passport', 'Residence permit', 'Driving license'],
  SG: ['ID card', 'Passport'],
  IN: ['Passport', 'Driving license'],
  BR: ['ID card', 'Passport', 'Driving license'],
  MX: ['ID card', 'Passport', 'Driving license'],
}

const defaultDocTypes = ['ID card', 'Passport', 'Residence permit', 'Driving license']

export function getDocTypesForCountry(countryCode) {
  return countryDocTypes[countryCode] || defaultDocTypes
}

// How many upload sides each doc type requires
export const docUploadSides = {
  'Passport': ['Data page'],
  'ID card': ['Front side', 'Back side'],
  'Driving license': ['Front side', 'Back side'],
  'Residence permit': ['Front side', 'Back side'],
}

// Map UI document labels → Alloy document `type` codes (for attaching to an entity).
// NOTE: only 'license' is confirmed against the sandbox; the others are inferred.
export const docTypeToAlloyCode = {
  'Driving license': 'license',
  'Passport': 'passport',
  'ID card': 'state_id',
  'Residence permit': 'residence_permit',
}

// Short document name used when attaching a given upload side to Alloy.
export function docSideName(side) {
  const s = (side || '').toLowerCase()
  if (s.includes('back')) return 'back'
  if (s.includes('data')) return 'data_page'
  return 'front'
}
