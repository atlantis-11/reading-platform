const Book = require('../models/bookModel');
const handleMongooseSaveErrors = require('../utils/handleMongooseSaveErrors');
const { DuplicateResourceError, ValidationError } = require('../utils/customErrors');

function checkIfBookAlreadyInTheList(user, bookId) {
    if (user.books.some(b => b.bookId.toString() === bookId)) {
        throw new DuplicateResourceError('Book is already in the list');
    }
}

async function checkIfBookExists(bookId) {
    if (!await Book.exists({ _id: bookId })) {
        throw new ValidationError('Book with given id does not exist');
    }
}

async function addBookToTheList(user, bookId, status) {
    user.books.push({ bookId, status });

    try {
        await user.save();
    } catch (error) {
        handleMongooseSaveErrors(error);
    }
}

module.exports = {
    checkIfBookAlreadyInTheList,
    checkIfBookExists,
    addBookToTheList
};