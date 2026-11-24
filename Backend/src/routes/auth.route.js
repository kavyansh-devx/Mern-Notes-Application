const express = require('express')
const userController = require('../controllers/auth.controller')
const authMiddleware = require('../middleware/auth.middleware')

const router = express.Router();

router.post('/register' , userController.registerUser)
router.post('/login' , userController.loginUser)
router.post('/logout' , userController.logOutUser)
router.get('/me' , authMiddleware , userController.getCurrentUser)

module.exports = router