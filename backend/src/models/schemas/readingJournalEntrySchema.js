const mongoose = require('mongoose');
const { JOURNAL_ENTRY_TYPES } = require('../../config/constants');

const schema = new mongoose.Schema({
    _id: false,
    entryType: {
        type: String,
        required: [true, 'Entry type is required'],
        enum: {
            values: Object.values(JOURNAL_ENTRY_TYPES),
            message: `Invalid entry type, valid types: ${Object.values(JOURNAL_ENTRY_TYPES).join(', ')}`
        }
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
        default: Date.now
    }
});

module.exports = schema;