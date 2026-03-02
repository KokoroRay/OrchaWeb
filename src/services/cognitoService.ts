import {
    CognitoUserPool,
    CognitoUser,
    AuthenticationDetails,
    CognitoUserAttribute,
    type CognitoUserSession,
    type ISignUpResult,
} from 'amazon-cognito-identity-js';

let userPoolInstance: CognitoUserPool | null = null;

function requireEnv(name: 'VITE_COGNITO_USER_POOL_ID' | 'VITE_COGNITO_CLIENT_ID' | 'VITE_COGNITO_DOMAIN' | 'VITE_COGNITO_REDIRECT_URI'): string {
    const value = import.meta.env[name]?.toString().trim();
    if (!value) {
        throw new Error(`Thiếu biến môi trường ${name}. Vui lòng cấu hình trong .env hoặc GitHub Secrets.`);
    }
    return value;
}

function getUserPool(): CognitoUserPool {
    if (userPoolInstance) {
        return userPoolInstance;
    }

    const userPoolId = requireEnv('VITE_COGNITO_USER_POOL_ID');
    const clientId = requireEnv('VITE_COGNITO_CLIENT_ID');

    userPoolInstance = new CognitoUserPool({
        UserPoolId: userPoolId,
        ClientId: clientId,
    });

    return userPoolInstance;
}

export interface AuthTokens {
    idToken: string;
    accessToken: string;
    refreshToken: string;
}

export interface SignUpResult {
    userConfirmed: boolean;
    userSub: string;
}

// ====== SIGN UP ======
export const signUp = (
    email: string,
    password: string,
    name: string
): Promise<SignUpResult> => {
    return new Promise((resolve, reject) => {
        const userPool = getUserPool();
        const attributeList = [
            new CognitoUserAttribute({ Name: 'email', Value: email }),
            new CognitoUserAttribute({ Name: 'name', Value: name }),
        ];

        userPool.signUp(email, password, attributeList, [], (err, result?: ISignUpResult) => {
            if (err) {
                reject(translateCognitoError(err));
                return;
            }
            resolve({
                userConfirmed: result?.userConfirmed ?? false,
                userSub: result?.userSub ?? '',
            });
        });
    });
};

// ====== CONFIRM SIGN UP (verification code) ======
export const confirmSignUp = (email: string, code: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const userPool = getUserPool();
        const cognitoUser = new CognitoUser({
            Username: email,
            Pool: userPool,
        });

        cognitoUser.confirmRegistration(code, true, (err) => {
            if (err) {
                reject(translateCognitoError(err));
                return;
            }
            resolve();
        });
    });
};

// ====== RESEND CONFIRMATION CODE ======
export const resendConfirmationCode = (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const userPool = getUserPool();
        const cognitoUser = new CognitoUser({
            Username: email,
            Pool: userPool,
        });

        cognitoUser.resendConfirmationCode((err) => {
            if (err) {
                reject(translateCognitoError(err));
                return;
            }
            resolve();
        });
    });
};

// ====== SIGN IN ======
export const signIn = (email: string, password: string): Promise<AuthTokens> => {
    return new Promise((resolve, reject) => {
        const userPool = getUserPool();
        const cognitoUser = new CognitoUser({
            Username: email,
            Pool: userPool,
        });

        const authDetails = new AuthenticationDetails({
            Username: email,
            Password: password,
        });

        cognitoUser.authenticateUser(authDetails, {
            onSuccess: (session: CognitoUserSession) => {
                resolve({
                    idToken: session.getIdToken().getJwtToken(),
                    accessToken: session.getAccessToken().getJwtToken(),
                    refreshToken: session.getRefreshToken().getToken(),
                });
            },
            onFailure: (err) => {
                reject(translateCognitoError(err));
            },
        });
    });
};

// ====== SIGN OUT ======
export const signOut = (): void => {
    const userPool = getUserPool();
    const currentUser = userPool.getCurrentUser();
    if (currentUser) {
        currentUser.signOut();
    }
};

