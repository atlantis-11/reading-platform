const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const usersController = require('../controllers/usersController');
const { ROLES } = require('../config/constants');
const checkRole = require('../middleware/checkRole');

const router = express.Router();

router.get(
    '/',
    passport.authenticate('jwt', { session: false }),
    checkRole([ROLES.ADMIN]),
    asyncHandler(usersController.getUsers)
);

router.get(
    '/:username',
    passport.authenticate('jwt', { session: false }),
    asyncHandler(usersController.getUser)
);

router.get(
    '/me',
    passport.authenticate('jwt', { session: false }),
    usersController.getCurrentUser
);

module.exports = router;