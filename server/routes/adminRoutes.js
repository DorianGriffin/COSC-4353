const express = require('express');
const router = express.Router();
const { createAdmin, deleteAdmin, listAdmins, loginAdmin } = require('../controllers/adminController');

router.post('/create-admin', createAdmin);
router.post('/login', loginAdmin); 
router.delete('/delete-admin/:adminId', deleteAdmin);
router.get('/list', listAdmins);

module.exports = router;
