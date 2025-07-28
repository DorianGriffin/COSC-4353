// controllers/notificationsController.js
exports.getNotificationsForUser = (req, res) => {
    try {
        const userId = parseInt(req.params.userId, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        console.log("Serving mock notifications for userId:", userId);

        const mockNotifications = [
            {
                notification_id: 101,
                message: "Your event has been approved!",
                created_at: new Date("2025-01-01T10:30:00Z"),
                read_status: false,
            },
            {
                notification_id: 102,
                message: "Reminder: Upcoming volunteer shift tomorrow.",
                created_at: new Date("2025-01-02T14:45:00Z"),
                read_status: true,
            },
            {
                notification_id: 103,
                message: "New skills added to your profile.",
                created_at: new Date("2025-01-03T09:15:00Z"),
                read_status: false,
            },
        ];


        res.json(mockNotifications);

    } catch (error) {
        console.error(" ERROR in getNotificationsForUser:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};






/*

DATABASE


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
*/