// ====== GET CURRENT SESSION ======
export const getCurrentSession = (): Promise<AuthTokens | null> => {
    return new Promise((resolve) => {
        const userPool = getUserPool();
        const currentUser = userPool.getCurrentUser();
        if (!currentUser) {
            resolve(null);
            return;
        }

        currentUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
            if (err || !session || !session.isValid()) {
                resolve(null);
                return;
            }

            resolve({
                idToken: session.getIdToken().getJwtToken(),
                accessToken: session.getAccessToken().getJwtToken(),
                refreshToken: session.getRefreshToken().getToken(),
            });
        });
    });
};

// ====== GET CURRENT USER ATTRIBUTES ======
export const getCurrentUserAttributes = (): Promise<Record<string, string> | null> => {
    return new Promise((resolve) => {
        const userPool = getUserPool();
        const currentUser = userPool.getCurrentUser();
        if (!currentUser) {
            resolve(null);
            return;
        }

        currentUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
            if (err || !session) {
                resolve(null);
                return;
            }

            currentUser.getUserAttributes((attrErr, attributes) => {
                if (attrErr || !attributes) {
                    resolve(null);
                    return;
                }

                const attrs: Record<string, string> = {};
                attributes.forEach((attr) => {
                    attrs[attr.getName()] = attr.getValue();
                });
                resolve(attrs);
            });
        });
    });
};

// ====== FORGOT PASSWORD ======
export const forgotPassword = (email: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const userPool = getUserPool();
        const cognitoUser = new CognitoUser({
            Username: email,
            Pool: userPool,
        });

        cognitoUser.forgotPassword({
            onSuccess: () => {
                resolve();
            },
            onFailure: (err) => {
                reject(translateCognitoError(err));
            },
        });
    });
};

// ====== CONFIRM FORGOT PASSWORD ======
export const confirmForgotPassword = (
    email: string,
    code: string,
    newPassword: string
): Promise<void> => {
    return new Promise((resolve, reject) => {
        const userPool = getUserPool();
        const cognitoUser = new CognitoUser({
            Username: email,
            Pool: userPool,
        });

        cognitoUser.confirmPassword(code, newPassword, {
            onSuccess: () => {
                resolve();
            },
            onFailure: (err) => {
                reject(translateCognitoError(err));
            },
        });
    });
};

// ====== GOOGLE SIGN IN (redirect to Cognito OAuth with Google provider) ======
export const signInWithGoogle = (): void => {
    const domain = requireEnv('VITE_COGNITO_DOMAIN');
    const clientId = requireEnv('VITE_COGNITO_CLIENT_ID');
    const redirectUri = requireEnv('VITE_COGNITO_REDIRECT_URI');

    // Redirect directly to Google (skips Cognito hosted UI)
    const url = `${domain}/oauth2/authorize?identity_provider=Google&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email+openid+phone`;
    window.location.href = url;
};

// ====== ERROR TRANSLATION ======
function translateCognitoError(err: Error & { code?: string }): Error {
    const errorMap: Record<string, string> = {
        'UsernameExistsException': 'Email này đã được đăng ký. Vui lòng đăng nhập hoặc sử dụng email khác.',
        'InvalidPasswordException': 'Mật khẩu không đủ mạnh. Cần ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.',
        'UserNotFoundException': 'Tài khoản không tồn tại. Vui lòng kiểm tra email hoặc đăng ký mới.',
        'NotAuthorizedException': 'Email hoặc mật khẩu không chính xác.',
        'UserNotConfirmedException': 'Tài khoản chưa được xác thực. Vui lòng kiểm tra email để lấy mã xác thực.',
        'CodeMismatchException': 'Mã xác thực không chính xác. Vui lòng thử lại.',
        'ExpiredCodeException': 'Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.',
        'LimitExceededException': 'Bạn đã thử quá nhiều lần. Vui lòng đợi một lát rồi thử lại.',
        'InvalidParameterException': 'Thông tin không hợp lệ. Vui lòng kiểm tra lại.',
        'TooManyRequestsException': 'Quá nhiều yêu cầu. Vui lòng đợi một lát rồi thử lại.',
    };

    const code = err.code || err.name || '';
    const translatedMessage = errorMap[code];

    if (translatedMessage) {
        const newError = new Error(translatedMessage);
        newError.name = code;
        return newError;
    }

    return err;
}
