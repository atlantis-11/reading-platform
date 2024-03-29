const asyncHandler = require('express-async-handler');
const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorizeUserEndpoint');
const runValidatorsAndHandleResult = require('../middleware/runValidatorsAndHandleResult');
const {
    addBookToTheListValidator,
    updateBookInTheListValidator,
    getReadingListValidator,
    getJournalValidator,
    updateJournalEntryValidator
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
    getJournal,
    getJournalEntry,
    updateJournalEntry,
    deleteJournalEntry
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

router.get(
    '/:username/journal/:entryId',
    authorize({ publicEndpoint: true }),
    asyncHandler(getJournalEntry)
);

router.patch(
    '/:username/journal/:entryId',
    runValidatorsAndHandleResult(updateJournalEntryValidator),
    authorize(),
    asyncHandler(updateJournalEntry)
);

router.delete(
    '/:username/journal/:entryId',
    authorize(),
    asyncHandler(deleteJournalEntry)
);

module.exports = router;