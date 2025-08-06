const db = require('../models/db');
const STATUS_ENUM = ['assigned', 'cancelled', 'completed'];

//  GET matched events for one user
exports.ismatched = async (req, res) => {
  const userId = req.params.userId;

  try {
    const [profiles] = await db.query(
      `SELECT City, State FROM UserProfiles WHERE user_id = ?`,
      [userId]
    );
    if (!profiles.length) return res.status(404).json({ error: 'User profile not found' });

    const { City, State } = profiles[0];

    const [userSkillsRows] = await db.query(
      `SELECT skill_id FROM UserSkills WHERE user_id = ?`,
      [userId]
    );
    const userSkillIds = userSkillsRows.map(row => row.skill_id);
    if (!userSkillIds.length) return res.status(404).json({ error: 'No skills found for user' });

    const [userDates] = await db.query(
      `SELECT available_date FROM UserAvailability WHERE user_id = ?`,
      [userId]
    );
    const availableDates = userDates.map(row => new Date(row.available_date).toISOString().split('T')[0]);
    if (!availableDates.length) return res.status(404).json({ error: 'No availability found for user' });

    const [assignmentRows] = await db.query(
      `SELECT event_id, status FROM eventassignments WHERE user_id = ?`,
      [userId]
    );
    const eventStatusMap = {};
    assignmentRows.forEach(row => {
      eventStatusMap[row.event_id] = row.status;
    });

    const [events] = await db.query(
      `SELECT * FROM Events WHERE City = ? AND State = ?`,
      [City, State]
    );

    const matchedEvents = [];

    for (const event of events) {
      const [eventSkillsRows] = await db.query(
        `SELECT skill_id FROM EventSkills WHERE event_id = ?`,
        [event.event_id]
      );
      const eventSkillIds = eventSkillsRows.map(row => row.skill_id);

      const hasAllSkills = eventSkillIds.every(skillId => userSkillIds.includes(skillId));
      const eventDate = new Date(event.start_datetime).toISOString().split('T')[0];
      const isAvailable = availableDates.includes(eventDate);

      if (hasAllSkills && isAvailable) {
        const status = eventStatusMap[event.event_id] || null;
        if (status !== 'completed') {
          matchedEvents.push({
            ...event,
            status: status
          });
        }
      }
    }

    if (!matchedEvents.length) {
      return res.status(404).json({ error: 'No matching events found' });
    }

    res.status(200).json({ matchedEvents });

  } catch (error) {
    console.error('Error matching volunteer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//  Accept event 
exports.acceptEvent = async (req, res) => {
  const { eventId } = req.params;
  const { userId } = req.body;

  try {
    const [existing] = await db.query(
      `SELECT assignment_id FROM eventassignments WHERE event_id = ? AND user_id = ?`,
      [eventId, userId]
    );
    
    if (!STATUS_ENUM.includes('assigned')) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    if (existing.length) {
      await db.query(
        "UPDATE eventassignments SET status = 'assigned' WHERE event_id = ? AND user_id = ?",
        [eventId, userId]
      );
    } else {
      await db.query(
        "INSERT INTO eventassignments (event_id, user_id, assigned_at, status) VALUES (?, ?, NOW(), 'assigned')",
        [eventId, userId]
      );
    }

    res.status(200).json({ success: true, message: 'Event accepted.' });
  } catch (err) {
    console.error('Error accepting event:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

//  Cancel event 
exports.cancelEvent = async (req, res) => {
  const { eventId } = req.params;
  const { userId } = req.body;

  try {
    const [existing] = await db.query(
      `SELECT assignment_id FROM eventassignments WHERE event_id = ? AND user_id = ?`,
      [eventId, userId]
    );
    
    if (!STATUS_ENUM.includes('cancelled')) {
      return res.status(400).json({ error: 'Invalid status value' });
    }
    
    if (existing.length) {
      await db.query(
        `UPDATE eventassignments SET status = 'cancelled', assigned_at = NOW() WHERE event_id = ? AND user_id = ?`,
        [eventId, userId]
      );
    } else {
      await db.query(
        `INSERT INTO eventassignments (event_id, user_id, assigned_at, status) VALUES (?, ?, NOW(), 'cancelled')`,
        [eventId, userId]
      );
    }

    res.status(200).json({ success: true, message: 'Event cancelled.' });
  } catch (err) {
    console.error('Error cancelling event:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// Mark event as completed by user
exports.markCompleted = async (req, res) => {
  const { eventId } = req.params;
  const { userId } = req.body;

  try {
    const [existing] = await db.query(
      `SELECT assignment_id FROM eventassignments WHERE event_id = ? AND user_id = ?`,
      [eventId, userId]
    );

    if (existing.length) {
      await db.query(
        `UPDATE eventassignments SET status = 'completed' WHERE event_id = ? AND user_id = ?`,
        [eventId, userId]
      );
    } else {
      await db.query(
        `INSERT INTO eventassignments (event_id, user_id, assigned_at, status) VALUES (?, ?, NOW(), 'completed')`,
        [eventId, userId]
      );
    }

    res.status(200).json({ success: true, message: 'Event marked as completed.' });
  } catch (err) {
    console.error('Error marking event as completed:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

exports.getAllMatches = async (req, res) => {
  const { date, city, state, eventName, sortBy } = req.query;

  try {
    const [users] = await db.query(`SELECT user_id FROM users`);
    const allMatches = [];

    for (const { user_id } of users) {
      const [profiles] = await db.query(
        `SELECT fullName, City, State FROM UserProfiles WHERE user_id = ?`,
        [user_id]
      );
      if (!profiles.length) continue;

      const { fullName, City, State } = profiles[0];

      const [userSkillsRows] = await db.query(
        `SELECT skill_id FROM UserSkills WHERE user_id = ?`,
        [user_id]
      );
      const userSkillIds = userSkillsRows.map(row => row.skill_id);
      if (!userSkillIds.length) continue;

      const [userDates] = await db.query(
        `SELECT available_date FROM UserAvailability WHERE user_id = ?`,
        [user_id]
      );
      const availableDates = userDates.map(row =>
        new Date(row.available_date).toISOString().split('T')[0]
      );
      if (!availableDates.length) continue;

      let [events] = await db.query(
        `SELECT * FROM Events WHERE City = ? AND State = ?`,
        [City, State]
      );

      // Apply filters to events
      if (city) {
        events = events.filter(ev =>
          ev.City.toLowerCase().includes(city.toLowerCase())
        );
      }
      if (state) {
        events = events.filter(ev =>
          ev.State.toLowerCase().includes(state.toLowerCase())
        );
      }
      if (eventName) {
        events = events.filter(ev =>
          ev.name.toLowerCase().includes(eventName.toLowerCase())
        );
      }

      for (const event of events) {
        const [eventSkillsRows] = await db.query(
          `SELECT skill_id FROM EventSkills WHERE event_id = ?`,
          [event.event_id]
        );
        const eventSkillIds = eventSkillsRows.map(row => row.skill_id);

        const hasAllSkills = eventSkillIds.every(skillId =>
          userSkillIds.includes(skillId)
        );
        const eventDate = new Date(event.start_datetime).toISOString().split('T')[0];
        const isAvailable = availableDates.includes(eventDate);
        const matchDateFilter = !date || eventDate === date;

        if (hasAllSkills && isAvailable && matchDateFilter) {
          const [statusRows] = await db.query(
            `SELECT status FROM eventassignments WHERE event_id = ? AND user_id = ?`,
            [event.event_id, user_id]
          );
          const status = statusRows.length ? statusRows[0].status : 'unassigned';

          allMatches.push({
            userName: fullName,
            eventName: event.name,
            eventDate: eventDate,
            eventDescription: event.description,
            eventLocation: `${event.City}, ${event.State}`,
            status,
            urgency_level: event.urgency_level
          });
        }
      }
    }

    // Sort if requested
    if (sortBy === 'date') {
      allMatches.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
    } else if (sortBy === 'urgency') {
      const urgencyRank = { high: 3, medium: 2, low: 1 };
      allMatches.sort((a, b) =>
        (urgencyRank[b.urgency_level?.toLowerCase()] || 0) -
        (urgencyRank[a.urgency_level?.toLowerCase()] || 0)
      );
    }
    

    if (!allMatches.length) return res.status(404).json({ error: 'No matches found' });

    res.status(200).json({ matches: allMatches });
  } catch (err) {
    console.error('Error fetching all matches:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

