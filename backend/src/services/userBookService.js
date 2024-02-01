const _ = require('lodash');
const Book = require('../models/bookModel');
const handleMongooseSaveErrors = require('../utils/handleMongooseSaveErrors');
const { DuplicateResourceError, ValidationError } = require('../utils/customErrors');

function isBookInTheList(user, bookId) {
    return user.books.some(b => b.book.toString() === bookId);
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
    user.books.push({ book: bookId, status });

    try {
        await user.save();
    } catch (error) {
        handleMongooseSaveErrors(error, 'Error adding book to the list');
    }
}

async function setBookStatus(user, bookId, status) {
    const idx = user.books.findIndex(b => b.book.toString() === bookId);
    user.books[idx].status = status;

    try {
        await user.save();
    } catch (error) {
        handleMongooseSaveErrors(error, 'Error setting book\'s status');
    }
}

function filterAndSortBookList(user, { status, order, limit, skip, before, after } = {}) {
    const start = skip ? +skip : 0;
    const end = limit ? start + (+limit) : undefined;

    return _.chain(user.books)
        .filter(b => {
            return (!status || b.status === status)
                && (!before || b.updatedAt < new Date(before))
                && (!after || b.updatedAt > new Date(after));
        })
        .orderBy('updatedAt', order || 'desc')
        .slice(start, end)
        .value();
}

async function populateBookList(user) {
    await user.populate('books.book', '-__v');
}

module.exports = {
    verifyBookNotInTheList,
    verifyBookInTheList,
    verifyBookExists,
    addBookToTheList,
    setBookStatus,
    filterAndSortBookList,
    populateBookList
};