const asyncHandler = require('express-async-handler');
const express = require('express');
const {
    registerUser,
    loginUser,
    refreshTokens,
    logoutUser
} = require('../controllers/authController');
const { loginValidator } = require('../middleware/validators');

const router = express.Router();

router.post(
    '/register',
    asyncHandler(registerUser)
);

router.post(
    '/login',
    loginValidator(),
    asyncHandler(loginUser)
);

router.post(
    '/logout',
    asyncHandler(logoutUser)
);

router.post(
    '/refresh-tokens',
    asyncHandler(refreshTokens)
);

module.exports = router;