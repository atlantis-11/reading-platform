const accountService = require('../services/accountService');
const userBookService = require('../services/userBookService');
const userService = require('../services/userService');
const logger = require('../utils/logger');

async function _getUserWithAccountProps(req) {
    return await userService.getUser(req.params.username, accountService.accountProps);
}

async function getAccount(req, res) {
    const user = await _getUserWithAccountProps(req);
    const account = accountService.getAccount(user);
    res.send({ account });
}

async function updateAccount(req, res) {
    const user = await _getUserWithAccountProps(req);
    const account = await accountService.updateAccount(user, req.body);

    const message = 'Account updated successfully';
    logger.info(message, { userId: user._id });
    res.send({ message, account });
}

async function deleteAccount(req, res) {
    const user = await _getUserWithAccountProps(req);
    const account = await accountService.deleteAccount(user);

    const message = 'Account deleted successfully';
    logger.info(message, { userId: user._id });
    res.send({ message, account });
}

async function _getUserWithReadingList(req) {
    return await userService.getUser(req.params.username, ['readingList']);
}

async function addBookToTheList(req, res) {
    const user = await _getUserWithReadingList(req);
    const { bookId } = req.body;

    userBookService.verifyBookNotInTheList(user, bookId);
    await userBookService.verifyBookExists(bookId);
    await userBookService.addBookToTheList(user, bookId);
    
    const message = 'Book added to user\'s reading list successfully';
    logger.info(message, { userId: user._id, bookId });
    res.send({ message });
}

async function getBookFromTheList(req, res) {
    const user = await _getUserWithReadingList(req);
    const { bookId } = req.params;

    userBookService.verifyBookInTheList(user, bookId);
    res.send(userBookService.getBookFromTheList(user, bookId));
}

async function updateBookInTheList(req, res) {
    const user = await _getUserWithReadingList(req);
    const { bookId } = req.params;

    userBookService.verifyBookInTheList(user, bookId);
    await userBookService.updateBookInTheList(user, bookId, req.body);

    const message = 'Book in the reading list updated successfully';
    logger.info(message, { userId: user._id, bookId });
    res.send({ message, bookId });
}

async function deleteBookFromTheList(req, res) {
    const user = await _getUserWithReadingList(req);
    const { bookId } = req.params;
    
    userBookService.verifyBookInTheList(user, bookId);
    await userBookService.deleteBookFromTheList(user, bookId);

    const message = 'Book deleted from the reading list successfully';
    logger.info(message, { userId: user._id, bookId });
    res.send({ message, bookId });
}

async function getReadingList(req, res) {
    const user = await _getUserWithReadingList(req);

    user.readingList = userBookService.filterAndSortReadingList(user, req.query);
    await userBookService.populateReadingList(user);

    res.send(user.readingList);
}

async function getJournal(req, res) {
    const user = await _getUserWithReadingList(req);

    const { bookId } = req.query;
    if (bookId) {
        userBookService.verifyBookInTheList(user, bookId);
        const journal = userBookService.getBookJournal(user, bookId);
        res.send({ journal });
    } else {
        const journal = userBookService.getJournal(user);
        res.send({ journal });
    }
}

async function getJournalEntry(req, res) {
    const user = await _getUserWithReadingList(req);
    const { entryId } = req.params;

    const journalEntry = userBookService.getJournalEntry(user, entryId);
    res.send({ journalEntry });
}

async function updateJournalEntry(req, res) {
    const user = await _getUserWithReadingList(req);
    const { entryId } = req.params;

    await userBookService.updateJournalEntry(user, entryId, req.body);
    
    const message = 'Journal entry updated successfully';
    logger.info(message, { userId: user._id, entryId });
    res.send({ message, entryId });
}

async function deleteJournalEntry(req, res) {
    const user = await _getUserWithReadingList(req);
    const { entryId } = req.params;

    await userBookService.deleteJournalEntry(user, entryId);

    const message = 'Journal entry deleted successfully';
    logger.info(message, { userId: user._id, entryId });
    res.send({ message, entryId });
}

module.exports = {
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
};