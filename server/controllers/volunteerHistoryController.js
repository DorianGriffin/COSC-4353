// server/controllers/volunteerHistoryController.js
const db = require("../models/db");

const getVolunteerHistory = async (req, res) => {
    const userId = req.params.userId;

    try {
        // Upcoming assignments
        const [upcomingRows] = await db.query(
            `SELECT 
                e.name AS event_name,
                e.description,
                CONCAT(e.City, ', ', e.State) AS location,
                e.required_skills,
                e.urgency_level AS urgency,
                e.start_datetime,
                e.end_datetime,
                ea.status
            FROM EventAssignments ea
            JOIN Events e ON ea.event_id = e.event_id
            WHERE ea.user_id = ? AND e.end_datetime >= NOW()
            ORDER BY e.start_datetime ASC`,
            [userId]
        );

        // Past assignments + all marked completed
        const [pastRows] = await db.query(
                    `SELECT
                e.name AS event_name,
                e.description,
                CONCAT(e.City, ', ', e.State) AS location,
                e.required_skills,
                e.urgency_level AS urgency,
                e.start_datetime,
                e.end_datetime,
                ea.status
            FROM EventAssignments ea
            JOIN Events e ON ea.event_id = e.event_id
            WHERE ea.user_id = ?
                AND (
                    ea.status = 'completed'
                    OR (ea.status = 'cancelled' AND DATE(e.end_datetime) <= CURDATE())
                )
            ORDER BY e.start_datetime DESC`,
                    [userId]
        );


        // calc total hours and days
        let totalHours = 0;
        let totalEvents = 0;
        const uniqueDates = new Set();

        pastRows.forEach(row => {
            if (row.status === 'cancelled') return;

            const start = new Date(row.start_datetime);
            const end = new Date(row.end_datetime);

            const durationHours = (end - start) / (1000 * 60 * 60);
            totalHours += durationHours;

            uniqueDates.add(start.toDateString());
            totalEvents += 1;
        });

        const totalDays = uniqueDates.size;

        const cancelledCount = pastRows.filter(row => row.status === 'cancelled').length;

        res.status(200).json({
            upcoming: upcomingRows,
            past: pastRows,
            summary: {
                totalHours: Number(totalHours.toFixed(2)),
                totalDays,
                totalEvents,
                cancelledCount
            }
        });


    } catch (err) {
        console.error("Error fetching volunteer history:", err);
        res.status(500).json({ error: "Failed to fetch volunteer history" });
    }
};

module.exports = {
    getVolunteerHistory,
};






/*

DATABASE CONNECTED


const db = require('../models/db');

exports.getVolunteerHistory = (req, res) => {
    const userId = parseInt(req.params.userId, 10);
    console.log("Volunteer history request for user:", userId);

    const query = `
   SELECT
    e.name AS event_name,
    e.description,
    CONCAT(e.City, ', ', e.State) AS location,
    GROUP_CONCAT(DISTINCT s.skill_name SEPARATOR ', ') AS required_skills,
    e.urgency_level AS urgency,
    e.start_datetime AS event_date,
    ea.status
  FROM EventAssignments ea
  JOIN Events e ON ea.event_id = e.event_id
  LEFT JOIN EventSkills es ON e.event_id = es.event_id
  LEFT JOIN Skills s ON es.skill_id = s.skill_id
  WHERE ea.user_id = ?
  GROUP BY
    e.event_id, ea.status, e.name, e.description, e.City, e.State, e.urgency_level, e.start_datetime
  ORDER BY e.start_datetime DESC;
`;
 

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("DB error fetching volunteer history:", err);
            return res.status(500).json({ error: 'Database error' });
        }

        console.log("Query results:", results);
        res.json(results);
    });
};
*/