const Joi = require('joi');

const schema = Joi.object({
    usernameOrEmail: Joi.string().required(),
    password: Joi.string().required(),
}).options({ allowUnknown: true, abortEarly: false });

module.exports = schema;