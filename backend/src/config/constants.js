const ROLES = {
    USER: 'USER',
    ADMIN: 'ADMIN'
};

const BOOK_STATUSES = {
    TO_READ: 'to-read',
    READING: 'reading',
    READ: 'read',
    DNF: 'dnf'
};

const JOURNAL_ENTRY_TYPES = {
    TO_READ: 'to-read',
    STARTED: 'started',
    FINISHED: 'finished',
    DNF: 'dnf',
    PROGRESS: 'progress'
};

module.exports = Object.freeze({
    ROLES,
    BOOK_STATUSES,
    JOURNAL_ENTRY_TYPES
});