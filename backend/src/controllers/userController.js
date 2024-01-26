const accountService = require('../services/accountService');

function getAccount(req, res) {
    const user = req.requestedUser;
    const account = accountService.getAccount(user);
    res.send({ account });
}

async function patchAccount(req, res) {
    const user = req.requestedUser;
    const account = await accountService.patchAccount(user, req.body);
    res.send({ account });
}

async function deleteAccount(req, res) {
    const user = req.requestedUser;
    const account = await accountService.deleteAccount(user);
    res.send({ message: 'Account deleted successfully', account });
}

module.exports = {
    getAccount,
    patchAccount,
    deleteAccount
};