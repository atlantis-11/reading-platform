const { body } = require('express-validator');
const { ValidationError } = require('../../utils/customErrors');

module.exports = [
    body('status').optional().trim(),
    body('progress').optional().isInt({ min: 1, max: 100 }).withMessage('Value has to be integer in range [1, 100]'),
    (req, res, next) => {
        const fields = ['status', 'progress'];
        const providedCount = fields.reduce((count, field) => {
            return req.body[field] ? count + 1 : count;
        }, 0);

        if (providedCount === 0) {
            throw new ValidationError(`One of the fields has to be provided: ${fields.join(', ')}`);
        }

        if (providedCount !== 1) {
            throw new ValidationError('Only one of the fields can be provided');
        }

        next();
    }
];