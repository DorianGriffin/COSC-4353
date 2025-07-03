const express = require("express")
const cors = require("cors")

const app = express()


const notificationsRouter = require("./routes/notificationsroutes")
const volunteerHistoryRouter = require('./routes/volunteerHistory');

// Simple CORS

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
)
app.use(express.json())
app.use("/api/notifications", notificationsRouter)
app.use('/api/volunteer-history', volunteerHistoryRouter);

// connect db
let db = null
try {
  db = require("./models/db")
  console.log("✅ DB loaded")
} catch (e) {
  console.error("❌ DB error", e.message)
}

// test root
app.get("/", (req, res) => {
  res.json({ message: "Server is running" })
})

// health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    time: new Date().toISOString(),
    db: db ? "connected" : "disconnected"
  })
})

// import all user routes in one place
const userRoutes = require("./routes/userRoutes")
app.use("/api/users", userRoutes)

// (OPTIONAL) keep a debug get-users if you want:
app.get("/api/users", (req, res) => {
  if (!db) return res.status(500).json({ message: "Database not connected" })
  db.query(
    "SELECT user_id, username, email, first_name, last_name, role, created_at FROM users",
    (err, results) => {
      if (err) {
        console.error("User query failed", err)
        return res.status(500).json({ message: "Database error" })
      }
      res.json({ users: results })
    }
  )
})

const PORT = 8080
app.listen(PORT, () => {
  console.log(`🚀 Running on http://localhost:${PORT}`)
})
