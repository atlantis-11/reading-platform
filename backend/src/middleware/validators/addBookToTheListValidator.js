const { body } = require('express-validator');

module.exports = [
    body('bookId').trim()
        .isMongoId().withMessage('bookId has to be a valid ObjectId')
        .notEmpty().withMessage('bookId is required')
];