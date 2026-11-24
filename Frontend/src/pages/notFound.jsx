import { Link } from 'react-router-dom';

const NotFoundPage = () => (
    <main className="flex min-h-dvh items-center justify-center bg-[#f3f0e9] px-5 py-10 text-stone-900 dark:bg-[#090909] dark:text-white">
        <section className="w-full max-w-md rounded-2xl border border-stone-200 bg-[#fffefa] p-6 text-center shadow-lg sm:p-8 dark:border-white/10 dark:bg-[#151515]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">404</p>
            <h1 className="mt-3 text-2xl font-semibold">Page not found</h1>
            <p className="mt-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
                That page may have moved or the address may be incorrect.
            </p>
            <Link
                to="/"
                className="mt-6 inline-flex rounded-xl bg-stone-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
                Back to home
            </Link>
        </section>
    </main>
);

export default NotFoundPage;
