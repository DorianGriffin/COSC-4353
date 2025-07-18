// server/routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');

router.post('/complete-profile', profileController.completeProfile);

router.get('/profile/:username', profileController.getProfile);

module.exports = router;
