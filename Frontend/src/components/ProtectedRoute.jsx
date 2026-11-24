import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {

    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <main className="flex min-h-dvh items-center justify-center bg-[#f3f0e9] text-sm text-gray-500 dark:bg-[#090909] dark:text-gray-400">
                <p role="status">Checking your session…</p>
            </main>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;