const express = require('express')
const router = express.Router()
const { registerUser, loginUser, completeProfile } = require('../controllers/userController')

router.post('/register', registerUser)
router.post('/login', loginUser)
router.post('/complete-profile', completeProfile)

module.exports = router
