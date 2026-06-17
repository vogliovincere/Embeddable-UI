// Procedural test-data generator for the Dev Tools prefill.
// Every call returns a fresh, unique persona / company / party so testers never
// re-submit the same identity. Shapes match what the form reducer expects
// (see SET_INDIVIDUAL_DATA / SET_ENTITY_DETAILS / ADD_PARTY / ADD_CO_HOLDER).

const FIRST_NAMES = [
  'James', 'Maria', 'David', 'Sarah', 'Michael', 'Elena', 'Robert', 'Lisa',
  'Daniel', 'Amanda', 'Christopher', 'Jessica', 'Matthew', 'Ashley', 'Joshua',
  'Sofia', 'Andrew', 'Olivia', 'Joseph', 'Emily', 'Ryan', 'Grace', 'Brandon',
  'Natalie', 'Justin', 'Hannah', 'Samuel', 'Victoria', 'Benjamin', 'Chloe',
  'Marcus', 'Priya', 'Diego', 'Aisha', 'Kenji', 'Fatima', 'Lucas', 'Ingrid',
]

const LAST_NAMES = [
  'Smith', 'Johnson', 'Chen', 'Rodriguez', 'Okafor', 'Kim', 'Torres', 'Wright',
  'Patel', 'Nguyen', 'Garcia', 'Martinez', 'Anderson', 'Thompson', 'Walker',
  'Hall', 'Young', 'King', 'Wright', 'Lopez', 'Hill', 'Scott', 'Green',
  'Adams', 'Baker', 'Nelson', 'Carter', 'Mitchell', 'Perez', 'Roberts',
  'Murphy', 'Bailey', 'Rivera', 'Cooper', 'Richardson', 'Cox', 'Howard',
]

const MIDDLE_NAMES = ['', '', '', 'Marie', 'Wei', 'Sofia', 'James', 'Lee', 'Ann', 'Raj', '']

// City / state / postal combos kept internally consistent (real city in real state).
// State is the full name so toStateAbbr() and the address dropdowns resolve it.
const LOCATIONS = [
  { city: 'San Francisco', state: 'California', zip: '94102' },
  { city: 'Los Angeles', state: 'California', zip: '90012' },
  { city: 'New York', state: 'New York', zip: '10013' },
  { city: 'Brooklyn', state: 'New York', zip: '11201' },
  { city: 'Austin', state: 'Texas', zip: '73301' },
  { city: 'Houston', state: 'Texas', zip: '77002' },
  { city: 'Miami', state: 'Florida', zip: '33131' },
  { city: 'Orlando', state: 'Florida', zip: '32801' },
  { city: 'Chicago', state: 'Illinois', zip: '60601' },
  { city: 'Denver', state: 'Colorado', zip: '80202' },
  { city: 'Seattle', state: 'Washington', zip: '98101' },
  { city: 'Boston', state: 'Massachusetts', zip: '02108' },
  { city: 'Atlanta', state: 'Georgia', zip: '30303' },
  { city: 'Portland', state: 'Oregon', zip: '97204' },
  { city: 'Phoenix', state: 'Arizona', zip: '85004' },
  { city: 'Nashville', state: 'Tennessee', zip: '37201' },
]

const STREET_NAMES = [
  'Main Street', 'Oak Avenue', 'Maple Drive', 'Market Street', 'Broadway',
  'Park Avenue', 'Elm Street', 'Cedar Lane', 'Washington Boulevard', 'Lincoln Way',
  'Sunset Boulevard', 'Congress Avenue', 'Michigan Avenue', 'Brickell Avenue',
  'Pine Street', 'Lake Shore Drive',
]

const COMPANY_CORES = [
  'Acme', 'Summit', 'Pioneer', 'Vertex', 'Horizon', 'Atlas', 'Nimbus', 'Beacon',
  'Quantum', 'Cobalt', 'Granite', 'Meridian', 'Cascade', 'Sterling', 'Aurora',
  'Ironwood', 'Northstar', 'Bluewave', 'Redwood', 'Keystone',
]

const COMPANY_INDUSTRIES = [
  'Robotics', 'Capital', 'Logistics', 'Holdings', 'Ventures', 'Labs', 'Industries',
  'Technologies', 'Partners', 'Trading', 'Systems', 'Group', 'Dynamics', 'Analytics',
]

const COMPANY_SUFFIXES = ['LLC', 'Inc.', 'Corp.', 'LLC', 'Holdings LLC', 'Partners LP']

const ENTITY_STATES = ['Delaware', 'Nevada', 'Wyoming', 'California', 'New York', 'Texas']

