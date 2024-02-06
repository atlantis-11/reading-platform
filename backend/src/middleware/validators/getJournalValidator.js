const { query } = require('express-validator');

module.exports = [
    query('bookId').optional().isMongoId().withMessage('bookId has to be a valid ObjectId'),
    query('after').optional().isISO8601().withMessage('Date has to be in ISO 8601 format').toDate(),
    query('before').optional().isISO8601().withMessage('Date has to be in ISO 8601 format').toDate()
];