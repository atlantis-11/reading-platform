const _ = require('lodash');
const handleMongooseSaveErrors = require('../utils/handleMongooseSaveErrors');
const { ValidationError } = require('../utils/customErrors');

const accountProps = ['username', 'email', 'isProfilePublic'];

function getAccount(user) {
    return _.pick(user, accountProps);
}

async function updateAccount(user, data) {
    const allowedUpdates = [...accountProps, 'password'];
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
}

module.exports = {
    accountProps,
    getAccount,
    updateAccount,
    deleteAccount
};