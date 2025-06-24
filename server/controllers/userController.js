const db = require("../models/db")

const registerUser = (req, res) => {
  const { username, password } = req.body

  // Debug logging
  console.log("Registration attempt:", { username, password: password ? "[PROVIDED]" : "[MISSING]" })

  if (!username || !password) {
    return res.status(400).json({ message: "Missing username or password" })
  }

  const checkQuery = "SELECT * FROM users WHERE username = ?"
  db.query(checkQuery, [username], (err, results) => {
    if (err) {
      console.error("Database check error:", err)
      return res.status(500).json({ message: "Database error" })
    }

    if (results.length > 0) {
      return res.status(409).json({ message: "User already exists" })
    }

    // Store plain password in password_hash column
    const insertQuery = "INSERT INTO users (username, password_hash) VALUES (?, ?)"
    db.query(insertQuery, [username, password], (err) => {
      if (err) {
        console.error("Registration error:", err)
        return res.status(500).json({ message: "Registration failed" })
      }
      res.status(201).json({ message: "User registered successfully" })
    })
  })
}

const loginUser = (req, res) => {
  const { username, password } = req.body

  // Debug logging
  console.log("Login attempt:", { username, password: password ? "[PROVIDED]" : "[MISSING]" })

  if (!username || !password) {
    return res.status(400).json({ message: "Missing username or password" })
  }

  // Compare plain password with password_hash column
  const query = "SELECT * FROM users WHERE username = ? AND password_hash = ?"
  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error("Login error:", err)
      return res.status(500).json({ message: "Server error" })
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Don't send password back to client
    const { password_hash: _, ...userWithoutPassword } = results[0]
    res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword,
    })
  })
}

module.exports = { registerUser, loginUser }
