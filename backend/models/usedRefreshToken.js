const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    token: {
        type: String,
        unique: true,
        required: true
    }
});

const UsedRefreshToken = mongoose.model('UsedRefreshToken', schema);

module.exports = UsedRefreshToken;