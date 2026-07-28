import { Link } from 'react-router-dom'

function Home() {
  return (
    <section id="center">
      <h1>GetSettled</h1>
      <p>Choose how you'd like to sign in:</p>
      <div className="home-links">
        <Link to="/agent">I'm an Agent</Link>
        <Link to="/client">I'm a Client</Link>
      </div>
    </section>
  )
}

export default Home
