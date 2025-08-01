const db = require("../models/db");

// Normalize dates to YYYY-MM-DD
const normalizeDate = (d) => new Date(d).toISOString().split("T")[0];

function validateProfile(data) {
  const {
    fullName,
    adrlineone,
    adrlinetwo,
    City,
    State,
    zipcode,
    preferences,
    skills,
    availability,
  } = data;

  if (!fullName || fullName.length > 50) return "Full name is required and must be ≤ 50 characters.";
  if (!adrlineone || adrlineone.length > 100) return "Address line 1 is required and must be ≤ 100 characters.";
  if (adrlinetwo && adrlinetwo.length > 100) return "Address line 2 must be ≤ 100 characters.";
  if (!City || City.length > 100) return "City is required and must be ≤ 100 characters.";
  if (!State || State.length !== 2) return "State code is required and must be 2 characters.";
  if (!zipcode || zipcode.length < 5 || zipcode.length > 9) return "Zipcode must be between 5 and 9 characters.";
  if (!skills || !Array.isArray(skills) || skills.length === 0) return "At least one skill is required.";
  if (!availability || !Array.isArray(availability) || availability.length === 0)
    return "Availability is required.";

  return null;
}


// POST /api/users/complete-profile
const completeProfile = async (req, res) => {
  const data = req.body;
  const username = req.session?.user?.username;

  if (!username) {
    return res.status(401).json({ success: false, message: "Not logged in. Missing session username." });
  }

  const validationError = validateProfile(data);
  if (validationError)
    return res.status(400).json({ success: false, message: validationError });

  try {
    const [userRows] = await db.query(
      "SELECT user_id FROM users WHERE username = ?",
      [username]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const user_id = userRows[0].user_id;

    await db.query(
      `INSERT INTO userprofiles (user_id, fullName, adrlineone, adrlinetwo, City, State, zipcode, preferences)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE
       fullName = VALUES(fullName), adrlineone=VALUES(adrlineone), adrlinetwo=VALUES(adrlinetwo),
       City=VALUES(City), State=VALUES(State), zipcode=VALUES(zipcode), preferences=VALUES(preferences)`,
      [
        user_id,
        data.fullName,
        data.adrlineone,
        data.adrlinetwo,
        data.City,
        data.State,
        data.zipcode,
        data.preferences || null,
      ]
    );

    
        // Auto-insert skills into the skills table if missing
        const skillNames = {
          1: "Teamwork",
          2: "Communication",
          3: "Problem-solving",
          4: "Empathy",
          5: "Adaptability",
          6: "Critical thinking",
          7: "Conflict resolution",
          8: "Positive attitude"
        };
    
        for (const skillId of [...new Set(data.skills)]) {
          const skillName = skillNames[skillId] || `Skill ${skillId}`;
    
          await db.query(
            `INSERT IGNORE INTO skills (skill_id, skill_name) VALUES (?, ?)`,
            [skillId, skillName]
          );
    
          await db.query(
            `INSERT IGNORE INTO userskills (user_id, skill_id) VALUES (?, ?)`,
            [user_id, skillId]
          );
        }
    
    for (const date of [...new Set(data.availability.map(normalizeDate))]) {
      await db.query(
        `INSERT IGNORE INTO useravailability (user_id, available_date) VALUES (?, ?)`,
        [user_id, date]
      );
    }

    await db.query(`UPDATE users SET profile_completed = 1 WHERE user_id = ?`, [user_id]);

    return res.status(200).json({ success: true, message: "Profile completed." });
  } catch (err) {
    console.error("Error completing profile:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};


// GET /api/profile/:username
const getProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const [userRows] = await db.query(
      "SELECT user_id FROM users WHERE username = ?",
      [username]
    );
    if (userRows.length === 0)
      return res.status(404).json({ success: false, message: "User not found." });

    const user_id = userRows[0].user_id;

    const [profileRows] = await db.query(
      "SELECT * FROM userprofiles WHERE user_id = ?",
      [user_id]
    );

    const [skillRows] = await db.query(
      `SELECT s.skill_id, s.skill_name FROM skills s
       JOIN userskills us ON s.skill_id = us.skill_id WHERE us.user_id = ?`,
      [user_id]
    );

    const [availabilityRows] = await db.query(
      `SELECT available_date FROM useravailability WHERE user_id = ?`,
      [user_id]
    );

    return res.status(200).json({
      success: true,
      profile: profileRows[0],
      skills: skillRows,
      availability: availabilityRows.map(row => row.available_date),
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// GET /api/profile/me 
const getLoggedInProfile = async (req, res) => {
  try {
    const username = req.session?.user?.username;
    if (!username) {
      return res.status(401).json({ success: false, message: "Not logged in" });
    }

    // Reuse the same logic as getProfile by setting req.params
    req.params = { username };
    return await getProfile(req, res);
  } catch (err) {
    console.error("Error in getLoggedInProfile:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  completeProfile,
  getProfile,
  getLoggedInProfile,
};

/* const db = require("../models/db");

// Normalize dates to YYYY-MM-DD
const normalizeDate = (d) => new Date(d).toISOString().split("T")[0];

function validateProfile(data) {
  const {
    fullName,
    adrlineone,
    adrlinetwo,
    City,
    State,
    zipcode,
    preferences,
    skills,
    availability,
  } = data;

  if (!fullName || fullName.length > 50) return "Full name is required and must be ≤ 50 characters.";
  if (!adrlineone || adrlineone.length > 100) return "Address line 1 is required and must be ≤ 100 characters.";
  if (adrlinetwo && adrlinetwo.length > 100) return "Address line 2 must be ≤ 100 characters.";
  if (!City || City.length > 100) return "City is required and must be ≤ 100 characters.";
  if (!State || State.length !== 2) return "State code is required and must be 2 characters.";
  if (!zipcode || zipcode.length < 5 || zipcode.length > 9) return "Zipcode must be between 5 and 9 characters.";
  if (!skills || !Array.isArray(skills) || skills.length === 0) return "At least one skill is required.";
  if (!availability || !Array.isArray(availability) || availability.length === 0)
    return "Availability is required.";

  return null;
}


// POST /api/users/complete-profile
const completeProfile = async (req, res) => {
  const data = req.body;
  const username = req.session?.user?.username;

  if (!username) {
    return res.status(401).json({ success: false, message: "Not logged in. Missing session username." });
  }

  const validationError = validateProfile(data);
  if (validationError)
    return res.status(400).json({ success: false, message: validationError });

  try {
    const [userRows] = await db.query(
      "SELECT user_id FROM users WHERE username = ?",
      [username]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const user_id = userRows[0].user_id;

    await db.query(
      `INSERT INTO userprofiles (user_id, fullName, adrlineone, adrlinetwo, City, State, zipcode, preferences)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE
       fullName = VALUES(fullName), adrlineone=VALUES(adrlineone), adrlinetwo=VALUES(adrlinetwo),
       City=VALUES(City), State=VALUES(State), zipcode=VALUES(zipcode), preferences=VALUES(preferences)`,
      [
        user_id,
        data.fullName,
        data.adrlineone,
        data.adrlinetwo,
        data.City,
        data.State,
        data.zipcode,
        data.preferences || null,
      ]
    );

    for (const skill of [...new Set(data.skills)]) {
      await db.query(
        `INSERT IGNORE INTO userskills (user_id, skill_id) VALUES (?, ?)`,
        [user_id, skill]
      );
    }

    for (const date of [...new Set(data.availability.map(normalizeDate))]) {
      await db.query(
        `INSERT IGNORE INTO useravailability (user_id, available_date) VALUES (?, ?)`,
        [user_id, date]
      );
    }

    await db.query(`UPDATE users SET profile_completed = 1 WHERE user_id = ?`, [user_id]);

    return res.status(200).json({ success: true, message: "Profile completed." });
  } catch (err) {
    console.error("Error completing profile:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};


// GET /api/profile/:username
const getProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const [userRows] = await db.query(
      "SELECT user_id FROM users WHERE username = ?",
      [username]
    );
    if (userRows.length === 0)
      return res.status(404).json({ success: false, message: "User not found." });

    const user_id = userRows[0].user_id;

    const [profileRows] = await db.query(
      "SELECT * FROM userprofiles WHERE user_id = ?",
      [user_id]
    );

    const [skillRows] = await db.query(
      `SELECT s.skill_id, s.skill_name FROM skills s
       JOIN userskills us ON s.skill_id = us.skill_id WHERE us.user_id = ?`,
      [user_id]
    );

    const [availabilityRows] = await db.query(
      `SELECT available_date FROM useravailability WHERE user_id = ?`,
      [user_id]
    );

    return res.status(200).json({
      success: true,
      profile: profileRows[0],
      skills: skillRows,
      availability: availabilityRows.map(row => row.available_date),
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// GET /api/profile/me 
const getLoggedInProfile = async (req, res) => {
  try {
    const username = req.session?.user?.username;
    if (!username) {
      return res.status(401).json({ success: false, message: "Not logged in" });
    }

    // Reuse the same logic as getProfile by setting req.params
    req.params = { username };
    return await getProfile(req, res);
  } catch (err) {
    console.error("Error in getLoggedInProfile:", err);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  completeProfile,
  getProfile,
  getLoggedInProfile,
};



 */
