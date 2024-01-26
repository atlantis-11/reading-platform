const User = require('../models/userModel');

module.exports = async (req, res, next) => {
    req.requestedUser = await User.findOne().byUsername(req.params.username);
    next();
};