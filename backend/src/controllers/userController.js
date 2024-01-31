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

async function addBook(req, res) {
    const user = req.requestedUser;
    const { bookId, status } = req.body;

    userBookService.checkIfBookAlreadyInTheList(user, bookId);
    await userBookService.checkIfBookExists(bookId);
    await userBookService.addBookToTheList(user, bookId, status);
    
    const message = 'Book added to user\'s list successfully';
    logger.info(message, { userId: user._id, bookId, status });
    res.send({ message });
}

module.exports = {
    getAccount,
    updateAccount,
    deleteAccount,
    addBook
};