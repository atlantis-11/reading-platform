const axios = require('axios');
const Book = require('../models/bookModel');
const handleMongooseSaveErrors = require('../utils/handleMongooseSaveErrors');
const { NotFoundError, InternalServerError, DuplicateResourceError } = require('../utils/customErrors');

const openLibraryUrl = 'https://openlibrary.org';

async function fetchFromOpenLibrary(key) {
    const url = `${openLibraryUrl}${key}.json`;

    let data;

    try {
        data = (await axios.get(url)).data;
    } catch (error) {
        if (error.response?.status === 404) {
            throw new NotFoundError('Resource was not found on Open Library');
        }

        throw new InternalServerError('Error fetching resource from Open Library', { context: { error } });
    }

    return data;
}

function makeKey(type, olid) {
    return `/${type}/${olid}`;
}

async function checkIfAlreadyAdded(olid) {
    const book = await Book.findOne({ olid }).select('_id');
    if (book) {
        throw new DuplicateResourceError('Book with this Open Library Id has already been added', { details: { olid, bookId: book._id } });
    }
}

async function getBookInfo(olid) {
    const bookInfo = await fetchFromOpenLibrary(makeKey('books', olid));
    bookInfo.olid = olid;
    return bookInfo;
}

async function parseBookInfo(bookInfo) {
    const parsed = {
        olid: bookInfo.olid,
        title: bookInfo.title,
        numberOfPages: bookInfo.number_of_pages,
        publishers: bookInfo.publishers,
        publishDate: bookInfo.publish_date
    };

    const workInfo = await fetchFromOpenLibrary(bookInfo.works[0].key);

    if (workInfo.authors) {
        parsed.authors = await Promise.all(workInfo.authors.map(
            async ({ author: { key } }) => {
                const author = await fetchFromOpenLibrary(key);
                return author.name;
            }
        ));
    }

    if (typeof workInfo.description === 'string') {
        parsed.description = workInfo.description;
    } else if (workInfo.description?.type === '/type/text') {
        parsed.description = workInfo.description.value;
    }

    return parsed;
}

async function addBookToDb(bookInfo) {
    const book = new Book(bookInfo);
    try {
        await book.save();
    } catch (error) {
        handleMongooseSaveErrors(error, 'Error adding book to db');
    }
    return book;
}

module.exports = {
    checkIfAlreadyAdded,
    getBookInfo,
    parseBookInfo,
    addBookToDb
};