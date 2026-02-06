const API_BASE = 'http://example.com/api'
const CANDIDATE_PATH = '/candidate'

export async function createCandidate({ leaderName, partyName }) {
	const body = new URLSearchParams({
		name: leaderName,
		party: partyName,
	})

	const response = await fetch(`${API_BASE}${CANDIDATE_PATH}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body,
	})

	if (!response.ok) {
		const message = await response.text()
		throw new Error(message || 'Failed to create candidate')
	}

	try {
		return await response.json()
	} catch {
		return { name: leaderName, party: partyName }
	}
}
