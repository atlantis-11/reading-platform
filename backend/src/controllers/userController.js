const accountService = require('../services/accountService');

function getAccount(req, res) {
    const account = accountService.getAccount(req.user);
    res.send({ account });
}

async function patchAccount(req, res) {
    const account = await accountService.patchAccount(req.user, req.body);
    res.send({ account });
}

async function deleteAccount(req, res) {
    const account = await accountService.deleteAccount(req.user);
    res.send({ message: 'Account deleted successfully', account });
}

module.exports = {
    getAccount,
    patchAccount,
    deleteAccount
};