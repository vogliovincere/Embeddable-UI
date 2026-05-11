const JOURNEY_TOKEN = import.meta.env.VITE_JOURNEY_TOKEN

/**
 * POST a journey application to Alloy.
 *
 * Callers pass the full request body. The body MUST include either a
 * `persons` array (individual / joint flows) or an `entities` array
 * (entity flow), and SHOULD include `branch_name` and `external_entity_id`
 * so the journey can route to the correct branch in the Alloy dashboard.
 *
 * Auth headers (Basic) are injected server-side by the Vite dev proxy /
 * Vercel serverless function — never exposed to the browser.
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
