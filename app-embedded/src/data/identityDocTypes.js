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
