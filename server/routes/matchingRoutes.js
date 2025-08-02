const express = require('express')
const router = express.Router();
const matchingController = require('../controllers/matchingController');

router.get('/:userId', matchingController.ismatched);

module.exports = router;