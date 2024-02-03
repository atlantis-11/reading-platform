const mongoose = require('mongoose');
const { JOURNAL_ENTRY_TYPES } = require('../../config/constants');

const Integer = {
    type: Number,
    get: v => Math.trunc(v),
    set: v => Math.trunc(v)
};

const schema = new mongoose.Schema({
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
    },
    totalPages: Integer,
    pagesSinceLast: Integer,
    totalPercents: Integer,
    percentsSinceLast: Integer
});

module.exports = schema;