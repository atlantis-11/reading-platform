const accountService = require('../services/accountService');
const userBookService = require('../services/userBookService');
const logger = require('../utils/logger');

function getAccount(req, res) {
    const user = req.requestedUser;
    const account = accountService.getAccount(user);
    res.send({ account });
}

async function updateAccount(req, res) {
    const user = req.requestedUser;
    const account = await accountService.updateAccount(user, req.body);

    const message = 'Account updated successfully';
    logger.info(message, { userId: user._id });
    res.send({ message, account });
}

async function deleteAccount(req, res) {
    const user = req.requestedUser;
    const account = await accountService.deleteAccount(user);

    const message = 'Account deleted successfully';
    logger.info(message, { userId: user._id });
    res.send({ message, account });
}

async function addBookToTheList(req, res) {
    const user = req.requestedUser;
    const { bookId } = req.body;

    userBookService.verifyBookNotInTheList(user, bookId);
    await userBookService.verifyBookExists(bookId);
    await userBookService.addBookToTheList(user, bookId);
    
    const message = 'Book added to user\'s reading list successfully';
    logger.info(message, { userId: user._id, bookId });
    res.send({ message });
}

async function updateBookInTheList(req, res) {
    const user = req.requestedUser;
    const { bookId } = req.params;

    userBookService.verifyBookInTheList(user, bookId);
    await userBookService.updateBookInTheList(user, bookId, req.body);

    const message = 'Book in the reading list updated successfully';
    logger.info(message, { userId: user._id, bookId });
    res.send({ message, bookId });
}

async function getReadingList(req, res) {
    const user = req.requestedUser;

    user.readingList = userBookService.filterAndSortReadingList(user, req.query);
    await userBookService.populateReadingList(user);

    res.send(user.readingList);
}

module.exports = {
    getAccount,
    updateAccount,
    deleteAccount,
    addBookToTheList,
    updateBookInTheList,
    getReadingList
};