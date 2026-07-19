
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import KanbanBoard from './KanbanBoard'
import AlertConfig from './AlertConfig'

function App() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  const [view, setView] = useState('board')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const handleAuth = async (e) => {
    e.preventDefault()
    setMessage('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMessage(error.message)
      else setMessage('Signup successful! Check your email to confirm, then log in.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMessage(error.message)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (session) {
    return (
      <div style={{ fontFamily: 'sans-serif' }}>
        <div style={{ padding: '20px 20px 0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>JobFirst</h1>
          <div>
            <button onClick={() => setView('board')} style={{ marginRight: '10px', fontWeight: view === 'board' ? 'bold' : 'normal' }}>
              Board
            </button>
            <button onClick={() => setView('alerts')} style={{ marginRight: '10px', fontWeight: view === 'alerts' ? 'bold' : 'normal' }}>
              Alert Preferences
            </button>
            <span style={{ marginRight: '10px' }}>{session.user.email}</span>
            <button onClick={handleLogout}>Log Out</button>
          </div>
        </div>
        {view === 'board' ? (
          <KanbanBoard userId={session.user.id} />
        ) : (
          <AlertConfig userId={session.user.id} />
        )}
      </div>
    )
  }

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '0 auto' }}>
      <h1>JobFirst</h1>
      <h2>{isSignUp ? 'Sign Up' : 'Log In'}</h2>
      <form onSubmit={handleAuth}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px' }}>
          {isSignUp ? 'Sign Up' : 'Log In'}
        </button>
      </form>
      <p style={{ marginTop: '10px' }}>
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button onClick={() => setIsSignUp(!isSignUp)} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}>
          {isSignUp ? 'Log In' : 'Sign Up'}
        </button>
      </p>
      {message && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  )
}

export default App