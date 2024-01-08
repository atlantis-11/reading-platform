const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/AppError');

module.exports = (res, req) => { throw new AppError('Page not found', StatusCodes.NOT_FOUND); };