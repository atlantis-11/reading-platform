const asyncHandler = require('express-async-handler');
const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorizeAndSetRequestedUser = require('../middleware/authorizeAndSetRequestedUser');
const runValidatorsAndHandleResult = require('../middleware/runValidatorsAndHandleResult');
const {
    addBookValidator,
    updateBookStatusValidator,
    getBookListValidator
} = require('../middleware/validators');
const {
    getAccount,
    updateAccount,
    deleteAccount,
    addBook,
    updateBookStatus,
    getBookList
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

router.patch(
    '/:username/books/:bookId',
    runValidatorsAndHandleResult(updateBookStatusValidator),
    authorizeAndSetRequestedUser(),
    asyncHandler(updateBookStatus)
);

router.get(
    '/:username/books',
    runValidatorsAndHandleResult(getBookListValidator),
    authorizeAndSetRequestedUser({ publicEndpoint: true }),
    asyncHandler(getBookList)
);

module.exports = router;