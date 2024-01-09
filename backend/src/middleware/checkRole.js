const { StatusCodes } = require('http-status-codes');

function checkRole(roles) {
    return (req, res, next) => {
        if (req.user) {
            if (roles.includes(req.user.role)) {
                next();
            } else {
                res.sendStatus(StatusCodes.FORBIDDEN);
            }
        } else {
            res.sendStatus(StatusCodes.FORBIDDEN);
        }
    };
}

module.exports = checkRole;