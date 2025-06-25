// routes/volunteerHistory.js
const express = require('express');
const router = express.Router();
const { getVolunteerHistory } = require('../controllers/volunteerHistoryController');

// Define route with userId param
router.get('/:userId', getVolunteerHistory);

module.exports = router;
