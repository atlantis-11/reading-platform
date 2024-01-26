const User = require('../models/userModel');
const { AuthorizationError, NotFoundError } = require('../utils/customErrors');

module.exports = ({ publicEndpoint = false } = {}) => {
    return async (req, res, next) => {
        const curUsername = req.user.username;
        const reqUsername = req.params.username;
    
        if (curUsername.toLowerCase() === reqUsername.toLowerCase()) {
            return next();
        }
    
        if (publicEndpoint) {
            const reqUser = await User.findOne().byUsername(reqUsername).select('isProfilePublic');
            if (!reqUser) { 
                throw new NotFoundError();
            }
            if (!reqUser.isProfilePublic) {
                throw new AuthorizationError('Profile is private');
            }
            
            return next();
        }

        throw new AuthorizationError();
    };
};