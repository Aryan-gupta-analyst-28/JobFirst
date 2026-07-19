import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import KanbanBoard from './KanbanBoard'
import AlertConfig from './AlertConfig'
import './App.css'

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
      <div>
        <div className="navbar">
          <h1>JobFirst</h1>
          <div>
            <button className={`nav-btn ${view === 'board' ? 'active' : ''}`} onClick={() => setView('board')}>
              Board
            </button>
            <button className={`nav-btn ${view === 'alerts' ? 'active' : ''}`} onClick={() => setView('alerts')}>
              Alert Preferences
            </button>
            <span style={{ marginRight: '10px', marginLeft: '10px', color: '#6b7280', fontSize: '14px' }}>
              {session.user.email}
            </span>
            <button className="logout-btn" onClick={handleLogout}>Log Out</button>
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
    <div className="login-wrapper">
      <div className="login-box">
        <h1>JobFirst</h1>
        <h2>{isSignUp ? 'Create your account' : 'Welcome back'}</h2>
        <form onSubmit={handleAuth}>
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
          />
          <button type="submit">
            {isSignUp ? 'Sign Up' : 'Log In'}
          </button>
        </form>
        <p style={{ marginTop: '16px', fontSize: '14px', color: '#6b7280' }}>
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button className="toggle-btn" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Log In' : 'Sign Up'}
          </button>
        </p>
        {message && <p className={message.includes('successful') ? 'success-msg' : 'error-msg'}>{message}</p>}
      </div>
    </div>
  )
}

export default App