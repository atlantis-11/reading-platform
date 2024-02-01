const { query } = require('express-validator');
const { BOOK_STATUSES } = require('../../config/constants');

function isInArray(array) {
    return (value) => {
        if (!array.includes(value)) {
            throw new Error('Invalid value');
        }
        return true;
    };
}

module.exports = [
    query('status').optional().custom(isInArray(Object.values(BOOK_STATUSES))),
    query('order').optional().custom(isInArray(['desc', 'asc'])),
    query('limit').optional().isInt({ min: 1 }).withMessage('Value must be a positive integer'),
    query('skip').optional().isInt({ min: 0 }).withMessage('Value must be a non-negative integer'),
    query('before').optional().isDate({ format: 'YYYY-MM-DD' }).withMessage('Value must be in YYYY-MM-DD format'),
    query('after').optional().isDate({ format: 'YYYY-MM-DD' }).withMessage('Value must be in YYYY-MM-DD format')
];