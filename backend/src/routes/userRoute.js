const asyncHandler = require('express-async-handler');
const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorizeUserEndpoint');
const runValidatorsAndHandleResult = require('../middleware/runValidatorsAndHandleResult');
const {
    addBookToTheListValidator,
    updateBookInTheListValidator,
    getReadingListValidator,
    getJournalValidator
} = require('../middleware/validators');
const {
    getAccount,
    updateAccount,
    deleteAccount,
    addBookToTheList,
    getBookFromTheList,
    updateBookInTheList,
    deleteBookFromTheList,
    getReadingList,
    getJournal
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

router.delete(
    '/:username/books/:bookId',
    authorize(),
    asyncHandler(deleteBookFromTheList)
);

router.get(
    '/:username/books',
    runValidatorsAndHandleResult(getReadingListValidator),
    authorize({ publicEndpoint: true }),
    asyncHandler(getReadingList)
);

router.get(
    '/:username/journal',
    runValidatorsAndHandleResult(getJournalValidator),
    authorize({ publicEndpoint: true }),
    asyncHandler(getJournal)
);

module.exports = router;