const asyncHandler = require('express-async-handler');
const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorizeAndSetRequestedUser = require('../middleware/authorizeAndSetRequestedUser');
const runValidatorsAndHandleResult = require('../middleware/runValidatorsAndHandleResult');
const {
    addBookToTheListValidator,
    updateBookInTheListValidator,
    getReadingListValidator
} = require('../middleware/validators');
const {
    getAccount,
    updateAccount,
    deleteAccount,
    addBookToTheList,
    updateBookInTheList,
    getReadingList
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
    runValidatorsAndHandleResult(addBookToTheListValidator),
    authorizeAndSetRequestedUser(),
    asyncHandler(addBookToTheList)
);

router.patch(
    '/:username/books/:bookId',
    runValidatorsAndHandleResult(updateBookInTheListValidator),
    authorizeAndSetRequestedUser(),
    asyncHandler(updateBookInTheList)
);

router.get(
    '/:username/books',
    runValidatorsAndHandleResult(getReadingListValidator),
    authorizeAndSetRequestedUser({ publicEndpoint: true }),
    asyncHandler(getReadingList)
);

module.exports = router;