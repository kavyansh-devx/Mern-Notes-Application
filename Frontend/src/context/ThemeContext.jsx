import { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext({
    theme: 'light',
    toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {

    const [theme, setTheme] = useState(() => {
        try {
            const savedTheme = window.localStorage.getItem('theme');
            if (savedTheme === 'light' || savedTheme === 'dark') {
                return savedTheme;
            }
        } catch {
            // Storage can be unavailable in private or restricted browsing contexts.
        }
        return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        document.documentElement.style.colorScheme = theme;
        try {
            window.localStorage.setItem('theme', theme);
        } catch {
            // Keep the in-memory theme usable when storage is unavailable.
        }
    }, [theme]);

    function toggleTheme() {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};