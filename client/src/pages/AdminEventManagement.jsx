"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./AdminEventManagement.css"

const AdminEventManagement = () => {
  const [events, setEvents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    city: "",
    state: "",
    zip: "",
    required_skills: [],
    urgency_level: "",
    start_datetime: "",
    end_datetime: "",
  })

  const SERVER_URL = "http://localhost:8080"

  // US States for dropdown
  const states = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
  ]

  // Available skills for multi-select
  const availableSkills = [
    "First Aid",
    "CPR",
    "Communication",
    "Leadership",
    "Organization",
    "Physical Labor",
    "Teaching",
    "Cooking",
    "Driving",
    "Technology",
    "Translation",
    "Medical",
    "Construction",
    "Event Planning",
    "Fundraising",
  ]

  // Urgency levels
  const urgencyLevels = ["low", "medium", "high", "critical"]

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/events`)
      const data = await response.json()
      if (response.ok) {
        setEvents(data.events || [])
      }
    } catch (error) {
      console.error("Error fetching events:", error)
      setMessage("Error loading events")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setMessage("")
  }

  const handleSkillsChange = (skill) => {
    setFormData((prev) => ({
      ...prev,
      required_skills: prev.required_skills.includes(skill)
        ? prev.required_skills.filter((s) => s !== skill)
        : [...prev.required_skills, skill],
    }))
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      location: "",
      city: "",
      state: "",
      zip: "",
      required_skills: [],
      urgency_level: "",
      start_datetime: "",
      end_datetime: "",
    })
    setEditingEvent(null)
    setShowForm(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")

    // Validation
    if (
      !formData.name ||
      !formData.description ||
      !formData.city ||
      !formData.state ||
      !formData.zip ||
      !formData.urgency_level ||
      formData.required_skills.length === 0
    ) {
      setMessage("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    try {
      const url = editingEvent ? `${SERVER_URL}/api/events/${editingEvent.event_id}` : `${SERVER_URL}/api/events`

      const method = editingEvent ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage(editingEvent ? "Event updated successfully!" : "Event created successfully!")
        fetchEvents()
        resetForm()
      } else {
        setMessage(data.message || "Operation failed")
      }
    } catch (error) {
      console.error("Error:", error)
      setMessage("Server error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (event) => {
    setFormData({
      name: event.name || "",
      description: event.description || "",
      location: event.location || "",
      city: event.City || "",
      state: event.State || "",
      zip: event.zip || "",
      required_skills: Array.isArray(event.required_skills) ? event.required_skills : [],
      urgency_level: event.urgency_level || "",
      start_datetime: event.start_datetime ? event.start_datetime.slice(0, 16) : "",
      end_datetime: event.end_datetime ? event.end_datetime.slice(0, 16) : "",
    })
    setEditingEvent(event)
    setShowForm(true)
  }

  const handleDelete = async (eventId) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    try {
      const response = await fetch(`${SERVER_URL}/api/events/${eventId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setMessage("Event deleted successfully!")
        fetchEvents()
      } else {
        setMessage("Failed to delete event")
      }
    } catch (error) {
      console.error("Error:", error)
      setMessage("Server error")
    }
  }

  return (
    <div className="admin-container">
      {/* Admin Navigation */}
      <nav className="admin-navbar">
        <div className="admin-logo">VolunteerApp Admin</div>
        <div className="admin-nav-links">
          <button className="nav-btn active">Manage Events</button>
          <button className="nav-btn">Volunteer Matching</button>
          <button className="nav-btn" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="admin-content">
        <div className="admin-header">
          <h1>Event Management</h1>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancel" : "Create New Event"}
          </button>
        </div>

        {message && (
          <div className={`message ${message.includes("successfully") ? "success" : "error"}`}>{message}</div>
        )}

        {/* Event Form */}
        {showForm && (
          <div className="event-form-container">
            <h2>{editingEvent ? "Edit Event" : "Create New Event"}</h2>
            <form onSubmit={handleSubmit} className="event-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Event Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter event name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Event Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Describe the event..."
                  rows="4"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location Details</label>
                <textarea
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="form-textarea"
                  placeholder="Additional location details..."
                  rows="2"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="City"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">State *</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">ZIP Code *</label>
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="ZIP"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Required Skills * (Select multiple)</label>
                <div className="skills-container">
                  {availableSkills.map((skill) => (
                    <label key={skill} className="skill-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.required_skills.includes(skill)}
                        onChange={() => handleSkillsChange(skill)}
                      />
                      <span>{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Urgency Level *</label>
                  <select
                    name="urgency_level"
                    value={formData.urgency_level}
                    onChange={handleInputChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Urgency</option>
                    {urgencyLevels.map((level) => (
                      <option key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    name="start_datetime"
                    value={formData.start_datetime}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">End Date & Time</label>
                  <input
                    type="datetime-local"
                    name="end_datetime"
                    value={formData.end_datetime}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="btn-primary">
                  {isLoading ? "Saving..." : editingEvent ? "Update Event" : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Events List */}
        <div className="events-list">
          <h2>Existing Events</h2>
          {events.length === 0 ? (
            <p className="no-events">No events found. Create your first event!</p>
          ) : (
            <div className="events-grid">
              {events.map((event) => (
                <div key={event.event_id} className="event-card">
                  <div className="event-header">
                    <h3>{event.name}</h3>
                    <span className={`urgency-badge ${event.urgency_level}`}>{event.urgency_level}</span>
                  </div>
                  <p className="event-description">{event.description}</p>
                  <div className="event-details">
                    <p>
                      <strong>Location:</strong> {event.City}, {event.State} {event.zip}
                    </p>
                    <p>
                      <strong>Skills:</strong>{" "}
                      {Array.isArray(event.required_skills) ? event.required_skills.join(", ") : "None specified"}
                    </p>
                    {event.start_datetime && (
                      <p>
                        <strong>Start:</strong> {new Date(event.start_datetime).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="event-actions">
                    <button onClick={() => handleEdit(event)} className="btn-edit">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(event.event_id)} className="btn-delete">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminEventManagement
