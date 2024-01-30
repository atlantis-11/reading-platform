const logger = require('../utils/logger');
const newBookService = require('../services/newBookService');

async function addNewBook(req, res) {
    const olid = req.body.olid;
    await newBookService.checkIfAlreadyAdded(olid);

    const bookInfo = await newBookService.getBookInfo(olid);
    const parsedBookInfo = await newBookService.parseBookInfo(bookInfo);
    await newBookService.addBookToDb(parsedBookInfo);

    const message = 'New book added successfully';
    logger.info(message, { olid });
    res.send({ message, olid });
}

module.exports = {
    addNewBook
};