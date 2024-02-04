const { body } = require('express-validator');

module.exports = [
    body('date').trim()
        .isISO8601().withMessage('Date has to be in ISO 8601 format')
        .notEmpty().withMessage('Date is required')
        .toDate()
];