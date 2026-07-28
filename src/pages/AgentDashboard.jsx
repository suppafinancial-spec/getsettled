import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

function AgentDashboard() {
  const { session } = useAuth()
  const [profile, setProfile] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!session) return
    supabase
      .from('agents')
      .select('name, email, brokerage_id')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data))
  }, [session])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <section id="center">
      <h1>Agent Dashboard</h1>
      <p>Logged in as {session?.user?.email}</p>
      {profile && (
        <p>
          {profile.name} — brokerage {profile.brokerage_id}
        </p>
      )}
      <Link to="/agent/new-client">+ Add New Client</Link>
      <button type="button" onClick={handleLogout}>
        Log out
      </button>
    </section>
  )
}

export default AgentDashboard
