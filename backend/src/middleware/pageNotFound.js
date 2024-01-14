const { NotFoundError } = require('../utils/customErrors');

module.exports = (res, req) => { throw new NotFoundError('Page not found'); };