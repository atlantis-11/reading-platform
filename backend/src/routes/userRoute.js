const asyncHandler = require('express-async-handler');
const express = require('express');
const auth = require('../middleware/auth');
const usernameMatchesUser = require('../middleware/usernameMatchesUser');
const {
    getAccount,
    patchAccount,
    deleteAccount
} = require('../controllers/userController');

const router = express.Router();

const accountRoute = '/:username/account';
router.use(accountRoute, auth, usernameMatchesUser);
router.route(accountRoute)
    .get(getAccount)
    .patch(asyncHandler(patchAccount))
    .delete(asyncHandler(deleteAccount));

module.exports = router;