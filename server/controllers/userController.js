const db = require("../models/db")

const registerUser = (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ message: "Missing username or password" })
  }

  const checkQuery = "SELECT * FROM users WHERE username = ?"
  db.query(checkQuery, [username], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" })
    if (results.length > 0) return res.status(409).json({ message: "Username already exists" })

    const insertQuery = "INSERT INTO users (username, password_hash) VALUES (?, ?)"
    db.query(insertQuery, [username, password], (err) => {
      if (err) return res.status(500).json({ message: "Registration failed" })
      res.status(201).json({ message: "User registered successfully" })
    })
  })
}

const loginUser = (req, res) => {
  const { username, password } = req.body
  if (!username || !password) {
    return res.status(400).json({ message: "Missing username or password" })
  }

  const query = "SELECT * FROM users WHERE username = ? AND password_hash = ?"
  db.query(query, [username, password], (err, results) => {
    if (err) return res.status(500).json({ message: "Server error" })
    if (results.length === 0) return res.status(401).json({ message: "Invalid credentials" })

    const { password_hash, ...userWithoutPassword } = results[0]
    res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword,
    })
  })
}

const completeProfile = (req, res) => {
  const { username } = req.body
  if (!username) return res.status(400).json({ message: "Missing username" })

  const updateQuery = "UPDATE users SET profile_completed = true WHERE username = ?"
  db.query(updateQuery, [username], (err, result) => {
    if (err) return res.status(500).json({ message: "Database update error" })
    if (result.affectedRows === 0) return res.status(404).json({ message: "User not found" })

    res.json({ message: "Profile marked as completed", success: true })
  })
}

module.exports = { registerUser, loginUser, completeProfile }
