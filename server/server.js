const express = require("express")
const cors = require("cors")
const session = require("express-session")
const db = require("./models/db");
const app = express()

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
)
app.use(express.json())

// Session configuration - MUST be before routes
app.use(session({
  secret: 'your-secret-key-here', // Change this to a secure secret
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log("Session exists:", !!req.session); // Debug log
  next();
});

// Route imports
console.log("Starting to register routes...");

try {
  console.log("1. Loading userRoutes...");
  const userRoutes = require("./routes/userRoutes")
  console.log("   ✓ userRoutes loaded successfully");
  
  console.log("2. Loading profileRoutes...");
  const profileRoutes = require("./routes/profileRoutes")
  console.log("   ✓ profileRoutes loaded successfully");
  
  console.log("3. Loading eventRoutes...");
  const eventRoutes = require("./routes/eventRoutes")
  console.log("   ✓ eventRoutes loaded successfully");
  
  console.log("All main route files loaded successfully");
  
  // Route registration with error handling
  console.log("4. Registering userRoutes at /api/users");
  try {
    app.use("/api/users", userRoutes);
    console.log("   ✓ userRoutes registered successfully");
  } catch (error) {
    console.error("   ✗ Error registering userRoutes:", error.message);
    throw error;
  }
  
  console.log("5. Registering profileRoutes at /api/profile");
  try {
    app.use("/api/profile", profileRoutes);
    console.log("   ✓ profileRoutes registered successfully");
  } catch (error) {
    console.error("   ✗ Error registering profileRoutes:", error.message);
    throw error;
  }
  
  console.log("6. Registering eventRoutes at /api/events");
  try {
    app.use("/api/events", eventRoutes);
    console.log("   ✓ eventRoutes registered successfully");
  } catch (error) {
    console.error("   ✗ Error registering eventRoutes:", error.message);
    throw error;
  }
  
  console.log("Main routes registered successfully");
  
} catch (error) {
  console.error("Error loading routes:", error);
  process.exit(1);
}

// Optional routes
console.log("7. About to register optional routes...");

// Only load these routes if the files exist
try {
  console.log("8. Loading optional notificationsRoutes...");
  const notificationsRouter = require("./routes/notificationsRoutes")
  console.log("   ✓ notificationsRoutes loaded successfully");
  console.log("9. Registering notificationsRoutes at /api/notifications");
  try {
    app.use("/api/notifications", notificationsRouter);
    console.log("   ✓ notificationsRoutes registered successfully");
  } catch (error) {
    console.error("   ✗ Error registering notificationsRoutes:", error.message);
    throw error;
  }
} catch (error) {
  console.log("   ⚠️  Notifications routes not found or error loading, skipping...", error.message);
}

try {
  console.log("10. Loading optional volunteerHistory...");
  const volunteerHistoryRouter = require("./routes/volunteerHistory")
  console.log("   ✓ volunteerHistory loaded successfully");
  console.log("11. Registering volunteerHistory at /api/volunteer-history");
  try {
    app.use("/api/volunteer-history", volunteerHistoryRouter);
    console.log("   ✓ volunteerHistory registered successfully");
  } catch (error) {
    console.error("   ✗ Error registering volunteerHistory:", error.message);
    throw error;
  }
} catch (error) {
  console.log("   ⚠️  Volunteer history routes not found or error loading, skipping...", error.message);
}

console.log("12. All routes loaded, starting final server setup...");

// Root route
console.log("13. Registering root route...");
try {
  app.get("/", (req, res) => {
    res.json({ message: "Server is running" })
  });
  console.log("   ✓ Root route registered successfully");
} catch (error) {
  console.error("   ✗ Error registering root route:", error.message);
  throw error;
}

// Health check
console.log("14. Registering health check route...");
try {
  app.get("/health", (req, res) => {
    res.json({
      status: "OK",
      time: new Date().toISOString(),
      db: "not implemented", 
    })
  });
  console.log("   ✓ Health check route registered successfully");
} catch (error) {
  console.error("   ✗ Error registering health check route:", error.message);
  throw error;
}

// Start server
console.log("15. Starting server listener...");
const PORT = 8080
try {
  app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`)
    console.log("✅ Server started successfully!")
  })
} catch (error) {
  console.error("❌ Error starting server:", error.message);
  process.exit(1);
}