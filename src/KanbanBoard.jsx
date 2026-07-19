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
    })

    if (!error) {
      setJobTitle('')
      setCompany('')
      setJobUrl('')
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

  return (
    <div style={{ padding: '20px' }}>
      <button onClick={() => setShowForm(!showForm)} style={{ marginBottom: '20px', padding: '10px' }}>
        {showForm ? 'Cancel' : '+ Add Application'}
      </button>

      {showForm && (
        <form onSubmit={handleAdd} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
          <input placeholder="Job Title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} required style={{ padding: '8px' }} />
          <input placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} style={{ padding: '8px' }} />
          <input placeholder="Job URL" value={jobUrl} onChange={(e) => setJobUrl(e.target.value)} style={{ padding: '8px' }} />
          <button type="submit" style={{ padding: '8px' }}>Add</button>
        </form>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', gap: '15px', overflowX: 'auto' }}>
          {COLUMNS.map((col) => (
            <Droppable droppableId={col} key={col}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    background: '#f4f4f4',
                    borderRadius: '8px',
                    padding: '10px',
                    minWidth: '220px',
                    minHeight: '400px',
                  }}
                >
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
                            style={{
                              background: 'white',
                              padding: '10px',
                              borderRadius: '6px',
                              marginBottom: '8px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                              ...provided.draggableProps.style,
                            }}
                          >
                            <strong>{app.job_title}</strong>
                            <p style={{ margin: '4px 0', fontSize: '14px', color: '#555' }}>{app.company}</p>
                            {app.job_url && (
                              <a href={app.job_url} target="_blank" rel="noreferrer" style={{ fontSize: '12px' }}>
                                View posting
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