// server/routes/volunteerHistory.js
const express = require("express");
const router = express.Router();
const { getVolunteerHistory } = require("../controllers/volunteerHistoryController");

router.get("/:userId", getVolunteerHistory);

module.exports = router;
