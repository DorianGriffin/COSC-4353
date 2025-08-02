const express = require("express");
const cors = require("cors");
const session = require("express-session");
const db = require("./models/db");

const app = express();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());

// SESSION CONFIGURATION
app.use(session({
  secret: 'your-secret-key-here', // Replace with secure secret in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,        // Use true if HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

//  Save session if modified (auto-persist login session)
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (body) {
    if (req.session?.user && !req.session._saved) {
      req.session.save((err) => {
        if (err) console.error("Session save failed:", err);
        else console.log(" Session saved for user:", req.session.user.username);
        return originalJson.call(this, body);
      });
    } else {
      return originalJson.call(this, body);
    }
  };
  next();
});

//  Debug logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log(" Session content:", req.session);
  next();
});

//  Session test route
app.get("/session-check", (req, res) => {
  res.json({ session: req.session });
});

// ROUTES REGISTRATION
console.log("Starting to register routes...");

try {
  console.log("1. Loading userRoutes...");
  const userRoutes = require("./routes/userRoutes");
  console.log("   ✓ userRoutes loaded successfully");

  console.log("2. Loading profileRoutes...");
  const profileRoutes = require("./routes/profileRoutes");
  console.log("   ✓ profileRoutes loaded successfully");

  console.log("3. Loading eventRoutes...");
  const eventRoutes = require("./routes/eventRoutes");
  console.log("   ✓ eventRoutes loaded successfully");

  console.log("4. Loading notificationsRoutes...");
  const notificationsRouter = require("./routes/notificationsRoutes");
  console.log("   ✓ notificationsRoutes loaded successfully");

  console.log("5. Loading volunteerHistoryRouter...");
  const volunteerHistoryRouter = require("./routes/volunteerHistory");
  console.log("   ✓ volunteerHistoryRouter loaded successfully");

  onsole.log("5. Loading matchingRouter...");
  const matchingRouter = require("./routes/matching");
  console.log("   ✓ matchingRouter loaded successfully");



  // Register routes
  app.use("/api/users", userRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/events", eventRoutes);
  app.use("/api/notifications", notificationsRouter);
  app.use("/api/volunteer-history", volunteerHistoryRouter);
  app.use("/api/matching", matchingRouter);

  
  console.log(" All routes registered successfully");

} catch (error) {
  console.error("Error loading or registering routes:", error);
  process.exit(1);
}

// ROOT + HEALTH CHECK
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    time: new Date().toISOString(),
    db: "not implemented",
  });
});

// DB check
db.query("SELECT 1")
  .then(() => console.log(" Database connection successful"))
  .catch((err) => console.error("Database connection failed:", err.message));

// START SERVER
const PORT = 8080;
app.listen(PORT, () => {
  console.log(` Backend running on http://localhost:${PORT}`);
});