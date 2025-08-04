const db = require('../models/db');
const STATUS_ENUM = ['assigned', 'cancelled', 'completed'];

//  Get all assignments for a user with event details and status
exports.getUserAssignments = async (req, res) => {
    const userId = req.params.userId;

    try {
        const [assignments] = await db.query(
            `SELECT e.event_id, e.name, e.description, e.City, e.State, e.start_datetime, e.end_datetime, ea.status
       FROM EventAssignments ea
       JOIN Events e ON ea.event_id = e.event_id
       WHERE ea.user_id = ?`,
            [userId]
        );

        if (!assignments.length) {
            return res.status(404).json({ error: 'No assigned events found for user' });
        }

        res.status(200).json({ assignments });
    } catch (error) {
        console.error('Error fetching user assignments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


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
        const matchedAssignments = []; // To hold assignments for bulk insert

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

                matchedAssignments.push({
                    event_id: event.event_id,
                    user_id: userId,
                    assigned_at: new Date(),
                    status: 'assigned'
                });
            }
        }

        // Filter out already assigned events to avoid duplicates
        const newMatchedAssignments = matchedAssignments.filter(a => !eventStatusMap[a.event_id]);

        if (newMatchedAssignments.length > 0) {
            // Use a transaction to insert assignments in bulk
            const connection = await db.getConnection();
            try {
                await connection.beginTransaction();

                const insertAssignmentsQuery = `
            INSERT INTO eventassignments (event_id, user_id, assigned_at, status)
            VALUES ?
        `;
                const assignmentsValues = newMatchedAssignments.map(assignment => [
                    assignment.event_id,
                    assignment.user_id,
                    assignment.assigned_at,
                    assignment.status
                ]);

                await connection.query(insertAssignmentsQuery, [assignmentsValues]);

                await connection.commit();
                console.log('Successfully saved new matched assignments to the database.');
                res.status(200).json({ matchedEvents });
            } catch (error) {
                await connection.rollback();
                console.error('Error inserting assignments:', error);
                res.status(500).json({ error: 'Error saving assignments to database' });
            } finally {
                connection.release();
            }
        } else {
            console.log('No new assignments to insert (all already exist).');
            res.status(200).json({ matchedEvents });
        }

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
        console.log('acceptEvent called with:', { eventId, userId });

        const [existing] = await db.query(
            `SELECT assignment_id FROM eventassignments WHERE event_id = ? AND user_id = ?`,
            [eventId, userId]
        );
        console.log('Existing assignment:', existing);

        if (existing.length) {
            console.log('Updating existing assignment to assigned...');
            await db.query(
                "UPDATE eventassignments SET status = 'assigned' WHERE event_id = ? AND user_id = ?",
                [eventId, userId]
            );
        } else {
            console.log('Inserting new assignment...');
            await db.query(
                "INSERT INTO eventassignments (event_id, user_id, assigned_at, status) VALUES (?, ?, NOW(), 'assigned')",
                [eventId, userId]
            );
        }
        console.log('Assignment accepted');

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
                userId: user_id,              
                eventId: event.event_id,     
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