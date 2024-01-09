const User = require('../models/user');
const AppError = require('../utils/AppError');

async function findUserByUsername (username) {
    const user = await User.findOne({ username });
    
    if (!user) {
        throw new AppError(`User with username='${username} not found'`, 404);
    }

    return user;
}

module.exports = {
    findUserByUsername
};