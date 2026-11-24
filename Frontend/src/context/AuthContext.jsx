import { createContext, useState , useEffect} from 'react';
import api from '../service/api'
import { getErrorMessage } from '../service/errors'

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState('');

    useEffect(()=>{

        async function checkAuth(){
            try{
                const response = await api.get('/auth/me')
                setUser(response.data.user)
            } catch (err){
                setUser(null);
                if (err.response?.status !== 401) {
                    setAuthError(getErrorMessage(err, 'Unable to verify your session. Please try signing in again.'));
                }
            } finally {
                setLoading(false)
            }
        }

        checkAuth();
    } , [])

    useEffect(() => {
        function handleSessionExpired() {
            setUser(null);
            setAuthError('Your session expired. Please sign in again.');
            setLoading(false);
        }

        window.addEventListener('auth:session-expired', handleSessionExpired);
        return () => window.removeEventListener('auth:session-expired', handleSessionExpired);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                setLoading,
                authError,
                setAuthError
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;