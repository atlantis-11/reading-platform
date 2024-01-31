const { body } = require('express-validator');

module.exports = [
    body('bookId').trim().notEmpty().withMessage('bookId is required'),
    body('status').trim().notEmpty().withMessage('status is required')
];