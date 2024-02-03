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

const calculateProgress = (readingListEntry, newTotalPercents) => {
    const percentsSinceLast = newTotalPercents - readingListEntry.progress;
    const bookPages = readingListEntry.book.numberOfPages;
    return {
        totalPercents: newTotalPercents,
        percentsSinceLast: percentsSinceLast,
        totalPages: bookPages * newTotalPercents / 100,
        pagesSinceLast: bookPages * percentsSinceLast / 100
    };
};

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

        const addStatusEntry = (entryType) => {
            this.journal.push({ entryType });
        };

        if (newStatus === BS.READING) {
            addStatusEntry(ET.STARTED);
        } else if (newStatus === BS.READ) {
            if (currentStatus !== BS.READING) {
                addStatusEntry(ET.STARTED);
            }
            this.journal.push({ entryType: ET.FINISHED, ...calculateProgress(this, 100) });
        } else if (newStatus === BS.DNF) {
            if (currentStatus !== BS.READING) {
                addStatusEntry(ET.STARTED);
            }
            addStatusEntry(ET.DNF);
        } else if (newStatus === BS.TO_READ) {
            addStatusEntry(ET.TO_READ);
        }
    });

schema.virtual('progress')
    .get(function () {
        if (this.status !== BOOK_STATUSES.READING) {
            return undefined;
        }

        const journal = this.journal;
        const lastJournalEntry = journal[journal.length - 1];

        if (lastJournalEntry.entryType === JOURNAL_ENTRY_TYPES.STARTED) {
            return 0;
        } else {
            return lastJournalEntry.totalPercents;
        }
    })
    .set(function (newTotalPercents) {
        if (this.status !== BOOK_STATUSES.READING) {
            throw new ValidationError('This book\'s status is not reading');
        }

        const journal = this.journal;

        if (newTotalPercents <= this.progress) {
            throw new ValidationError('Progress cannot be set to lower value');
        }

        if (newTotalPercents > 100) {
            newTotalPercents = 100;
        }

        if (newTotalPercents !== 100) {
            journal.push({
                entryType: JOURNAL_ENTRY_TYPES.PROGRESS,
                ...calculateProgress(this, newTotalPercents)
            });
        } else {
            this.status = BOOK_STATUSES.READ;
        }
    });

module.exports = schema;