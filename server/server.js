const express = require("express")
const cors = require("cors")

const app = express()

const volunteerHistoryRouter = require('./routes/volunteerHistory');

// Simple CORS
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
)

app.use(express.json())
app.use('/api/volunteer-history', volunteerHistoryRouter);

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
  })
})

app.post("/api/users/register", (req, res) => {
  console.log("Register endpoint accessed:", req.body)
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ message: "Missing username or password" })
  }

  // If no database, use test mode
  if (!db) {
    console.log("⚠️  Running in test mode - no database")
    return res.status(201).json({ message: "User registered successfully (test mode)" })
  }

  // Check if user already exists
  const checkQuery = "SELECT * FROM users WHERE username = ?"
  db.query(checkQuery, [username], (err, results) => {
    if (err) {
      console.error("Database check error:", err)
      return res.status(500).json({ message: "Database error" })
    }

    if (results.length > 0) {
      return res.status(409).json({ message: "User already exists" })
    }

    // Insert new user
    const insertQuery = "INSERT INTO users (username, password_hash) VALUES (?, ?)"
    db.query(insertQuery, [username, password], (err, result) => {
      if (err) {
        console.error("Registration error:", err)
        return res.status(500).json({ message: "Registration failed" })
      }
      console.log("✅ User registered in database:", username)
      res.status(201).json({ message: "User registered successfully" })
    })
  })
})

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

  // Query database for user
  const query = "SELECT * FROM users WHERE username = ? AND password_hash = ?"
  db.query(query, [username, password], (err, results) => {
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

const PORT = 8080
app.listen(PORT, () => {
  console.log(`🚀 Server with database running on http://localhost:${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  if (db) {
    console.log(`💾 Database connected - full functionality`)
  } else {
    console.log(`⚠️  Test mode - use username: test, password: test`)
  }
})
