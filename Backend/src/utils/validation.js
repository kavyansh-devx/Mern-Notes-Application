const MAX_USERNAME_LENGTH = 64;
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_BYTES = 72;
const MAX_NOTE_TITLE_LENGTH = 160;
const MAX_NOTE_DESCRIPTION_LENGTH = 10000;

function normalizeUsername(username) {
    if (typeof username !== 'string') return null;
    const normalized = username.trim();
    return normalized.length >= 1 && normalized.length <= MAX_USERNAME_LENGTH
        ? normalized
        : null;
}

function isValidPassword(password, { requireMinimum = true } = {}) {
    if (typeof password !== 'string') return false;
    if (requireMinimum && password.length < MIN_PASSWORD_LENGTH) return false;
    return Buffer.byteLength(password, 'utf8') <= MAX_PASSWORD_BYTES;
}

function validateNote(title, description) {
    if (typeof title !== 'string' || !title.trim()) {
        return 'A title is required.';
    }
    if (title.trim().length > MAX_NOTE_TITLE_LENGTH) {
        return `Title must be ${MAX_NOTE_TITLE_LENGTH} characters or fewer.`;
    }
    if (description !== undefined && typeof description !== 'string') {
        return 'Description must be a string.';
    }
    if (description && description.length > MAX_NOTE_DESCRIPTION_LENGTH) {
        return `Description must be ${MAX_NOTE_DESCRIPTION_LENGTH} characters or fewer.`;
    }
    return null;
}

module.exports = {
    MAX_NOTE_DESCRIPTION_LENGTH,
    MAX_NOTE_TITLE_LENGTH,
    MAX_PASSWORD_BYTES,
    MAX_USERNAME_LENGTH,
    isValidPassword,
    normalizeUsername,
    validateNote
};
