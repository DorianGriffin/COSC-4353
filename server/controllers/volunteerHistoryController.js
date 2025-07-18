exports.getVolunteerHistory = (req, res) => {
    const userId = parseInt(req.params.userId, 10);

    // validation
    if (isNaN(userId) || userId <= 0) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    // hardcoded volunteer data
    const hardcodedData = [
        {
            event_name: 'Community Clean-Up',
            description: 'Picking up trash in the park',
            location: 'Springfield, IL',
            required_skills: 'Teamwork, Time Management',
            urgency: 'Medium',
            event_date: new Date().toISOString(),
            status: 'completed'
        },
        {
            event_name: 'Food Drive',
            description: 'Distributing food to those in need',
            location: 'Chicago, IL',
            required_skills: 'Organization',
            urgency: 'High',
            event_date: new Date().toISOString(),
            status: 'assigned'
        }
    ];

    res.json(hardcodedData);
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