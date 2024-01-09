const User = require('../models/user');
const usersService = require('../services/usersService');

async function getUsers(req, res) {
    const users = await User.find();
    res.send(users);
}

async function getUser(req, res) {
    const username = req.params.username;
    const user = await usersService.findUserByUsername(username);
    res.send(user);
}

function getCurrentUser(req, res) {
    res.send(req.user);
}

module.exports = {
    getUsers,
    getUser,
    getCurrentUser
};