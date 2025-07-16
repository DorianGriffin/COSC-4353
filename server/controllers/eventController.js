let events = [];

const getEvents = (req, res) => {
  res.json(events);
};

const createEvent = (req, res) => {
  const {
    name, description, location, city, state, zip,
    required_skills, urgency_level, start_datetime, end_datetime
  } = req.body;

  if (!name || !description || !city || !state || !zip || !urgency_level || !required_skills?.length) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const newEvent = {
    event_id: Date.now(),
    name,
    description,
    location,
    City: city,
    State: state,
    zip,
    required_skills,
    urgency_level,
    start_datetime,
    end_datetime
  };

  events.push(newEvent);
  res.status(201).json({ message: "Event created", event: newEvent });
};

const updateEvent = (req, res) => {
  const { id } = req.params;
  const eventIndex = events.findIndex((e) => e.event_id == id);
  if (eventIndex === -1) {
    return res.status(404).json({ message: "Event not found" });
  }

  events[eventIndex] = { ...events[eventIndex], ...req.body };
  res.json({ message: "Event updated", event: events[eventIndex] });
};

const deleteEvent = (req, res) => {
  const { id } = req.params;
  const index = events.findIndex((e) => e.event_id == id);
  if (index === -1) {
    return res.status(404).json({ message: "Event not found" });
  }

  events.splice(index, 1);
  res.json({ message: "Event deleted" });
};

module.exports = {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  events 
};