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
        matchedEvents.push({
          ...event,
          status: eventStatusMap[event.event_id] || null
        });
      }
    }

    if (!matchedEvents.length) return res.status(404).json({ error: 'No matching events found' });

    res.status(200).json({ matchedEvents });
  } catch (error) {
    console.error('Error matching volunteer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//  Accept event (Manual UPSERT)
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

//  Cancel event (Manual UPSERT)
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

//  Get all matched events for all users (admin view)
exports.getAllMatches = async (req, res) => {
  try {
    const [users] = await db.query(`SELECT user_id FROM users`);
    const allMatches = [];

    for (const { user_id } of users) {
      const [profiles] = await db.query(`SELECT fullName, City, State FROM UserProfiles WHERE user_id = ?`, [user_id]);
      if (!profiles.length) continue;

      const { fullName, City, State } = profiles[0];

      const [userSkillsRows] = await db.query(`SELECT skill_id FROM UserSkills WHERE user_id = ?`, [user_id]);
      const userSkillIds = userSkillsRows.map(row => row.skill_id);
      if (!userSkillIds.length) continue;

      const [userDates] = await db.query(`SELECT available_date FROM UserAvailability WHERE user_id = ?`, [user_id]);
      const availableDates = userDates.map(row => new Date(row.available_date).toISOString().split('T')[0]);
      if (!availableDates.length) continue;

      const [events] = await db.query(`SELECT * FROM Events WHERE City = ? AND State = ?`, [City, State]);

      for (const event of events) {
        const [eventSkillsRows] = await db.query(`SELECT skill_id FROM EventSkills WHERE event_id = ?`, [event.event_id]);
        const eventSkillIds = eventSkillsRows.map(row => row.skill_id);

        const hasAllSkills = eventSkillIds.every(skillId => userSkillIds.includes(skillId));
        const eventDate = new Date(event.start_datetime).toISOString().split('T')[0];
        const isAvailable = availableDates.includes(eventDate);

        if (hasAllSkills && isAvailable) {
          allMatches.push({
            userName: fullName,
            eventName: event.name,
            eventDate: eventDate,
            eventDescription: event.description,
            eventLocation: `${event.City}, ${event.State}`
          });
        }
      }
    }

    if (!allMatches.length) return res.status(404).json({ error: 'No matches found' });

    res.status(200).json({ matches: allMatches });
  } catch (err) {
    console.error('Error fetching all matches:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};