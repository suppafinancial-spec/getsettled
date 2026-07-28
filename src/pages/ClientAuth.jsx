import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

function ClientAuth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [agentId, setAgentId] = useState('')
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role: 'client', name, agent_id: agentId } },
      })
      if (error) {
        setError(error.message)
        return
      }
      if (data.session) {
        navigate('/client-dashboard')
      } else {
        setMessage('Account created — check your email to confirm, then log in below.')
        setMode('login')
      }
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      return
    }
    navigate('/client-dashboard')
  }

  return (
    <section id="center">
      <h1>Client {mode === 'login' ? 'Login' : 'Sign Up'}</h1>
      <form onSubmit={handleSubmit} className="auth-form">
        {mode === 'signup' && (
          <>
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Agent ID"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
              required
            />
          </>
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <button type="submit">{mode === 'login' ? 'Log In' : 'Sign Up'}</button>
      </form>
      {error && <p className="error">{error}</p>}
      {message && <p>{message}</p>}
      <button
        type="button"
        className="link-button"
        onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
      >
        {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Log in'}
      </button>
      <Link to="/">Back home</Link>
    </section>
  )
}

export default ClientAuth
