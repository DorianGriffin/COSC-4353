// server/controllers/volunteerHistoryController.js
const db = require("../models/db");

const getVolunteerHistory = async (req, res) => {
    const userId = req.params.userId;

    try {
        const [rows] = await db.query(
            `SELECT
                e.name AS event_name,
                e.description,
                CONCAT(e.City, ', ', e.State) AS location,
                GROUP_CONCAT(DISTINCT s.skill_name SEPARATOR ', ') AS required_skills,
                e.urgency_level AS urgency,
                e.start_datetime AS event_date,
                'Attended' AS status,  -- fixed status since these are past participations
                vh.participation_date,
                vh.feedback,
                vh.rating
            FROM VolunteerHistory vh
            JOIN Events e ON vh.event_id = e.event_id
            LEFT JOIN EventSkills es ON e.event_id = es.event_id
            LEFT JOIN Skills s ON es.skill_id = s.skill_id
            WHERE vh.user_id = ?
            GROUP BY
                e.event_id, e.name, e.description, e.City, e.State, e.urgency_level, e.start_datetime, vh.participation_date, vh.feedback, vh.rating
            ORDER BY vh.participation_date DESC;
`,
            [userId]
        );

        res.status(200).json(rows);
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