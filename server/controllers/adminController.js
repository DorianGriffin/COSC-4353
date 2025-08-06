const db = require('../models/db');
const bcrypt = require('bcrypt');

const createAdmin = async (req, res) => {
  const { username, email, password } = req.body;
  const creator = req.session.user;

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [creator.username]);
    const creatorRecord = rows[0];

    if (!creatorRecord || creatorRecord.role !== 'admin' || !creatorRecord.is_super_admin) {
      return res.status(403).json({ message: "Only head admins can create other admins." });
    }

    const [existing] = await db.query("SELECT * FROM users WHERE username = ? OR email = ?", [username, email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: "Username or email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      `INSERT INTO users (username, email, password_hash, role, is_super_admin) VALUES (?, ?, ?, 'admin', false)`,
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: "New admin created successfully." });
  } catch (err) {
    console.error("Create admin error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createAdmin,
};