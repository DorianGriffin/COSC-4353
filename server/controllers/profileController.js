const db = require("../models/db");

// Normalize dates to YYYY-MM-DD
const normalizeDate = (d) => new Date(d).toISOString().split("T")[0];

function validateProfile(data, isNewProfile = true) {
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
  if (!zipcode || zipcode.length < 5 || zipcode.length > 9) return "Zipcode must be between 5 and 9 characters.";
  if (!skills || !Array.isArray(skills) || skills.length === 0) return "At least one skill is required.";

  if (isNewProfile) {
    if (!City || City.length > 100) return "City is required and must be ≤ 100 characters.";
    if (!State || State.length !== 2) return "State code is required and must be 2 characters.";
    if (!availability || !Array.isArray(availability) || availability.length === 0)
      return "Availability is required.";
    const today = new Date().toISOString().split("T")[0];
    const hasPastDate = availability.some(d => normalizeDate(d) < today);
    if (hasPastDate)
      return "Availability cannot include past dates.";
  } else {
    if (City && City.length > 100) return "City must be ≤ 100 characters.";
    if (State && State.length !== 2) return "State code must be 2 characters.";
    if (availability !== undefined && availability.length > 0) {
      if (!Array.isArray(availability) || availability.some(d => !d)) 
        return "Invalid availability format.";
    }
  }

  return null;
}



// POST /api/users/complete-profile
const completeProfile = async (req, res) => {
  const data = req.body;
  const username = req.session?.user?.username;

  if (!username) {
    return res.status(401).json({ success: false, message: "Not logged in. Missing session username." });
  }
  
  const [userRows] = await db.query(
    "SELECT user_id, profile_completed FROM users WHERE username = ?",
    [username]
  );
  
  if (userRows.length === 0) {
    return res.status(404).json({ success: false, message: "User not found." });
  }
  
  const user_id = userRows[0].user_id;
  const isNewProfile = userRows[0].profile_completed === 0;
  
  const validationError = validateProfile(data, isNewProfile);
  if (validationError) {
    return res.status(400).json({ success: false, message: validationError });
  }
  

   try {
 
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

    
        // new Auto-insert skills into the skills table if missing
        const skillNames = {
          1: "First Aid",
          2: "Communication",
          3: "CPR",
          4: "Leadership",
          5: "Organization",
          6: "Physical Labor",
          7: "Teaching",
          8: "Cooking",
          9: "Driving",
          10: "Technology",
          11: "Translation",
          12: "Medical",
          13: "Construction",
          14: "Event Planning",
          15: "Fundraising"
        };
        // new Delete old skills and availability first
        await db.query(`DELETE FROM userskills WHERE user_id = ?`, [user_id]);
       

        for (const skillId of [...new Set(data.skills)]) {
          const skillName = skillNames[skillId] || `Skill ${skillId}`;
    
          await db.query(
            `INSERT IGNORE INTO skills (skill_id, skill_name) VALUES (?, ?)`,
            [skillId, skillName]
          );
    
          await db.query(
            `INSERT INTO userskills (user_id, skill_id) VALUES (?, ?)`,
            [user_id, skillId]
          );
        }
        
        if (Array.isArray(data.availability)) {
          // Normalize submitted dates
          const newDates = [...new Set(data.availability.map(normalizeDate))];
        
          // Get current dates in DB
          const [existingAvailabilityRows] = await db.query(
            `SELECT available_date FROM useravailability WHERE user_id = ?`,
            [user_id]
          );
          const existingDates = existingAvailabilityRows.map(row => normalizeDate(row.available_date));
          
        
          
          for (const date of newDates) {
            if (!existingDates.includes(date)) {
              await db.query(
                `INSERT IGNORE INTO useravailability (user_id, available_date) VALUES (?, ?)`,
                [user_id, date]
              );
            }
          }
        
          
          for (const date of existingDates) {
            if (!newDates.includes(date)) {
              await db.query(
                `DELETE FROM useravailability WHERE user_id = ? AND available_date = ?`,
                [user_id, date]
              );
            }
          }
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



