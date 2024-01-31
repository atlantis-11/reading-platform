const { body } = require('express-validator');

module.exports = [
    body('status').trim().notEmpty().withMessage('status is required')
];