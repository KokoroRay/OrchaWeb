import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
    signIn as cognitoSignIn,
    signUp as cognitoSignUp,
    confirmSignUp as cognitoConfirmSignUp,
    resendConfirmationCode as cognitoResendCode,
    signOut as cognitoSignOut,
    getCurrentSession,
    getCurrentUserAttributes,
    forgotPassword as cognitoForgotPassword,
    confirmForgotPassword as cognitoConfirmForgotPassword,
    signInWithGoogle,
    type AuthTokens,
} from '../services/cognitoService';

interface UserInfo {
    email?: string;
    name?: string;
    sub?: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: UserInfo | null;
    tokens: AuthTokens | null;

    // Auth actions
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, name: string) => Promise<{ needsConfirmation: boolean }>;
    confirmRegistration: (email: string, code: string) => Promise<void>;
    resendCode: (email: string) => Promise<void>;
    loginWithGoogle: () => void;
    logout: () => void;
    forgotPassword: (email: string) => Promise<void>;
    confirmNewPassword: (email: string, code: string, newPassword: string) => Promise<void>;

    error: string | null;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<UserInfo | null>(null);
    const [tokens, setTokens] = useState<AuthTokens | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Check for existing session on mount
    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = async () => {
        try {
            const session = await getCurrentSession();
            if (session) {
                setTokens(session);
                setIsAuthenticated(true);

                const attrs = await getCurrentUserAttributes();
                if (attrs) {
                    setUser({
                        email: attrs['email'],
                        name: attrs['name'] || attrs['email'],
                        sub: attrs['sub'],
                    });
                }
            }
        } catch {
            // No valid session
            setIsAuthenticated(false);
            setUser(null);
            setTokens(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = useCallback(async (email: string, password: string) => {
        setError(null);
        const result = await cognitoSignIn(email, password);
        setTokens(result);
        setIsAuthenticated(true);

        const attrs = await getCurrentUserAttributes();
        if (attrs) {
            setUser({
                email: attrs['email'],
                name: attrs['name'] || attrs['email'],
                sub: attrs['sub'],
            });
        }
    }, []);

    const register = useCallback(async (email: string, password: string, name: string) => {
        setError(null);
        const result = await cognitoSignUp(email, password, name);
        return { needsConfirmation: !result.userConfirmed };
    }, []);

    const confirmRegistration = useCallback(async (email: string, code: string) => {
        setError(null);
        await cognitoConfirmSignUp(email, code);
    }, []);

    const resendCode = useCallback(async (email: string) => {
        setError(null);
        await cognitoResendCode(email);
    }, []);

    const loginWithGoogle = useCallback(() => {
        signInWithGoogle();
    }, []);

    const logout = useCallback(() => {
        cognitoSignOut();
        setIsAuthenticated(false);
        setUser(null);
        setTokens(null);
        setError(null);
    }, []);

    const handleForgotPassword = useCallback(async (email: string) => {
        setError(null);
        await cognitoForgotPassword(email);
    }, []);

    const confirmNewPassword = useCallback(async (email: string, code: string, newPassword: string) => {
        setError(null);
        await cognitoConfirmForgotPassword(email, code, newPassword);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const value: AuthContextType = {
        isAuthenticated,
        isLoading,
        user,
        tokens,
        login,
        register,
        confirmRegistration,
        resendCode,
        loginWithGoogle,
        logout,
        forgotPassword: handleForgotPassword,
        confirmNewPassword,
        error,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
