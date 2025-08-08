const db = require('../models/db');

// get upcoming events that have users with 'assigned' or 'accepted' 
exports.getAvailableEvents = async (req, res) => {
    try {
        const now = new Date();
        const [events] = await db.query(`
            SELECT DISTINCT e.event_id, e.name
            FROM events e
            JOIN eventassignments ea ON e.event_id = ea.event_id
            WHERE e.start_datetime >= ?
              AND ea.status IN ('assigned', 'accepted')
        `, [now]);

        res.json(events);
    } catch (error) {
        console.error('Error fetching available events:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// send message to all users for a specific event
exports.sendMessageToEventUsers = async (req, res) => {
    const eventId = req.body.eventId ?? req.body.event_id;
    let message = req.body.message;

    if (!eventId || !message || typeof message !== 'string' || message.trim().length === 0) {
        return res.status(400).json({ message: 'Event ID and non-empty message are required.' });
    }

    message = message.trim();

    try {
        const [users] = await db.query(`
            SELECT u.user_id
            FROM users u
            JOIN eventassignments ea ON u.user_id = ea.user_id
            WHERE ea.event_id = ?
              AND ea.status IN ('assigned', 'accepted')
        `, [eventId]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'No users assigned to this event.' });
        }

        const now = new Date();
        const notifications = users.map(u => [u.user_id, message, now, 0]);

        await db.query(`
            INSERT INTO notifications (user_id, message, created_at, read_status)
            VALUES ?
        `, [notifications]);

        res.json({ message: `Message sent to ${users.length} users.` });
    } catch (error) {
        console.error('Error sending message to users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
