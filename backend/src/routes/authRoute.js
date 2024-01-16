const asyncHandler = require('express-async-handler');
const express = require('express');
const { loginValidator } = require('../middleware/validators');
const runValidatorsAndHandleResult = require('../middleware/runValidatorsAndHandleResult');
const {
    registerUser,
    loginUser,
    refreshTokens,
    logoutUser
} = require('../controllers/authController');

const router = express.Router();

router.post(
    '/register',
    asyncHandler(registerUser)
);

router.post(
    '/login',
    runValidatorsAndHandleResult(loginValidator, 'Invalid login data'),
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