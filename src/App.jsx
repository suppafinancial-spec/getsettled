import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import './App.css'

function App() {
  const [status, setStatus] = useState('checking')
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function checkConnection() {
      const { error } = await supabase
        .from('brokerages')
        .select('id', { count: 'exact', head: true })

      if (cancelled) return

      if (error) {
        setStatus('error')
        setError(error.message)
      } else {
        setStatus('connected')
      }
    }

    checkConnection()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section id="center">
      <h1>GetSettled</h1>
      <p>Supabase connection status: <strong>{status}</strong></p>
      {error && <p className="error">{error}</p>}
    </section>
  )
}

export default App
