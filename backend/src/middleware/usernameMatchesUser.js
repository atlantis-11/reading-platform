const { AuthorizationError } = require('../utils/customErrors');

module.exports = (req, res, next) => {
    const username = req.params.username;
    const user = req.user;

    if (user.username.toLowerCase() === username.toLowerCase()) {
        next();
    } else {
        throw new AuthorizationError();
    }
};