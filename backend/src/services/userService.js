const User = require('../models/userModel');

async function getUser(username, fields) {
    const query = User.findOne().byUsername(username);
    if (Array.isArray(fields)) {
        return await query.select(fields.join(' ') || '_id');
    } else {
        return await query;
    }
}

module.exports = {
    getUser
};