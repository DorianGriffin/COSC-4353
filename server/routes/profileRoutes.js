// server/routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

router.post('/complete-profile', profileController.completeProfile);

router.get('/me', profileController.getLoggedInProfile);


module.exports = router;