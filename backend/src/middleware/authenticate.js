const passport = require('passport');
const { AuthenticationError } = require('../utils/customErrors');

module.exports = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (error, user, info) => {
        if (error) {
            return next(error);
        }
        if (info) {
            const message = 'Error decoding access token';
            const details = { reason: info.message };
            throw new AuthenticationError(message, { details });
        }
        if (!user) {
            throw new AuthenticationError('No user corresponding to the access token');
        }
        req.user = user;
        next();
    })(req, res, next);
};