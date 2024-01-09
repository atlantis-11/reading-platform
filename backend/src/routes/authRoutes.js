const express = require('express');
const asyncHandler = require('express-async-handler');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', asyncHandler(authController.registerUser));
router.post('/login', asyncHandler(authController.loginUser));
router.post('/logout', asyncHandler(authController.logoutUser));
router.post('/refresh-tokens', asyncHandler(authController.refreshTokens));

module.exports = router;