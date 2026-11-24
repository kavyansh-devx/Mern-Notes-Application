const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const MAX_TRACKED_CLIENTS = 10000;
const attemptsByClient = new Map();

const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [client, record] of attemptsByClient) {
        if (now - record.windowStart >= WINDOW_MS) {
            attemptsByClient.delete(client);
        }
    }
}, WINDOW_MS);
cleanupTimer.unref();

function authRateLimit(req, res, next) {
    const client = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    let record = attemptsByClient.get(client);

    if (!record || now - record.windowStart >= WINDOW_MS) {
        if (!record && attemptsByClient.size >= MAX_TRACKED_CLIENTS) {
            for (const [trackedClient, trackedRecord] of attemptsByClient) {
                if (now - trackedRecord.windowStart >= WINDOW_MS) {
                    attemptsByClient.delete(trackedClient);
                }
            }
            if (attemptsByClient.size >= MAX_TRACKED_CLIENTS) {
                return res.status(503).json({ message: 'Sign-in is temporarily unavailable. Please try again shortly.' });
            }
        }
        record = { count: 0, windowStart: now };
        attemptsByClient.set(client, record);
    }

    if (record.count >= MAX_ATTEMPTS) {
        const retryAfter = Math.ceil((WINDOW_MS - (now - record.windowStart)) / 1000);
        res.setHeader('Retry-After', retryAfter);
        return res.status(429).json({ message: 'Too many authentication attempts. Please wait before trying again.' });
    }

    record.count += 1;
    return next();
}

module.exports = authRateLimit;
