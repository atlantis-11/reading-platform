const { body } = require('express-validator');

module.exports = () => [
    body('usernameOrEmail').trim().notEmpty().withMessage('Username or email is required'),
    body('password').notEmpty().withMessage('Password is required')
];