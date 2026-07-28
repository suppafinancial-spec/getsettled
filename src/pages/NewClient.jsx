import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { generateStarterTasks } from '../data/taskTemplates'

const PERSONA_OPTIONS = [
  { value: 'first_time_buyer', label: 'First-time buyer' },
  { value: 'repeat_buyer', label: 'Repeat buyer' },
  { value: 'family', label: 'Family' },
  { value: 'senior_downsizing', label: 'Senior downsizing' },
  { value: 'investor', label: 'Investor' },
]

const initialForm = {
  name: '',
  moveOutDate: '',
  moveInDate: '',
  moveOutPostalCode: '',
  moveInPostalCode: '',
  personaType: PERSONA_OPTIONS[0].value,
  propertyType: 'condo',
  hasKids: 'no',
  hasPets: 'no',
}

function NewClient() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (new Date(form.moveInDate) < new Date(form.moveOutDate)) {
      setError('Move-in date must be on or after move-out date.')
      return
    }

    setSubmitting(true)

    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (agentError || !agent) {
      setError('Could not find your agent profile.')
      setSubmitting(false)
      return
    }

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        agent_id: agent.id,
        name: form.name,
        move_out_date: form.moveOutDate,
        move_in_date: form.moveInDate,
        move_out_postal_code: form.moveOutPostalCode,
        move_in_postal_code: form.moveInPostalCode,
        persona_type: form.personaType,
        property_type: form.propertyType,
        has_kids: form.hasKids === 'yes',
        has_pets: form.hasPets === 'yes',
      })
      .select()
      .single()

    if (clientError || !client) {
      setError(clientError?.message ?? 'Could not create client.')
      setSubmitting(false)
      return
    }

    const starterTasks = generateStarterTasks({
      moveOutDate: form.moveOutDate,
      moveInDate: form.moveInDate,
      hasKids: form.hasKids === 'yes',
      hasPets: form.hasPets === 'yes',
    }).map((task) => ({ ...task, client_id: client.id }))

    const { error: tasksError } = await supabase.from('tasks').insert(starterTasks)

    if (tasksError) {
      setError(`Client created, but starter tasks failed: ${tasksError.message}`)
      setSubmitting(false)
      return
    }

    navigate(`/agent/clients/${client.id}`)
  }

  return (
    <section id="center">
      <h1>New Client Intake</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="text"
          placeholder="Client full name"
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          required
        />

        <label>
          Move-out date
          <input
            type="date"
            value={form.moveOutDate}
            onChange={(e) => updateField('moveOutDate', e.target.value)}
            required
          />
        </label>

        <label>
          Move-in date
          <input
            type="date"
            value={form.moveInDate}
            onChange={(e) => updateField('moveInDate', e.target.value)}
            required
          />
        </label>

        <input
          type="text"
          placeholder="Move-out postal code"
          value={form.moveOutPostalCode}
          onChange={(e) => updateField('moveOutPostalCode', e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Move-in postal code"
          value={form.moveInPostalCode}
          onChange={(e) => updateField('moveInPostalCode', e.target.value)}
          required
        />

        <label>
          Persona type
          <select value={form.personaType} onChange={(e) => updateField('personaType', e.target.value)}>
            {PERSONA_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Property type
          <select value={form.propertyType} onChange={(e) => updateField('propertyType', e.target.value)}>
            <option value="condo">Condo</option>
            <option value="house">House</option>
          </select>
        </label>

        <label>
          Kids?
          <select value={form.hasKids} onChange={(e) => updateField('hasKids', e.target.value)}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </label>

        <label>
          Pets?
          <select value={form.hasPets} onChange={(e) => updateField('hasPets', e.target.value)}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create Client'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
    </section>
  )
}

export default NewClient
