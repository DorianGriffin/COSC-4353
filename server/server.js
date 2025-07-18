const express = require("express")
const cors = require("cors")

const app = express()

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
)
app.use(express.json())

// Route imports
const userRoutes = require("./routes/userRoutes")
const profileRoutes = require("./routes/profileRoutes")
const notificationsRouter = require("./routes/notificationsRoutes")
const volunteerHistoryRouter = require("./routes/volunteerHistory")
const eventRoutes = require("./routes/eventRoutes")

// Route usage
app.use("/api/users", userRoutes)                   
app.use("/api/profile", profileRoutes)              
app.use("/api/notifications", notificationsRouter) 
app.use("/api/volunteer-history", volunteerHistoryRouter)
app.use("/api/events", eventRoutes)

// Root route
app.get("/", (req, res) => {
  res.json({ message: "Server is running" })
})

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    time: new Date().toISOString(),
    db: "not implemented", 
  })
})

// Start server
const PORT = 8080
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`)
})