const asyncHandler = require('express-async-handler');
const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorizeUserEndpoint');
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
    getBookFromTheList,
    updateBookInTheList,
    getReadingList
} = require('../controllers/userController');

const router = express.Router();

router.use(authenticate);

router.route('/:username/account')
    .all(authorize())
    .get(asyncHandler(getAccount))
    .patch(asyncHandler(updateAccount))
    .delete(asyncHandler(deleteAccount));

router.post(
    '/:username/books',
    runValidatorsAndHandleResult(addBookToTheListValidator),
    authorize(),
    asyncHandler(addBookToTheList)
);

router.get(
    '/:username/books/:bookId',
    authorize({ publicEndpoint: true }),
    asyncHandler(getBookFromTheList)
);

router.patch(
    '/:username/books/:bookId',
    runValidatorsAndHandleResult(updateBookInTheListValidator),
    authorize(),
    asyncHandler(updateBookInTheList)
);

router.get(
    '/:username/books',
    runValidatorsAndHandleResult(getReadingListValidator),
    authorize({ publicEndpoint: true }),
    asyncHandler(getReadingList)
);

module.exports = router;