const US = { code: 'US', name: 'United States', flag: '🇺🇸' }
const US_LONG = { code: 'US', name: 'United States of America', flag: '🇺🇸' }

const PROOF_OF_ADDRESS_DOCS = [
  'Utility bill', 'Bank statement', 'Lease agreement', 'Insurance statement',
]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pad(n, len) {
  return String(n).padStart(len, '0')
}

// A unique-enough suffix for emails so generated personas never collide.
function uniqueTag() {
  return randInt(100, 9999)
}

function genSsn() {
  // Avoid invalid area numbers (000, 666, 900-999) for plausibility.
  let area = randInt(1, 899)
  if (area === 666) area = 667
  const group = randInt(1, 99)
  const serial = randInt(1, 9999)
  return `${pad(area, 3)}-${pad(group, 2)}-${pad(serial, 4)}`
}

function genPhone() {
  // 10-digit, raw (form formats on display). Area + exchange start 2-9.
  const area = randInt(200, 989)
  const exch = randInt(200, 989)
  const line = randInt(0, 9999)
  return `${area}${exch}${pad(line, 4)}`
}

function genDob(minAge = 22, maxAge = 70) {
  const now = 2026
  const year = now - randInt(minAge, maxAge)
  const month = randInt(1, 12)
  const day = randInt(1, 28)
  return `${pad(month, 2)}/${pad(day, 2)}/${year}`
}

function genEmail(first, last) {
  return `${first}.${last}${uniqueTag()}@example.com`.toLowerCase()
}

function genStreet() {
  return `${randInt(10, 9999)} ${pick(STREET_NAMES)}`
}

function genApartment() {
  // ~40% have a unit.
  if (Math.random() > 0.4) return ''
  return pick(['Apt 4B', 'Suite 300', 'Unit 12', 'Ste 1500', '#7', 'Apt 22C'])
}

// ---- Public generators -----------------------------------------------------

// Full individual persona (personal info + address + proof of address) in one
// internally-consistent object. Used for the individual / joint primary holder.
export function generateIndividual() {
  const firstName = pick(FIRST_NAMES)
  const lastName = pick(LAST_NAMES)
  const loc = pick(LOCATIONS)
  return {
    firstName,
    lastName,
    email: genEmail(firstName, lastName),
    phone: genPhone(),
    dob: genDob(),
    taxId: genSsn(),
    addressCountry: US_LONG,
    addressState: loc.state,
    streetAddress: genStreet(),
    city: loc.city,
    postalCode: loc.zip,
    apartment: genApartment(),
    proofOfAddress: [{ name: `${pick(['utility', 'bank', 'lease'])}-doc-${uniqueTag()}.pdf`, type: pick(PROOF_OF_ADDRESS_DOCS) }],
  }
}

// Fresh company for the entity flow.
export function generateCompany() {
  const entityName = `${pick(COMPANY_CORES)} ${pick(COMPANY_INDUSTRIES)} ${pick(COMPANY_SUFFIXES)}`
  return {
    country: { code: 'US', name: 'United States', flag: '🇺🇸' },
    state: pick(ENTITY_STATES),
    entityName,
    fileNumber: String(randInt(1000000, 99999999)),
  }
}

// Associated party (UBO / Control Person) for the entity flow.
// Pass isControlPerson=true for the first party so the entity has a control role.
export function generateParty(isControlPerson = false) {
  const firstName = pick(FIRST_NAMES)
  const lastName = pick(LAST_NAMES)
  const loc = pick(LOCATIONS)
  return {
    roles: isControlPerson ? ['Control Person', 'UBO'] : ['UBO'],
    firstName,
    lastName,
    middleName: pick(MIDDLE_NAMES),
    dob: genDob(25, 70),
    email: genEmail(firstName, lastName),
    phone: genPhone(),
    ssn: genSsn(),
    country: US,
    state: loc.state,
    streetAddress: genStreet(),
    city: loc.city,
    postalCode: loc.zip,
    apartment: genApartment(),
  }
}

// Co-holder for the joint flow.
export function generateCoHolder() {
  const firstName = pick(FIRST_NAMES)
  const lastName = pick(LAST_NAMES)
  const loc = pick(LOCATIONS)
  return {
    firstName,
    lastName,
    dob: genDob(25, 70),
    email: genEmail(firstName, lastName),
    phone: genPhone(),
    country: US,
    state: loc.state,
    streetAddress: genStreet(),
    city: loc.city,
    postalCode: loc.zip,
    apartment: genApartment(),
  }
}
