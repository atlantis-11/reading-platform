const _ = require('lodash');
const Book = require('../models/bookModel');
const handleMongooseSaveErrors = require('../utils/handleMongooseSaveErrors');
const { DuplicateResourceError, ValidationError } = require('../utils/customErrors');

function isBookInTheList(user, bookId) {
    return user.readingList.some(e => e.book.toString() === bookId);
}

function verifyBookNotInTheList(user, bookId) {
    if (isBookInTheList(user, bookId)) {
        throw new DuplicateResourceError('Book is already in the reading list');
    }
}

function verifyBookInTheList(user, bookId) {
    if (!isBookInTheList(user, bookId)) {
        throw new ValidationError('Book is not in the reading list');
    }
}

async function verifyBookExists(bookId) {
    if (!await Book.exists({ _id: bookId })) {
        throw new ValidationError('Book with given id does not exist');
    }
}

async function addBookToTheList(user, bookId) {
    user.readingList.push({ book: bookId });

    try {
        await user.save();
    } catch (error) {
        handleMongooseSaveErrors(error, 'Error adding book to the reading list');
    }
}

async function updateBookInTheList(user, bookId, data) {
    const { status, progress } = data;

    await populateBookInTheList(user, bookId);
    
    const readingListEntry = user.readingList.find(e => e.book._id.toString() === bookId);

    if (status) {
        readingListEntry.status = status;
    } else if (progress) {
        readingListEntry.progress = +progress;
    }

    depopulateReadingList(user);

    try {
        await user.save();
    } catch (error) {
        handleMongooseSaveErrors(error, 'Error updating user\'s book');
    }
}

async function populateReadingList(user) {
    await user.populate('readingList.book');
}

async function populateBookInTheList(user, bookId) {
    const idx = user.readingList.findIndex(e => e.book.toString() === bookId);
    await user.populate(`readingList.${idx}.book`);
}

function depopulateReadingList(user) {
    user.depopulate('readingList.book');
}

function filterAndSortReadingList(user, { status, order, limit, skip, before, after } = {}) {
    const start = skip ? +skip : 0;
    const end = limit ? start + (+limit) : undefined;

    return _.chain(user.readingList)
        .filter(e => {
            return (!status || e.status === status)
                && (!before || e.updatedAt < new Date(before))
                && (!after || e.updatedAt > new Date(after));
        })
        .orderBy('updatedAt', order || 'desc')
        .slice(start, end)
        .value();
}

module.exports = {
    verifyBookNotInTheList,
    verifyBookInTheList,
    verifyBookExists,
    addBookToTheList,
    updateBookInTheList,
    filterAndSortReadingList,
    populateReadingList,
    populateBookInTheList,
    depopulateReadingList
};