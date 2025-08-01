const express = require('express');
const router = express.Router();

// Debug logging
console.log("Loading eventRoutes.js");

// Import controller
let eventController;
try {
  eventController = require('../controllers/eventController');
  console.log("Event controller loaded successfully");
} catch (error) {
  console.error("Error loading event controller:", error);
}

console.log("Defining event routes...");

// Event CRUD routes - make sure all route paths are properly formatted
router.post('/create', (req, res) => {
  console.log("POST /create route hit");
  if (eventController && eventController.createEvent) {
    eventController.createEvent(req, res);
  } else {
    console.error("createEvent function not found");
    res.status(500).json({ message: "Server configuration error" });
  }
});

router.get('/', (req, res) => {
  console.log("GET / route hit");
  if (eventController && eventController.getAllEvents) {
    eventController.getAllEvents(req, res);
  } else {
    console.error("getAllEvents function not found");
    res.status(500).json({ message: "Server configuration error" });
  }
});

router.put('/:id', (req, res) => {
  console.log("PUT /:id route hit with id:", req.params.id);
  if (eventController && eventController.updateEvent) {
    eventController.updateEvent(req, res);
  } else {
    console.error("updateEvent function not found");
    res.status(500).json({ message: "Server configuration error" });
  }
});

router.delete('/:id', (req, res) => {
  console.log("DELETE /:id route hit with id:", req.params.id);
  if (eventController && eventController.deleteEvent) {
    eventController.deleteEvent(req, res);
  } else {
    console.error("deleteEvent function not found");
    res.status(500).json({ message: "Server configuration error" });
  }
});

console.log("Event routes defined");

module.exports = router;