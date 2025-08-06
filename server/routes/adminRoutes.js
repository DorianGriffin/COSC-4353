const express = require('express');
const router = express.Router();
const { createAdmin } = require('../controllers/adminController');

router.post('/create-admin', createAdmin); // Only super admins allowed

module.exports = router;