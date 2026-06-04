const JOURNEY_TOKEN = import.meta.env.VITE_JOURNEY_TOKEN

// Org identifiers for this Alloy account (sandbox). Same across all flows.
const EXTERNAL_PARTNER_ID = 'c20a1ec1-8071-4a61-9a3f-1de3006e3bb9'
const EXTERNAL_PRODUCT_ID = 'org-test-002'

// crypto.randomUUID with an RFC 4122 v4 fallback for older browsers.
export function randomUuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Build a journey-application body in Alloy's multi-entity `entities[]` format.
 *
 * The journey's post-CIP router branches on `data.meta.kycVariant`:
 *   - 'basic'    → data-only CIP (no Socure DocV / SDK step-up)
 *   - 'complete' → routed through Socure DocV (hosted by the Alloy SDK)
 *
 * `person` is a normalized object (all fields optional, omitted when falsy):
 *   { nameFirst, nameLast, email, phone, birthDate (ISO yyyy-mm-dd),
 *     ssn (digits only), address: { line1, city, state, postalCode, countryCode } }
 */
export function buildJourneyApplication(person, { kycVariant }) {
  const verId = `ver_${randomUuid()}`

  const data = {
    meta: { kycVariant },
    name_first: person.nameFirst || undefined,
    name_last: person.nameLast || undefined,
    name_middle: null,
    birth_date: person.birthDate || undefined,
    document_ssn: person.ssn || undefined,
    phone_number: person.phone || undefined,
    email_address: person.email || undefined,
    ip_address_v4: null,
  }

  if (person.address) {
    const a = person.address
    data.addresses = [{
      line_1: a.line1,
      line_2: null,
      city: a.city,
      state: a.state,
      postal_code: a.postalCode,
      country_code: a.countryCode || 'US',
      type: 'primary',
    }]
  }

  return {
    entities: [{
      data,
      branch_name: 'persons',
      entity_type: 'person',
      external_entity_id: `user_${randomUuid()}`,
    }],
    application_meta: {},
    external_group_id: verId,
    external_partner_id: EXTERNAL_PARTNER_ID,
    external_product_id: EXTERNAL_PRODUCT_ID,
    external_application_id: verId,
  }
}

/**
 * Pull the person entity token out of a create-application response, so we can
 * attach documents to it afterward.
 */
export function getEntityToken(appResult) {
  const ea = appResult?._embedded?.entity_applications?.[0]?.entity_token
  if (ea) return ea
  return appResult?._embedded?.child_entities?.[0]?.token || null
}

/**
 * POST a journey application to Alloy.
 *
 * Callers pass the full request body (see `buildJourneyApplication`).
 * Auth headers (Basic) are injected server-side by the Vite dev proxy /
 * serverless function — never exposed to the browser.
 */
export async function createJourneyApplication(body) {
  const url = `/api/alloy/journeys/${JOURNEY_TOKEN}/applications`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'alloy-journey-application-sync': 'true',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    throw new Error(`Journey application failed (${response.status}): ${errText}`)
  }
  return response.json()
}

/**
 * Attach a document image to an existing entity so it is viewable in Alloy.
 * Two-step: create the document record (returns a token), then upload the raw
 * bytes. `file` is a browser File/Blob; `type` is an Alloy document type code.
 */
export async function uploadEntityDocument(entityToken, { name, extension, type, file }) {
  const metaRes = await fetch(`/api/alloy/entities/${entityToken}/documents`, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, extension, type }),
  })
  if (!metaRes.ok) {
    const t = await metaRes.text().catch(() => '')
    throw new Error(`Create document failed (${metaRes.status}): ${t}`)
  }
  const { document_token } = await metaRes.json()

  const putRes = await fetch(`/api/alloy/entities/${entityToken}/documents/${document_token}`, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  })
  if (!putRes.ok) {
    const t = await putRes.text().catch(() => '')
    throw new Error(`Upload document bytes failed (${putRes.status}): ${t}`)
  }
  return putRes.json()
}
