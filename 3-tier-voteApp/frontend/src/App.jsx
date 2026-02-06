import { useMemo, useState } from 'react'
import './App.css'
import { createCandidate } from './api'

const EMPTY_FORM = {
  leaderName: '',
  partyName: '',
}

function App() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [candidates, setCandidates] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = useMemo(() => {
    return (
      form.leaderName.trim().length > 0 &&
      form.partyName.trim().length > 0 &&
      !isSubmitting
    )
  }, [form.leaderName, form.partyName, isSubmitting])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!canSubmit) return

    const payload = {
      leaderName: form.leaderName.trim(),
      partyName: form.partyName.trim(),
    }

    setIsSubmitting(true)
    setError('')

    const localId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random()}`

    try {
      const response = await createCandidate(payload)
      const newCard = {
        id: response?.id ?? localId,
        leaderName: response?.name ?? payload.leaderName,
        partyName: response?.party ?? payload.partyName,
      }
      setCandidates((prev) => [newCard, ...prev])
      setForm(EMPTY_FORM)
    } catch (err) {
      setCandidates((prev) => [
        { id: localId, leaderName: payload.leaderName, partyName: payload.partyName },
        ...prev,
      ])
      setForm(EMPTY_FORM)
      setError('API unavailable. Added locally for demo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="app">
      <header className="hero">
        <p className="eyebrow">Candidate demo</p>
        <h1>Create your candidate</h1>
        <p className="subtitle">
          Add a leader and party name. Each submission creates a new card.
        </p>
      </header>

      <section className="panel">
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Leader name</span>
            <input
              type="text"
              name="leaderName"
              value={form.leaderName}
              onChange={handleChange}
              placeholder="e.g. Amina Patel"
              autoComplete="off"
              required
            />
          </label>
          <label className="field">
            <span>Party name</span>
            <input
              type="text"
              name="partyName"
              value={form.partyName}
              onChange={handleChange}
              placeholder="e.g. Sunrise Alliance"
              autoComplete="off"
              required
            />
          </label>
          <button className="primary" type="submit" disabled={!canSubmit}>
            {isSubmitting ? 'Adding...' : 'Add candidate'}
          </button>
        </form>
        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="grid" aria-live="polite">
        {candidates.length === 0 ? (
          <div className="empty">
            <p>No candidates yet. Add the first one above.</p>
          </div>
        ) : (
          candidates.map((candidate) => (
            <article key={candidate.id} className="candidate-card">
              <div className="avatar">{candidate.leaderName.charAt(0)}</div>
              <div>
                <h2>{candidate.leaderName}</h2>
                <p>{candidate.partyName}</p>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  )
}

export default App
