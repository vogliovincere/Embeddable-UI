const JOURNEY_TOKEN = import.meta.env.VITE_JOURNEY_TOKEN

export async function createJourneyApplication(personData) {
  // Route through Vite dev proxy at /api/alloy → sandbox.alloy.co
  // Auth headers are injected by the proxy (server-side), not exposed to the browser
  const url = `/api/alloy/journeys/${JOURNEY_TOKEN}/applications`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'alloy-journey-application-sync': 'true',
    },
    body: JSON.stringify({ persons: [personData] }),
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => '')
    throw new Error(`Journey application failed (${response.status}): ${errText}`)
  }
  return response.json()
}
