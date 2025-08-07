const db = require('../models/db');

/**
 * daily notification generator for event assignments
 *  - check all events happening in the next 3 days
 *  - find users who are assigned and not cancelled OR completed
 *  - avoid duplicate notifications
 *  - insert a message into Notifications table
 *  - checks every 3 minutes, everytime server starts, everyday at 6 AM
 */

const generateDailyEventNotifications = async () => {
    try {
        const [assignments] = await db.query(`
            SELECT 
                ea.user_id,
                ea.event_id,
                e.name AS event_name,
                e.start_datetime
            FROM EventAssignments ea
            JOIN Events e ON e.event_id = ea.event_id
            WHERE ea.status NOT IN ('cancelled', 'completed')
              AND DATE(e.start_datetime) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 3 DAY)
        `);

        const today = new Date();

        // 0 time part for accurate date diff
        today.setHours(0, 0, 0, 0);

        for (const a of assignments) {
            const eventDate = new Date(a.start_datetime);
            eventDate.setHours(0, 0, 0, 0);

            const diffTime = eventDate.getTime() - today.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            const message = `Reminder: You are assigned to "${a.event_name}" on ${eventDate.toLocaleDateString()}. That's in ${diffDays} day${diffDays !== 1 ? 's' : ''}!`;

            // check if notification already exists for today
            const [existing] = await db.query(`
                SELECT 1 FROM Notifications
                WHERE user_id = ? AND message = ? AND DATE(created_at) = CURDATE()
            `, [a.user_id, message]);

            if (existing.length === 0) {
                await db.query(`
                    INSERT INTO Notifications (user_id, message)
                    VALUES (?, ?)
                `, [a.user_id, message]);

                console.log(`Notification added for user ${a.user_id} - ${a.event_name}`);
            } else {
                console.log(`Skipping duplicate notification for user ${a.user_id} - ${a.event_name}`);
            }
        }

        console.log(`[${new Date().toISOString()}] Daily event notifications check completed.`);
    } catch (err) {
        console.error("Error generating daily event notifications:", err);
    }
};

module.exports = {
    generateDailyEventNotifications
};
