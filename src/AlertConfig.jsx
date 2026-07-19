import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

function AlertConfig({ userId }) {
  const [keywords, setKeywords] = useState('')
  const [locations, setLocations] = useState('')
  const [minScore, setMinScore] = useState(50)
  const [configId, setConfigId] = useState(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    const { data, error } = await supabase
      .from('job_alerts_config')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (data) {
      setConfigId(data.id)
      setKeywords((data.keywords || []).join(', '))
      setLocations((data.locations || []).join(', '))
      setMinScore(data.min_match_score || 50)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setMessage('')

    const keywordsArray = keywords.split(',').map((k) => k.trim()).filter(Boolean)
    const locationsArray = locations.split(',').map((l) => l.trim()).filter(Boolean)

    if (configId) {
      const { error } = await supabase
        .from('job_alerts_config')
        .update({
          keywords: keywordsArray,
          locations: locationsArray,
          min_match_score: minScore,
          active: true,
        })
        .eq('id', configId)

      if (error) setMessage('Error: ' + error.message)
      else setMessage('Preferences updated!')
    } else {
      const { data, error } = await supabase
        .from('job_alerts_config')
        .insert({
          user_id: userId,
          keywords: keywordsArray,
          locations: locationsArray,
          min_match_score: minScore,
          active: true,
        })
        .select()
        .single()

      if (error) setMessage('Error: ' + error.message)
      else {
        setConfigId(data.id)
        setMessage('Preferences saved!')
      }
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h2>Job Alert Preferences</h2>
      <form onSubmit={handleSave}>
        <div style={{ marginBottom: '10px' }}>
          <label>Keywords (comma-separated)</label>
          <br />
          <input
            type="text"
            placeholder="data analyst, business analyst"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Locations (comma-separated)</label>
          <br />
          <input
            type="text"
            placeholder="Mumbai, Remote"
            value={locations}
            onChange={(e) => setLocations(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Minimum Match Score</label>
          <br />
          <input
            type="number"
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button type="submit" style={{ padding: '10px 20px' }}>
          Save Preferences
        </button>
      </form>
      {message && <p style={{ color: message.startsWith('Error') ? 'red' : 'green' }}>{message}</p>}
    </div>
  )
}

export default AlertConfig