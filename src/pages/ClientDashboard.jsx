import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import MoveTimeline from '../components/MoveTimeline'
import TaskChecklist from '../components/TaskChecklist'

function ClientDashboard() {
  const { session } = useAuth()
  const [profile, setProfile] = useState(null)
  const [tasks, setTasks] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!session) return

    supabase
      .from('clients')
      .select('name, email, move_out_date, move_in_date')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data))

    supabase
      .from('tasks')
      .select('id, task_name, due_date, status, category')
      .order('due_date', { ascending: true })
      .then(({ data }) => setTasks(data ?? []))
  }, [session])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Client Dashboard</h1>
          <p>
            Logged in as {session?.user?.email}
            {profile?.name ? ` — ${profile.name}` : ''}
          </p>
        </div>
        <button type="button" onClick={handleLogout}>
          Log out
        </button>
      </div>

      {profile && <MoveTimeline moveOutDate={profile.move_out_date} moveInDate={profile.move_in_date} />}

      <TaskChecklist tasks={tasks} />
    </div>
  )
}

export default ClientDashboard
