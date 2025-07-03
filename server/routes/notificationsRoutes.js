const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Get notifications for a specific user
router.get('/:userId', (req, res) => {
    const userId = req.params.userId;

    const query = `
    SELECT notification_id, message, created_at, read_status
    FROM Notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
  `;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching notifications:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.json(results);
    });
});

module.exports = router;
