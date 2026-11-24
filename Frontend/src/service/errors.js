export function getErrorMessage(error, fallback) {
    const responseMessage = error.response?.data?.message || error.response?.data?.error;
    if (typeof responseMessage === 'string') return responseMessage;
    return error.response
        ? fallback
        : 'Unable to reach the server. Check your connection and try again.';
}
