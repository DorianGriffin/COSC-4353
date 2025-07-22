const db = require('../models/db');

const getUserNotifications = async (req, res) => {
    const userId = req.params.userId;

    try {
        const [rows] = await db.query(
            `SELECT notification_id, message, created_at, read_status
             FROM Notifications
             WHERE user_id = ?
             ORDER BY created_at DESC`,
            [userId]
        );
        res.status(200).json(rows);
    } catch (err) {
        console.error("Error fetching notifications:", err);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
};

const markAsRead = async (req, res) => {
    const notificationId = req.params.id;

    try {
        const [result] = await db.query(
            `UPDATE Notifications SET read_status = 1 WHERE notification_id = ?`,
            [notificationId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Notification not found" });
        }

        res.status(200).json({ message: "Notification marked as read" });
    } catch (err) {
        console.error("Error marking notification as read:", err);
        res.status(500).json({ error: "Failed to update notification" });
    }
};


module.exports = {
    getUserNotifications,
    markAsRead,
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