const db = require('../db');

exports.getNotificationsForUser = (req, res) => {
    const userIdFromParams = parseInt(req.params.userId, 10);
    const userIdFromRequest = req.body.userId || req.query.userId; // future-safe

    if (userIdFromParams !== userIdFromRequest) {
        return res.status(403).json({ error: 'Access denied. User mismatch.' });
    }

    const query = `
    SELECT notification_id, message, created_at, read_status
    FROM Notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

    db.query(query, [userIdFromParams], (err, results) => {
        if (err) {
            console.error('DB error fetching notifications:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.json(results);
    });
};
