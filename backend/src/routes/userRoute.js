const asyncHandler = require('express-async-handler');
const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorizeAndSetRequestedUser = require('../middleware/authorizeAndSetRequestedUser');
const {
    getAccount,
    patchAccount,
    deleteAccount
} = require('../controllers/userController');

const router = express.Router();

router.use(authenticate);

router.route('/:username/account')
    .all(authorizeAndSetRequestedUser())
    .get(getAccount)
    .patch(asyncHandler(patchAccount))
    .delete(asyncHandler(deleteAccount));

module.exports = router;