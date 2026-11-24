function logError(context, error, metadata = {}) {
    const entry = {
        level: 'error',
        context,
        error: error?.name || 'Error',
        ...metadata
    };

    if (process.env.NODE_ENV !== 'production' && error) {
        entry.message = error.message;
        entry.stack = error.stack;
    }

    console.error(JSON.stringify(entry));
}

module.exports = { logError };
