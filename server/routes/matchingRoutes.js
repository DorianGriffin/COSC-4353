const express = require('express')
const router = express.Router
const matchingController = require('../controllers/matchingController');

router.get('/match/volunteerID', matchingController.ismatched);

module.exports = router;