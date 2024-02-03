const { query } = require('express-validator');

module.exports = [
    query('bookId').optional().isMongoId().withMessage('Value has to be a valid ObjectId')
];