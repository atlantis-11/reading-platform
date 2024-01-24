const _ = require('lodash');
const handleMongooseSaveErrors = require('../utils/handleMongooseSaveErrors');
const { ValidationError } = require('../utils/customErrors');

function getAccount(user) {
    return _.pick(user, ['username', 'email']);
}

async function patchAccount(user, data) {
    const allowedUpdates = ['username', 'email', 'password'];
    const notAllowedUpdates = Object.keys(data).filter((prop) => !allowedUpdates.includes(prop));
    if (notAllowedUpdates.length !== 0) {
        throw new ValidationError('Not all of the fields are allowed to be updated', { details: { fields: notAllowedUpdates } });
    }

    Object.entries(data).forEach(([key, value]) => user[key] = value);
    try {
        await user.save();
    } catch (error) {
        handleMongooseSaveErrors(error, 'Failed to update account');
    }

    return getAccount(user);
}

async function deleteAccount(user) {
    await user.deleteOne();
    return getAccount(user);
}

module.exports = {
    getAccount,
    patchAccount,
    deleteAccount
};