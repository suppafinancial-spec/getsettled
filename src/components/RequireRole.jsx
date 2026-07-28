import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

export function RequireRole({ role, children }) {
  const { session, loading } = useAuth()
  const [checked, setChecked] = useState(false)
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!session) {
      setChecked(true)
      return
    }

    const table = role === 'agent' ? 'agents' : 'clients'
    let cancelled = false

    supabase
      .from(table)
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return
        setAllowed(!!data)
        setChecked(true)
      })

    return () => {
      cancelled = true
    }
  }, [session, loading, role])

  if (loading || !checked) return <p>Loading...</p>
  if (!session || !allowed) return <Navigate to="/" replace />

  return children
}
