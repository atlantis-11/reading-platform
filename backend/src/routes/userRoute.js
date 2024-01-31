const asyncHandler = require('express-async-handler');
const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorizeAndSetRequestedUser = require('../middleware/authorizeAndSetRequestedUser');
const runValidatorsAndHandleResult = require('../middleware/runValidatorsAndHandleResult');
const { addBookValidator } = require('../middleware/validators');
const {
    getAccount,
    updateAccount,
    deleteAccount,
    addBook
} = require('../controllers/userController');

const router = express.Router();

router.use(authenticate);

router.route('/:username/account')
    .all(authorizeAndSetRequestedUser())
    .get(getAccount)
    .patch(asyncHandler(updateAccount))
    .delete(asyncHandler(deleteAccount));

router.post(
    '/:username/books',
    runValidatorsAndHandleResult(addBookValidator),
    authorizeAndSetRequestedUser(),
    asyncHandler(addBook)
);

module.exports = router;