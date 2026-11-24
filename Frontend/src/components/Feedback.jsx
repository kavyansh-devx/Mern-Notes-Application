export function Feedback({ message, onDismiss }) {
    if (!message) return null;

    return (
        <div
            role="alert"
            className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200"
        >
            <p className="min-w-0 wrap-break-word">{message}</p>
            {onDismiss && (
                <button
                    type="button"
                    onClick={onDismiss}
                    aria-label="Dismiss error"
                    className="shrink-0 rounded px-1 text-lg leading-5 text-red-700 hover:bg-red-100 dark:text-red-200 dark:hover:bg-red-900/50"
                >
                    ×
                </button>
            )}
        </div>
    );
}
