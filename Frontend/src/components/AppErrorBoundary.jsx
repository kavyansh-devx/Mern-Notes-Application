import React from 'react';

class AppErrorBoundary extends React.Component {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    render() {
        if (this.state.hasError) {
            return (
                <main className="flex min-h-dvh items-center justify-center bg-[#f3f0e9] px-5 py-10 text-stone-900 dark:bg-[#090909] dark:text-white">
                    <section className="w-full max-w-md rounded-2xl border border-stone-200 bg-[#fffefa] p-6 text-center shadow-lg sm:p-8 dark:border-white/10 dark:bg-[#151515]">
                        <h1 className="text-xl font-semibold">This page ran into a problem</h1>
                        <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
                            Something went wrong while displaying this page. Reload to try again.
                        </p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="mt-6 rounded-xl bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                        >
                            Reload page
                        </button>
                    </section>
                </main>
            );
        }

        return this.props.children;
    }
}

export default AppErrorBoundary;
