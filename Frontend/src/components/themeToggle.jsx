import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

const ThemeToggle = () => {

    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <button
            onClick={toggleTheme}
            type="button"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            className="fixed right-3 top-3 z-100 inline-flex h-10 w-10 items-center justify-center gap-2 rounded-full border border-stone-200/80 bg-white/80 text-xs font-medium tracking-wide text-stone-700 shadow-[0_8px_24px_rgba(15,23,42,0.10)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:border-amber-500/40 hover:shadow-[0_10px_28px_rgba(15,23,42,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:ring-offset-2 sm:right-5 sm:top-5 sm:w-auto sm:px-3.5 dark:border-white/10 dark:bg-[#181715]/85 dark:text-stone-200 dark:shadow-[0_8px_28px_rgba(0,0,0,0.35)] dark:hover:border-amber-300/30 dark:hover:bg-[#22201d] dark:focus-visible:ring-offset-[#090909]"
        >
            <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                className="h-4 w-4 text-amber-600 dark:text-amber-300"
            >
                {theme === 'light' ? (
                    <path
                        d="M16.4 12.2A6.8 6.8 0 0 1 7.8 3.6a6.8 6.8 0 1 0 8.6 8.6Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                ) : (
                    <>
                        <circle cx="10" cy="10" r="3.2" stroke="currentColor" strokeWidth="1.5" />
                        <path
                            d="M10 1.8v1.4m0 13.6v1.4m8.2-8.2h-1.4M3.2 10H1.8m14-5.8-1 1m-9.6 9.6-1 1m11.6 0-1-1m-9.6-9.6-1-1"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                        />
                    </>
                )}
            </svg>
            <span className="hidden sm:inline">{theme === 'light' ? 'Dark' : 'Light'}</span>
        </button>
    );
};

export default ThemeToggle;