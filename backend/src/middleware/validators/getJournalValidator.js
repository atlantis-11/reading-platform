const { query } = require('express-validator');

module.exports = [
    query('bookId').optional().isMongoId().withMessage('bookId has to be a valid ObjectId')
];