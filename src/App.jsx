import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AgentAuth from './pages/AgentAuth'
import ClientAuth from './pages/ClientAuth'
import AgentDashboard from './pages/AgentDashboard'
import ClientDashboard from './pages/ClientDashboard'
import { RequireRole } from './components/RequireRole'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/agent" element={<AgentAuth />} />
      <Route path="/client" element={<ClientAuth />} />
      <Route
        path="/agent-dashboard"
        element={
          <RequireRole role="agent">
            <AgentDashboard />
          </RequireRole>
        }
      />
      <Route
        path="/client-dashboard"
        element={
          <RequireRole role="client">
            <ClientDashboard />
          </RequireRole>
        }
      />
    </Routes>
  )
}

export default App
