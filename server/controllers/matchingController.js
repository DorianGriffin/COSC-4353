const db = require('../models/db');

exports.ismatched = async (req, res) => {
   const userId = req.params.userId;

  try {
    // Get user profile (for location)
    const [profiles] = await db.query(`
      SELECT City, State
      FROM UserProfiles
      WHERE user_id = ?
    `, [userId]);

    if (!profiles.length) return res.status(404).json({ error: 'User profile not found' });

    const { City, State } = profiles[0];

    // Get user skills
    const [userSkillsRows] = await db.query(`
      SELECT skill_id FROM UserSkills WHERE user_id = ?
    `, [userId]);
    const userSkillIds = userSkillsRows.map(row => row.skill_id);

    if (!userSkillIds.length) return res.status(404).json({ error: 'No skills found for user' });

    // Get user availability
    const [userDates] = await db.query(`
      SELECT available_date FROM UserAvailability WHERE user_id = ?
    `, [userId]);
    const availableDates = userDates.map(row =>
      new Date(row.available_date).toISOString().split('T')[0]
    );
    

    if (!availableDates.length) return res.status(404).json({ error: 'No availability found for user' });

    const [acceptedRows] = await db.query(`
      SELECT event_id FROM VolunteerHistory WHERE user_id = ?
    `, [userId]);
    const acceptedEventIds = new Set(acceptedRows.map(row => row.event_id));

    // Get all events in same location
    const [events] = await db.query(`
      SELECT * FROM Events WHERE City = ? AND State = ?
    `, [City, State]);

    // Filter events by skill and availability
    const matchedEvents = [];

    for (const event of events) {
      // Get required skills for this event
      const [eventSkillsRows] = await db.query(`
        SELECT skill_id FROM EventSkills WHERE event_id = ?
      `, [event.event_id]);
      const eventSkillIds = eventSkillsRows.map(row => row.skill_id);

      const hasAllSkills = eventSkillIds.every(skillId => userSkillIds.includes(skillId));

      // Compare dates
      if (!event.start_datetime || isNaN(new Date(event.start_datetime))) continue; 
      const eventDate = new Date(event.start_datetime).toISOString().split('T')[0]; // yyyy-mm-dd
      const isAvailable = availableDates.includes(eventDate);

      if (hasAllSkills && isAvailable) {
        matchedEvents.push({
          ...event,
          accepted: acceptedEventIds.has(event.event_id) // Add accepted status
        });
      }
    }

    if (!matchedEvents.length) {
      return res.status(404).json({ error: 'No matching events found' });
    }

    res.status(200).json({ matchedEvents });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};