const db = require('../models/db');

exports.ismatched = async (req, res) => {
  const userId = req.params.userId;
  try {
      //fecth user information from the database
      const [rows] = await db.query(
          `SELECT *  FROM UserProfile, Events
           WHERE  UserProfile.City = Events.City;`
          [userId]
      );
      res.status(200).json(rows);
  } catch (error) {
        console.error("Error fetching data:", err);
        res.status(500).json({ error: "Failed to fetch data" });
  }
  //fetch the events from the databas
};

module.exports= {
  ismatched,
};