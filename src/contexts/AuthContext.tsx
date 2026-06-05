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
    handleOAuthCallback,
    type AuthTokens,
} from '../services/cognitoService';
import { userService } from '../services/userService';

interface UserInfo {
    email?: string;
    name?: string;
    sub?: string;
    groups?: string[];
    avatarUrl?: string;
    phone?: string;
    address?: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    isAdmin: boolean;
    user: UserInfo | null;
    tokens: AuthTokens | null;

    // Auth actions
    login: (email: string, password: string) => Promise<{ isAdmin: boolean }>;
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

const decodeJwtPayload = (token: string): Record<string, unknown> => {
    try {
        const parts = token.split('.');
        if (parts.length < 2) return {};

        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
        const decoded = atob(padded);
        return JSON.parse(decoded) as Record<string, unknown>;
    } catch {
        return {};
    }
};

const extractGroupsFromToken = (idToken: string): string[] => {
    const payload = decodeJwtPayload(idToken);
    const rawGroups = payload['cognito:groups'] ?? payload['groups'];

    if (Array.isArray(rawGroups)) {
        return rawGroups.filter((item): item is string => typeof item === 'string').map(group => group.trim()).filter(Boolean);
    }

    if (typeof rawGroups === 'string') {
        return rawGroups.split(',').map(group => group.trim()).filter(Boolean);
    }

    return [];
};

const hasAdminGroup = (groups: string[]): boolean => {
    return groups.some(group => group.toLowerCase() === 'admin');
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [user, setUser] = useState<UserInfo | null>(null);
    const [tokens, setTokens] = useState<AuthTokens | null>(null);
    const [error, setError] = useState<string | null>(null);

    const hydrateUserProfile = async (groups: string[]) => {
        const attrs = await getCurrentUserAttributes();

        let profile = null;
        try {
            profile = await userService.getProfile();
        } catch (error) {
            console.error('Failed to load backend user profile:', error);
        }

        if (attrs || profile) {
            const fallbackName = attrs?.['name'] || attrs?.['email'];
            setUser({
                email: profile?.email ?? attrs?.['email'],
                name: profile?.name ?? fallbackName,
                sub: profile?.userId ?? attrs?.['sub'],
                groups,
                avatarUrl: profile?.avatarUrl ?? attrs?.['picture'],
                phone: profile?.phone ?? attrs?.['phone_number'],
                address: profile?.address,
            });
        }
    };

    // Check for existing session on mount
    useEffect(() => {
        checkSession();

        const handleMessage = async (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            
            if (event.data?.type === 'OAUTH_SUCCESS') {
                const oauthTokens = event.data.tokens;
                setTokens(oauthTokens);
                setIsAuthenticated(true);
                
                const groups = extractGroupsFromToken(oauthTokens.idToken);
                setIsAdmin(hasAdminGroup(groups));
                
                await hydrateUserProfile(groups);
            } else if (event.data?.type === 'OAUTH_ERROR') {
                setError(event.data.error);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const checkSession = async () => {
        try {
            // First, check if we're returning from OAuth (code parameter in URL)
            const urlParams = new URLSearchParams(window.location.search);
            const authCode = urlParams.get('code');
            const errorDesc = urlParams.get('error_description');
            
            if (authCode) {
                // If we are inside a popup, send tokens to parent and close
                if (window.opener && window.opener !== window) {
                    try {
                        const oauthTokens = await handleOAuthCallback(authCode);
                        window.opener.postMessage({ type: 'OAUTH_SUCCESS', tokens: oauthTokens }, window.location.origin);
                        window.close();
                        return;
                    } catch (error) {
                        window.opener.postMessage({ type: 'OAUTH_ERROR', error: error instanceof Error ? error.message : 'Đăng nhập với Google thất bại' }, window.location.origin);
                        window.close();
                        return;
                    }
                }

                // Exchange authorization code for tokens (main window fallback)
                try {
                    const oauthTokens = await handleOAuthCallback(authCode);
                    setTokens(oauthTokens);
                    setIsAuthenticated(true);
                    
                    const groups = extractGroupsFromToken(oauthTokens.idToken);
                    setIsAdmin(hasAdminGroup(groups));

                    await hydrateUserProfile(groups);

                    // Clean URL by removing code parameter
                    window.history.replaceState({}, document.title, window.location.pathname);
                    return;
                } catch (error) {
                    console.error('OAuth callback failed:', error);
                    setError(error instanceof Error ? error.message : 'Đăng nhập với Google thất bại');
                }
            } else if (errorDesc && window.opener && window.opener !== window) {
                window.opener.postMessage({ type: 'OAUTH_ERROR', error: errorDesc }, window.location.origin);
                window.close();
                return;
            }

            // Check for existing Cognito session
            const session = await getCurrentSession();
            if (session) {
                setTokens(session);
                setIsAuthenticated(true);
                const groups = extractGroupsFromToken(session.idToken);
                setIsAdmin(hasAdminGroup(groups));

                await hydrateUserProfile(groups);
            }
        } catch {
            // No valid session
            setIsAuthenticated(false);
            setIsAdmin(false);
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
        const groups = extractGroupsFromToken(result.idToken);
        const admin = hasAdminGroup(groups);
        setIsAdmin(admin);

        await hydrateUserProfile(groups);

        return { isAdmin: admin };
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
        setIsAdmin(false);
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
        isAdmin,
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
