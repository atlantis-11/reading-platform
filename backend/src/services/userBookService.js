const Book = require('../models/bookModel');
const handleMongooseSaveErrors = require('../utils/handleMongooseSaveErrors');
const { DuplicateResourceError, ValidationError } = require('../utils/customErrors');

function isBookInTheList(user, bookId) {
    return user.books.some(b => b.bookId.toString() === bookId);
}

function verifyBookNotInTheList(user, bookId) {
    if (isBookInTheList(user, bookId)) {
        throw new DuplicateResourceError('Book is already in the list');
    }
}

function verifyBookInTheList(user, bookId) {
    if (!isBookInTheList(user, bookId)) {
        throw new ValidationError('Book is not in the list');
    }
}

async function verifyBookExists(bookId) {
    if (!await Book.exists({ _id: bookId })) {
        throw new ValidationError('Book with given id does not exist');
    }
}

async function addBookToTheList(user, bookId, status) {
    user.books.push({ bookId, status });

    try {
        await user.save();
    } catch (error) {
        handleMongooseSaveErrors(error, 'Error adding book to the list');
    }
}

async function setBookStatus(user, bookId, status) {
    const idx = user.books.findIndex(b => b.bookId.toString() === bookId);
    user.books[idx].status = status;

    try {
        await user.save();
    } catch (error) {
        handleMongooseSaveErrors(error, 'Error setting book\'s status');
    }
}

module.exports = {
    verifyBookNotInTheList,
    verifyBookInTheList,
    verifyBookExists,
    addBookToTheList,
    setBookStatus
};