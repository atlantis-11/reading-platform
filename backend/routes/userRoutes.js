const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/refresh-tokens', authController.refreshTokens);

router.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.send(req.user);
});

module.exports = router;