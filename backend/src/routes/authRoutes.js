const asyncHandler = require('express-async-handler');
const express = require('express');
const authController = require('../controllers/authController');
const { loginValidator } = require('../middleware/validators');

const router = express.Router();

router.post(
    '/register',
    asyncHandler(authController.registerUser)
);

router.post(
    '/login',
    loginValidator(),
    asyncHandler(authController.loginUser)
);

router.post(
    '/logout',
    asyncHandler(authController.logoutUser)
);

router.post(
    '/refresh-tokens',
    asyncHandler(authController.refreshTokens)
);

module.exports = router;