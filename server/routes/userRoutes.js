const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/userController');

router.get('/', getUsers);
router.post('/register', registerUser);
router.post('/login', loginUser);


module.exports = router;