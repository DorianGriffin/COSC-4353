const express = require("express")
const cors = require("cors")

const app = express()

// Simple CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
)

app.use(express.json())

// Database connection with error handling
let db = null
try {
  db = require("./models/db")
  console.log("✅ Database module loaded")
} catch (error) {
  console.error("❌ Database module failed to load:", error.message)
  console.log("Server will run in test mode without database")
}

app.get("/", (req, res) => {
  console.log("Root endpoint accessed")
  res.json({ message: "Server with database running!" })
})

app.get("/health", (req, res) => {
  console.log("Health endpoint accessed")
  res.json({
    status: "OK",
    port: 8080,
    database: db ? "connected" : "test mode",
    timestamp: new Date().toISOString(),
  })
})

// UPDATED REGISTRATION ENDPOINT - Now handles all fields
app.post("/api/users/register", (req, res) => {
  console.log("Register endpoint accessed:", req.body)

  // Extract ALL fields from the request
  const { username, email, password, firstName, lastName } = req.body

  // Validate all required fields
  if (!username || !email || !password || !firstName || !lastName) {
    return res.status(400).json({ message: "All fields are required" })
  }

  // Additional validation
  if (username.length < 3) {
    return res.status(400).json({ message: "Username must be at least 3 characters" })
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" })
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email address" })
  }

  // If no database, use test mode
  if (!db) {
    console.log("⚠️  Running in test mode - no database")
    return res.status(201).json({ message: "User registered successfully (test mode)" })
  }

  // Check if username OR email already exists
  const checkQuery = "SELECT * FROM users WHERE username = ? OR email = ?"
  db.query(checkQuery, [username, email], (err, results) => {
    if (err) {
      console.error("Database check error:", err)
      return res.status(500).json({ message: "Database error" })
    }

    if (results.length > 0) {
      const existingUser = results[0]
      if (existingUser.username === username) {
        return res.status(409).json({ message: "Username already exists" })
      }
      if (existingUser.email === email) {
        return res.status(409).json({ message: "Email already exists" })
      }
    }

    // Insert new user with ALL fields
    // Note: Make sure you've added first_name and last_name columns to your database first!
    const insertQuery = `
      INSERT INTO users (username, email, password_hash, first_name, last_name, role, email_verified) 
      VALUES (?, ?, ?, ?, ?, 'volunteer', 0)
    `

    db.query(insertQuery, [username, email, password, firstName, lastName], (err, result) => {
      if (err) {
        console.error("Registration error:", err)

        // Check if the error is due to missing columns
        if (err.code === "ER_BAD_FIELD_ERROR") {
          return res.status(500).json({
            message: "Database schema error. Please add first_name and last_name columns to the users table.",
          })
        }

        return res.status(500).json({ message: "Registration failed: " + err.message })
      }

      console.log("✅ User registered in database:", {
        username,
        email,
        firstName,
        lastName,
        id: result.insertId,
      })

      res.status(201).json({
        message: "User registered successfully",
        userId: result.insertId,
      })
    })
  })
})

// Login endpoint (updated to work with email or username)
app.post("/api/users/login", (req, res) => {
  console.log("Login endpoint accessed:", req.body)
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: "Missing username or password" })
  }

  // If no database, use test credentials
  if (!db) {
    console.log("⚠️  Running in test mode - no database")
    if (username === "test" && password === "test") {
      return res.json({ message: "Login successful (test mode)", user: { id: 1, username: "test" } })
    } else {
      return res.status(401).json({ message: "Invalid credentials (use test/test)" })
    }
  }

  // Query database for user (allow login with username OR email)
  const query = "SELECT * FROM users WHERE (username = ? OR email = ?) AND password_hash = ?"
  db.query(query, [username, username, password], (err, results) => {
    if (err) {
      console.error("Login error:", err)
      return res.status(500).json({ message: "Server error" })
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const { password_hash, ...userWithoutPassword } = results[0]
    console.log("✅ Login successful from database:", username)
    res.status(200).json({
      message: "Login successful",
      user: userWithoutPassword,
    })
  })
})

// Debug endpoint to see all users
app.get("/api/users", (req, res) => {
  if (!db) {
    return res.status(500).json({ message: "Database not available" })
  }

  const query = "SELECT user_id, username, email, first_name, last_name, role, created_at FROM users"
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err)
      return res.status(500).json({ message: "Database error" })
    }
    res.json({ users: results })
  })
})

const PORT = 8080
app.listen(PORT, () => {
  console.log(`🚀 Server with database running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`👥 Users API: http://localhost:${PORT}/api/users`)
  if (db) {
    console.log(`💾 Database connected - full functionality`)
  } else {
    console.log(`⚠️  Test mode - use username: test, password: test`)
  }
})
