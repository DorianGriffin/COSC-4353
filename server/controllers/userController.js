const db = require('../models/db');

const getUsers = (req, res) => {
  db.query('SELECT * FROM users LIMIT 10', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

module.exports = { getUsers };