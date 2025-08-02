const db = require('../models/db');
console.log("Loading eventController.js - using existing database connection");

exports.createEvent = async (req, res) => {
  console.log("createEvent function called");
  console.log("Request body:", req.body);
  
  try {
    const {
      name,
      description,
      state,
      city,
      zip,
      location,
      urgency_level,
      required_skills,
      start_datetime,
      end_datetime
    } = req.body;

    console.log("Extracted data:", {
      name,
      description,
      state,
      city,
      zip,
      location,
      urgency_level,
      required_skills,
      start_datetime,
      end_datetime
    });

    // Validation
    if (
      !name || !description || !state || !city || !zip ||
      !urgency_level || !start_datetime || !end_datetime || !required_skills
    ) {
      console.log("Validation failed - missing required fields");
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Validate required_skills is an array
    if (!Array.isArray(required_skills) || required_skills.length === 0) {
      console.log("Validation failed - required_skills must be a non-empty array");
      return res.status(400).json({ message: 'Required skills must be a non-empty array' });
    }

    console.log("Validation passed, attempting database insert");

    // Database insert
    const [result] = await db.query(
      `INSERT INTO events (name, description, state, city, zip, location, urgency_level, required_skills, start_datetime, end_datetime)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description,
        state,
        city,
        zip,
        location || '',
        urgency_level,
        JSON.stringify(required_skills),
        start_datetime,
        end_datetime
      ]
    );

    console.log("Database insert successful, result:", result);
    console.log("Event created with ID:", result.insertId);

    res.status(201).json({ 
      message: 'Event created successfully',
      eventId: result.insertId 
    });
  } catch (err) {
    console.error('Create event error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

exports.getAllEvents = async (req, res) => {
  console.log("getAllEvents function called");
  
  try {
    const [rows] = await db.query('SELECT * FROM events ORDER BY event_id DESC');
    
    console.log("Retrieved events from database:", rows.length);
    
    // Parse required_skills - handle both JSON arrays and comma-separated strings
    const events = rows.map(event => ({
      ...event,
      required_skills: parseSkills(event.required_skills)
    }));

    res.status(200).json({ events });
  } catch (err) {
    console.error('Get events error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

// Helper function to parse skills from different formats
const parseSkills = (skillsData) => {
  if (!skillsData) return [];
  
  // If it's already an array, return it
  if (Array.isArray(skillsData)) return skillsData;
  
  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(skillsData);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    // Not valid JSON, treat as comma-separated string
  }
  
  // Handle comma-separated string format like: "Physical Labor", "Organization"
  if (typeof skillsData === 'string') {
    // Remove quotes and split by comma
    return skillsData
      .split(',')
      .map(skill => skill.trim().replace(/^["']|["']$/g, ''))
      .filter(skill => skill.length > 0);
  }
  
  return [];
};
exports.updateEvent = async (req, res) => {
  console.log("updateEvent function called");
  
  try {
    const { id } = req.params;
    const {
      name,
      description,
      state,
      city,
      zip,
      location,
      urgency_level,
      required_skills,
      start_datetime,
      end_datetime
    } = req.body;

    console.log('Updating event:', id, req.body);

    if (
      !name || !description || !state || !city || !zip ||
      !urgency_level || !start_datetime || !end_datetime || !required_skills
    ) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [result] = await db.query(
      `UPDATE events SET 
       name = ?, description = ?, state = ?, city = ?, zip = ?, 
       location = ?, urgency_level = ?, required_skills = ?, 
       start_datetime = ?, end_datetime = ?
       WHERE event_id = ?`,
      [
        name,
        description,
        state,
        city,
        zip,
        location || '',
        urgency_level,
        JSON.stringify(required_skills),
        start_datetime,
        end_datetime,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    console.log("Event updated successfully");
    res.status(200).json({ message: 'Event updated successfully' });
  } catch (err) {
    console.error('Update event error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

exports.deleteEvent = async (req, res) => {
  console.log("deleteEvent function called");
  
  try {
    const { id } = req.params;

    console.log('Deleting event:', id);

    const [result] = await db.query('DELETE FROM events WHERE event_id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    console.log("Event deleted successfully");
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Delete event error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

console.log("Event controller functions exported");