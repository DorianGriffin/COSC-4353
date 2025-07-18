const express = require('express')
const router = express.Router
const { ismatched } = require('../controllers/matchingController');

router.get('/match/volunteerID', ismatched);

module.exports = router;