const Joi = require('joi');

const schema = Joi.object({
    usernameOrEmail: Joi.string().required(),
    password: Joi.string().required(),
}).options({
    allowUnknown: true,
    abortEarly: false,
    errors: {
        wrap: {
            label: false
        }
    }
});

module.exports = schema;