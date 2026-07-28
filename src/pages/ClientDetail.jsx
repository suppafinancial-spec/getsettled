import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import MoveTimeline from '../components/MoveTimeline'
import TaskChecklist from '../components/TaskChecklist'

function ClientDetail() {
  const { clientId } = useParams()
  const [client, setClient] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('clients')
      .select('name, move_out_date, move_in_date')
      .eq('id', clientId)
      .maybeSingle()
      .then(({ data }) => setClient(data))

    supabase
      .from('tasks')
      .select('id, task_name, due_date, status, category')
      .eq('client_id', clientId)
      .order('due_date', { ascending: true })
      .then(({ data }) => {
        setTasks(data ?? [])
        setLoading(false)
      })
  }, [clientId])

  if (loading) return <p>Loading…</p>
  if (!client) return <p>Client not found.</p>

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>{client.name}</h1>
          <p>Client created — starter tasks generated below.</p>
        </div>
        <Link to="/agent-dashboard">Back to dashboard</Link>
      </div>

      <MoveTimeline moveOutDate={client.move_out_date} moveInDate={client.move_in_date} />
      <TaskChecklist tasks={tasks} />
    </div>
  )
}

export default ClientDetail
