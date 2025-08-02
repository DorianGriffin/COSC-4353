

const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matchingController');

// Correct dynamic route


router.get('/admin/matches', matchingController.getAllMatches);
router.get('/match/:userId', matchingController.ismatched);
// POST accept or cancel
router.post('/events/:eventId/accept', matchingController.acceptEvent);
router.post('/events/:eventId/cancel', matchingController.cancelEvent);

module.exports = router;
