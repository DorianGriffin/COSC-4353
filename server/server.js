const express = require("express")
const cors = require("cors")

const app = express()

// CORS for frontend requests
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
)

// Parse JSON bodies
app.use(express.json())

// Import routes
const userRoutes = require("./routes/userRoutes")
const notificationsRouter = require("./routes/notificationsroutes")
const volunteerHistoryRouter = require("./routes/volunteerHistory")
const eventRoutes = require('./routes/eventRoutes');

// Use routes
app.use("/api/users", userRoutes)
app.use("/api/notifications", notificationsRouter)
app.use("/api/volunteer-history", volunteerHistoryRouter)
app.use('/api/events', eventRoutes);

// Test root
app.get("/", (req, res) => {
  res.json({ message: "Server is running" })
})

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    time: new Date().toISOString(),
    db: "not implemented", // Since you're using hardcoded data
  })
})

const PORT = 8080
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`)
})
