const { logError } = require('../utils/logger');

function notFoundHandler(req, res) {
    return res.status(404).json({ message: 'The requested endpoint was not found.' });
}

function errorHandler(error, req, res, next) {
    if (res.headersSent) return next(error);

    const statusCode = Number.isInteger(error.status) ? error.status : error.statusCode;
    const isClientError = Number.isInteger(statusCode) && statusCode >= 400 && statusCode < 500;
    const status = isClientError ? statusCode : 500;
    const message = error.type === 'entity.parse.failed'
        ? 'Request body contains invalid JSON.'
        : error.type === 'entity.too.large'
            ? 'Request body is too large.'
            : isClientError && typeof error.message === 'string'
                ? error.message
                : 'An unexpected server error occurred.';

    if (status >= 500) {
        logError('request failed', error, {
            method: req.method,
            path: req.path
        });
    }

    return res.status(status).json({ message });
}

module.exports = { errorHandler, notFoundHandler };
