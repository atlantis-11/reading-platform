const { body } = require('express-validator');

module.exports = [
    body('olid').trim()
        .matches(/OL[1-9]\d*M/).withMessage('olid (Open Library Id) for an edition (ends with M) is invalid')
];