const express = require('express');
const router = express.Router();
const matchingController = require('../controllers/matchingController');

// Correct dynamic route

router.get('/user/:userId/assignments', matchingController.getUserAssignments);


router.get('/admin/matches', matchingController.getAllMatches);
router.get('/match/:userId', matchingController.ismatched);
// POST accept, cancel and complete
router.post('/events/:eventId/accept', matchingController.acceptEvent);
router.post('/events/:eventId/cancel', matchingController.cancelEvent);
router.post('/events/:eventId/complete', matchingController.markCompleted);


module.exports = router;