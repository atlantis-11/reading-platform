const accountService = require('../services/accountService');
const logger = require('../utils/logger');

function getAccount(req, res) {
    const user = req.requestedUser;
    const account = accountService.getAccount(user);
    res.send({ account });
}

async function patchAccount(req, res) {
    const user = req.requestedUser;
    const account = await accountService.patchAccount(user, req.body);

    const message = 'Account updated successfully';
    logger.info(message, { username: user.username });
    res.send({ message, account });
}

async function deleteAccount(req, res) {
    const user = req.requestedUser;
    const account = await accountService.deleteAccount(user);

    const message = 'Account deleted successfully';
    logger.info(message, { username: user.username });
    res.send({ message, account });
}

module.exports = {
    getAccount,
    patchAccount,
    deleteAccount
};