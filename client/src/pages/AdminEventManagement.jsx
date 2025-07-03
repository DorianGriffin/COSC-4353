"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminEventManagement.css";

const AdminEventManagement = () => {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
  });

  // US states
  const states = [
    "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS",
    "KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY",
    "NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"
  ];

  // skills
  const availableSkills = [
    "First Aid", "CPR", "Communication", "Leadership", "Organization", "Physical Labor",
    "Teaching", "Cooking", "Driving", "Technology", "Translation", "Medical", "Construction",
    "Event Planning", "Fundraising"
  ];

  const urgencyLevels = ["low", "medium", "high", "critical"];

  useEffect(() => {
    // mock events
    setEvents([
      {
        event_id: 1,
        name: "Park Clean Up",
        description: "Help clean the local park",
        City: "Houston",
        State: "TX",
        zip: "77004",
        urgency_level: "medium",
        required_skills: ["Physical Labor", "Organization"],
        start_datetime: "2025-08-01T09:00",
        end_datetime: "2025-08-01T12:00"
      },
      {
        event_id: 2,
        name: "Food Drive",
        description: "Assist with sorting food donations",
        City: "Dallas",
        State: "TX",
        zip: "75201",
        urgency_level: "high",
        required_skills: ["Organization", "Leadership"],
        start_datetime: "2025-08-05T10:00",
        end_datetime: "2025-08-05T14:00"
      }
    ]);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    setMessage("");
  };

  const handleSkillsChange = (skill) => {
    setFormData((prev) => ({
      ...prev,
      required_skills: prev.required_skills.includes(skill)
        ? prev.required_skills.filter((s) => s !== skill)
        : [...prev.required_skills, skill]
    }));
  };

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
    });
    setEditingEvent(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (
      !formData.name ||
      !formData.description ||
      !formData.city ||
      !formData.state ||
      !formData.zip ||
      !formData.urgency_level ||
      formData.required_skills.length === 0
    ) {
      setMessage("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    if (editingEvent) {
      // edit
      setEvents((prev) =>
        prev.map((ev) => ev.event_id === editingEvent.event_id
          ? { ...formData, event_id: editingEvent.event_id }
          : ev
        )
      );
      setMessage("Event updated successfully!");
    } else {
      // create
      setEvents((prev) => [
        ...prev,
        { ...formData, event_id: Date.now() }
      ]);
      setMessage("Event created successfully!");
    }

    resetForm();
    setIsLoading(false);
  };

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
    });
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleDelete = (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    setEvents((prev) => prev.filter((ev) => ev.event_id !== eventId));
    setMessage("Event deleted successfully!");
  };

  return (
    <div className="admin-container">
      <nav className="admin-navbar">
        <div className="admin-logo">VolunteerApp Admin</div>
        <div className="admin-nav-links">
          <button className="nav-btn active">Manage Events</button>
          <button className="nav-btn" onClick={() => navigate("/adminvolunteermatching")}>
            Volunteer Matching
          </button>
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
          <div className={`message ${message.includes("successfully") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        {showForm && (
          <div className="event-form-container">
            <h2>{editingEvent ? "Edit Event" : "Create New Event"}</h2>
            <form onSubmit={handleSubmit} className="event-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Event Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Event name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Event Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the event"
                  required
                />
              </div>

              <div className="form-group">
                <label>Location Details</label>
                <textarea
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Additional location details"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select State</option>
                    {states.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>ZIP *</label>
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Required Skills *</label>
                <div className="skills-container">
                  {availableSkills.map((skill) => (
                    <label key={skill}>
                      <input
                        type="checkbox"
                        checked={formData.required_skills.includes(skill)}
                        onChange={() => handleSkillsChange(skill)}
                      />
                      {skill}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Urgency Level *</label>
                <select
                  name="urgency_level"
                  value={formData.urgency_level}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select urgency</option>
                  {urgencyLevels.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date & Time</label>
                  <input
                    type="datetime-local"
                    name="start_datetime"
                    value={formData.start_datetime}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>End Date & Time</label>
                  <input
                    type="datetime-local"
                    name="end_datetime"
                    value={formData.end_datetime}
                    onChange={handleInputChange}
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

        <div className="events-list">
          <h2>Existing Events</h2>
          {events.length === 0 ? (
            <p>No events found. Create your first event!</p>
          ) : (
            <div className="events-grid">
              {events.map((ev) => (
                <div key={ev.event_id} className="event-card">
                  <div className="event-header">
                    <h3>{ev.name}</h3>
                    <span className={`urgency-badge ${ev.urgency_level}`}>{ev.urgency_level}</span>
                  </div>
                  <p>{ev.description}</p>
                  <p><strong>Location:</strong> {ev.City}, {ev.State} {ev.zip}</p>
                  <p><strong>Skills:</strong> {ev.required_skills.join(", ")}</p>
                  <div className="event-actions">
                    <button onClick={() => handleEdit(ev)} className="btn-edit">Edit</button>
                    <button onClick={() => handleDelete(ev.event_id)} className="btn-delete">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEventManagement;
