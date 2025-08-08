const db = require('../models/db');

const generateDailyEventNotifications = async () => {
    try {
        const now = new Date();
        const twelveHoursFromNow = new Date(now.getTime() + 12 * 60 * 60 * 1000);

        const [assignments] = await db.query(`
            SELECT 
                ea.user_id,
                ea.event_id,
                e.name AS event_name,
                e.start_datetime
            FROM EventAssignments ea
            JOIN Events e ON e.event_id = ea.event_id
            WHERE ea.status NOT IN ('cancelled', 'completed')
              AND e.start_datetime BETWEEN ? AND ?
        `, [now.toISOString(), twelveHoursFromNow.toISOString()]);

        for (const a of assignments) {
            const eventDate = new Date(a.start_datetime);
            const formattedDate = eventDate.toISOString().split('T')[0]; // YYYY-MM-DD

            const message = `The ${a.event_name} event on ${formattedDate} is starting soon!`;

            // duplicate check anywhere in Notifications table
            const [existing] = await db.query(`
                SELECT 1 FROM Notifications
                WHERE user_id = ? AND message = ?
                LIMIT 1
            `, [a.user_id, message]);

            if (existing.length === 0) {
                await db.query(`
                    INSERT INTO Notifications (user_id, message)
                    VALUES (?, ?)
                `, [a.user_id, message]);

                console.log(`? Notification added for user ${a.user_id} - ${a.event_name}`);
            } else {
                console.log(`? Skipped duplicate for user ${a.user_id} - "${a.event_name}"`);
            }
        }

        console.log(`[${new Date().toISOString()}] 12-hour notification check completed.`);
    } catch (err) {
        console.error("Error generating 12-hour notifications:", err);
    }
};

module.exports = {
    generateDailyEventNotifications,
};
