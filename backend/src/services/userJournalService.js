const _ = require('lodash');
const handleMongooseSaveErrors = require('../utils/handleMongooseSaveErrors');
const { ValidationError, NotFoundError } = require('../utils/customErrors');

function getBookJournal(user, bookId) {
    const journal = user.readingList.find(e => e.book.toString() === bookId).journal.toObject();
    journal.forEach(e => e.bookId = bookId);
    return journal.reverse();
}

function getJournal(user) {
    const readingList = user.readingList.toObject();
        
    readingList.forEach(rlEntry => {
        rlEntry.journal.forEach(jEntry => {
            jEntry.bookId = rlEntry.book;
        });
    });

    return _.orderBy(_.flatMap(readingList, 'journal'), 'date', 'desc');
}

function getJournalEntry(user, entryId) {
    for (const rlEntry of user.readingList.toObject()) {
        const foundEntry = rlEntry.journal.find(jEntry => jEntry._id.toString() === entryId);
        if (foundEntry) {
            return { ...foundEntry, bookId: rlEntry.book };
        }
    }
    
    throw new NotFoundError('Journal entry not found');
}

async function performActionOnJournalEntry(user, entryId, actionType, action) {
    for (const rlEntry of user.readingList) {
        const jEntryIdx = rlEntry.journal.findIndex(jEntry => jEntry._id.toString() === entryId);

        if (jEntryIdx !== -1) {
            if (jEntryIdx !== rlEntry.journal.length - 1) {
                // update -> updated, delete -> deleted
                throw new ValidationError(`Only the last journal entry for a book can be ${actionType}d`);
            } else {
                await action(rlEntry, jEntryIdx);

                try {
                    await user.save();
                } catch (error) {
                    // update -> updating, delete -> deleting
                    handleMongooseSaveErrors(error, `Error ${actionType.slice(0, -1)}ing journal entry`);
                }

                return;
            }
        }
    }
    
    throw new NotFoundError('Journal entry not found');
}

async function updateJournalEntry(user, entryId, data) {
    const { date } = data;

    await performActionOnJournalEntry(user, entryId, 'update', async (rlEntry, jEntryIdx) => {
        const journal = rlEntry.journal;

        if (date) {
            if (Date.now() < date) {
                throw new ValidationError('Date cannot be in the future');
            }

            if (jEntryIdx === 0) {
                journal[jEntryIdx].date = date;
            } else {
                if (journal[jEntryIdx - 1].date < date) {
                    journal[jEntryIdx].date = date;
                } else {
                    throw new ValidationError('Date has to be later than the previous entry\'s');
                }
            }
        }

        // TODO: Updating other fields
    });
}

async function deleteJournalEntry(user, entryId) {
    await performActionOnJournalEntry(user, entryId, 'delete', async (rlEntry, jEntryIdx) => {
        rlEntry.journal.pull({ _id: rlEntry.journal[jEntryIdx]._id });
    });
}

module.exports = {
    getBookJournal,
    getJournal,
    getJournalEntry,
    updateJournalEntry,
    deleteJournalEntry
};