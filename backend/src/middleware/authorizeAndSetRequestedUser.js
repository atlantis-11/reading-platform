const asyncHandler = require('express-async-handler');
const authorize = require('./authorizeUserEndpoint');
const setRequestedUser = require('./setRequestedUser');

module.exports = ({ publicEndpoint = false } = {}) => {
    return [asyncHandler(authorize({ publicEndpoint })), asyncHandler(setRequestedUser)];
};