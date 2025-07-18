const express = require('express')
const router = express.Router
//Controller functions
const { ismatched } = require('../controllers/matchingController');

router.get('/', matchedEvents); // is the meeting matched

module.exports = router;