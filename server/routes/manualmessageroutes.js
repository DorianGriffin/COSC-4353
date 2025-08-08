const express = require('express');
const router = express.Router();
const eventMessageController = require('../controllers/manualmessage');

// GET list of upcoming events with assigned or accepted users
router.get('/available-events', eventMessageController.getAvailableEvents);

// POST message to users assigned to a specific event
router.post('/send', eventMessageController.sendMessageToEventUsers);

module.exports = router;
