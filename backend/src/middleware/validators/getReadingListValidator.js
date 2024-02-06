const { query } = require('express-validator');
const { BOOK_STATUSES } = require('../../config/constants');

module.exports = [
    query('status')
        .custom((value) => {
            if (!Object.values(BOOK_STATUSES).includes(value)) {
                throw new Error('Invalid status');
            }
            return true;
        })
        .notEmpty().withMessage('Status is required'),
    query('after').optional().isISO8601().withMessage('Date has to be in ISO 8601 format').toDate(),
    query('before').optional().isISO8601().withMessage('Date has to be in ISO 8601 format').toDate()
];