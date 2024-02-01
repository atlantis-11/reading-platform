const { body } = require('express-validator');

module.exports = [
    body('bookId').trim()
        .isMongoId().withMessage('bookId is invalid')
        .notEmpty().withMessage('bookId is required'),
    body('status').trim()
        .notEmpty().withMessage('status is required')
];