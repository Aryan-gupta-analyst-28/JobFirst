
import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { supabase } from './supabaseClient'

const COLUMNS = ['saved', 'applied', 'interview', 'offer', 'rejected']
const COLUMN_LABELS = {
  saved: 'Saved',
  applied: 'Applied',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
}

function KanbanBoard({ userId }) {
  const [applications, setApplications] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [jobTitle, setJobTitle] = useState('')
  const [company, setCompany] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!error) setApplications(data || [])
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('applications').insert({
      user_id: userId,
      job_title: jobTitle,
      company: company,
      job_url: jobUrl,
      status: 'saved',
      follow_up_date: followUpDate || null,
    })

    if (!error) {
      setJobTitle('')
      setCompany('')
      setJobUrl('')
      setFollowUpDate('')
      setShowForm(false)
      fetchApplications()
    }
  }

  const handleDragEnd = async (result) => {
    if (!result.destination) return

    const newStatus = result.destination.droppableId
    const appId = result.draggableId

    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
    )

    await supabase.from('applications').update({ status: newStatus }).eq('id', appId)
  }

  // --- Stats calculations ---
  const totalApplications = applications.filter((a) => a.status !== 'saved').length
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const thisWeekCount = applications.filter(
    (a) => a.status !== 'saved' && new Date(a.created_at) >= oneWeekAgo
  ).length
  const interviewCount = applications.filter((a) => a.status === 'interview').length
  const offerCount = applications.filter((a) => a.status === 'offer').length

  const today = new Date().toISOString().split('T')[0]
  const dueToday = applications.filter((a) => a.follow_up_date === today)

  return (
    <div>
      {/* Stats bar */}
      <div className="stats-bar">
        <div className="stat-card">
          <span className="stat-number">{totalApplications}</span>
          <span className="stat-label">Total Applied</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{thisWeekCount}</span>
          <span className="stat-label">This Week</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{interviewCount}</span>
          <span className="stat-label">Interviews</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{offerCount}</span>
          <span className="stat-label">Offers</span>
        </div>
      </div>

      {/* Follow-up reminders */}
      {dueToday.length > 0 && (
        <div className="reminder-banner">
          🔔 Follow up today: {dueToday.map((a) => a.job_title).join(', ')}
        </div>
      )}

      <button className="add-btn" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : '+ Add Application'}
      </button>

      {showForm && (
        <form onSubmit={handleAdd} className="add-form">
          <input placeholder="Job Title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required />
          <input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
          <input placeholder="Job URL" value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} />
          <input
            type="date"
            placeholder="Follow-up date"
            value={followUpDate}
            onChange={(e) => setFollowUpDate(e.target.value)}
          />
          <button type="submit" className="add-btn" style={{ margin: 0 }}>Add</button>
        </form>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="board">
          {COLUMNS.map((col) => (
            <Droppable droppableId={col} key={col}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="column">
                  <h3>{COLUMN_LABELS[col]}</h3>
                  {applications
                    .filter((app) => app.status === col)
                    .map((app, index) => (
                      <Draggable draggableId={app.id} index={index} key={app.id}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="card"
                            style={provided.draggableProps.style}
                          >
                            <strong>{app.job_title}</strong>
                            <p>{app.company}</p>
                            {app.follow_up_date && (
                              <p className={app.follow_up_date === today ? 'due-today' : 'follow-up-date'}>
                                📅 Follow up: {app.follow_up_date}
                              </p>
                            )}
                            {app.job_url && (
                              <a href={app.job_url} target="_blank" rel="noreferrer">
                                View posting →
                              </a>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  )
}

export default KanbanBoard