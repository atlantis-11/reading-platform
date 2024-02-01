const mongoose = require('mongoose');
const readingJournalEntrySchema = require('./readingJournalEntrySchema');
const { BOOK_STATUSES, JOURNAL_ENTRY_TYPES } = require('../../config/constants');
const { ValidationError } = require('../../utils/customErrors');

const schema = new mongoose.Schema({
    _id: false,
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: [true, 'Book is required']
    },
    journal: [readingJournalEntrySchema]
}, { toJSON: { virtuals: true } });

function canChangeStatus(currentStatus, newStatus) {
    if (!currentStatus) {
        return true;
    }

    const { TO_READ, READING, READ, DNF } = BOOK_STATUSES;
    let allowedStatuses;

    if (currentStatus === TO_READ) {
        allowedStatuses = [READING, READ, DNF];
    } else if (currentStatus === READING) {
        allowedStatuses = [READ, DNF];
    } else if (currentStatus === READ || currentStatus === DNF) {
        allowedStatuses = [TO_READ, READING, READ, DNF];
    }

    return allowedStatuses.includes(newStatus);
}

schema.virtual('status')
    .get(function () {
        const journal = this.journal;
        if (journal.length > 0) {
            const lastEntry = journal[journal.length - 1];

            if (lastEntry.entryType === JOURNAL_ENTRY_TYPES.STARTED ||
                lastEntry.entryType === JOURNAL_ENTRY_TYPES.PROGRESS) {
                return BOOK_STATUSES.READING;
            } else if (lastEntry.entryType === JOURNAL_ENTRY_TYPES.FINISHED) {
                return BOOK_STATUSES.READ;
            } else if (lastEntry.entryType === JOURNAL_ENTRY_TYPES.DNF) {
                return BOOK_STATUSES.DNF;
            } else if (lastEntry.entryType === JOURNAL_ENTRY_TYPES.TO_READ) {
                return BOOK_STATUSES.TO_READ;
            }
        }
        
        return null;
    })
    .set(function (newStatus) {
        const currentStatus = this.status;

        if (!canChangeStatus(currentStatus, newStatus)) {
            throw new ValidationError('Cannot set this status');
        }

        const BS = BOOK_STATUSES;
        const ET = JOURNAL_ENTRY_TYPES;

        const addEntry = (entryType) => {
            this.journal.push({ entryType });
        };

        if (newStatus === BS.READING) {
            addEntry(ET.STARTED);
        } else if (newStatus === BS.READ) {
            if (currentStatus !== BS.READING) {
                addEntry(ET.STARTED);
            }
            addEntry(ET.FINISHED);
        } else if (newStatus === BS.DNF) {
            if (currentStatus !== BS.READING) {
                addEntry(ET.STARTED);
            }
            addEntry(ET.DNF);
        } else if (newStatus === BS.TO_READ) {
            addEntry(ET.TO_READ);
        }
    });

module.exports = schema;