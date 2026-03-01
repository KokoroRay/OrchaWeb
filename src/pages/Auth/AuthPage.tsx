import { useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import {
    FiMail,
    FiLock,
    FiUser,
    FiEye,
    FiEyeOff,
    FiArrowLeft,
    FiLogOut,
    FiHome,
    FiAlertCircle,
    FiCheckCircle,
    FiRefreshCw,
} from 'react-icons/fi';
import logoImage from '../../assets/logos/Logo.png';
import styles from './AuthPage.module.css';

type AuthMode = 'login' | 'register' | 'verify' | 'forgot-password' | 'reset-password';

// Google SVG Icon component
const GoogleIcon = () => (
    <svg className={styles.googleIcon} viewBox="0 0 24 24">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

// Password strength checker
const getPasswordStrength = (password: string): { level: 'weak' | 'medium' | 'strong'; text: string } => {
    if (password.length === 0) return { level: 'weak', text: '' };

    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 'weak', text: 'Yếu' };
    if (score <= 4) return { level: 'medium', text: 'Trung bình' };
    return { level: 'strong', text: 'Mạnh' };
};

export const AuthPage = () => {
    const {
        isAuthenticated,
        isLoading,
        user,
        login,
        register,
        confirmRegistration,
        resendCode,
        loginWithGoogle,
        logout,
        forgotPassword,
        confirmNewPassword,
    } = useAuthContext();

    const navigate = useNavigate();
    const [mode, setMode] = useState<AuthMode>('login');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        verificationCode: '',
        newPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pendingEmail, setPendingEmail] = useState(''); // Email waiting for verification

    const passwordStrength = useMemo(
        () => getPasswordStrength(mode === 'reset-password' ? formData.newPassword : formData.password),
        [formData.password, formData.newPassword, mode]
    );

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    }, []);

    // ====== LOGIN ======
    const handleLogin = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email.trim() || !formData.password) {
            setError('Vui lòng nhập email và mật khẩu');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await login(formData.email, formData.password);
            setSuccess('Đăng nhập thành công!');
            setTimeout(() => navigate('/'), 1000);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi. Vui lòng thử lại.';

            // If user is not confirmed, switch to verification mode
            if (err instanceof Error && err.name === 'UserNotConfirmedException') {
                setPendingEmail(formData.email);
                setMode('verify');
                setError('');
                setSuccess('Tài khoản chưa xác thực. Vui lòng nhập mã xác thực từ email.');
            } else {
                setError(errorMessage);
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [formData.email, formData.password, login, navigate]);

    // ====== REGISTER ======
    const handleRegister = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            setError('Vui lòng nhập họ tên');
            return;
        }
        if (!formData.email.trim()) {
            setError('Vui lòng nhập email');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            setError('Email không hợp lệ');
            return;
        }
        if (formData.password.length < 8) {
            setError('Mật khẩu phải có ít nhất 8 ký tự');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const result = await register(formData.email, formData.password, formData.name);
            if (result.needsConfirmation) {
                setPendingEmail(formData.email);
                setMode('verify');
                setSuccess('Đăng ký thành công! Vui lòng kiểm tra email để lấy mã xác thực.');
            } else {
                setSuccess('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
                setMode('login');
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi khi đăng ký.';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, register]);

    // ====== VERIFY EMAIL ======
    const handleVerify = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.verificationCode.trim()) {
            setError('Vui lòng nhập mã xác thực');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await confirmRegistration(pendingEmail, formData.verificationCode);
            setSuccess('Xác thực thành công! Bạn có thể đăng nhập ngay.');
            setMode('login');
            setFormData(prev => ({ ...prev, verificationCode: '', email: pendingEmail }));
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Mã xác thực không chính xác.';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData.verificationCode, pendingEmail, confirmRegistration]);

    // ====== RESEND CODE ======
    const handleResendCode = useCallback(async () => {
        setError('');
        try {
            await resendCode(pendingEmail);
            setSuccess('Mã xác thực mới đã được gửi đến email của bạn.');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Không thể gửi lại mã.';
            setError(errorMessage);
        }
    }, [pendingEmail, resendCode]);

    // ====== FORGOT PASSWORD ======
    const handleForgotPassword = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.email.trim()) {
            setError('Vui lòng nhập email');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await forgotPassword(formData.email);
            setPendingEmail(formData.email);
            setMode('reset-password');
            setSuccess('Mã xác thực đã được gửi đến email của bạn.');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi.';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData.email, forgotPassword]);

    // ====== RESET PASSWORD ======
    const handleResetPassword = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.verificationCode.trim() || !formData.newPassword) {
            setError('Vui lòng nhập mã xác thực và mật khẩu mới');
            return;
        }
        if (formData.newPassword.length < 8) {
            setError('Mật khẩu mới phải có ít nhất 8 ký tự');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await confirmNewPassword(pendingEmail, formData.verificationCode, formData.newPassword);
            setSuccess('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.');
            setMode('login');
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Đã xảy ra lỗi.';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }, [formData.verificationCode, formData.newPassword, pendingEmail, confirmNewPassword]);

    const switchMode = useCallback((newMode: AuthMode) => {
        setMode(newMode);
        setFormData({ name: '', email: '', password: '', confirmPassword: '', verificationCode: '', newPassword: '' });
        setError('');
        setSuccess('');
        setShowPassword(false);
        setShowConfirmPassword(false);
    }, []);

    // Loading state
    if (isLoading) {
        return (
            <div className={styles.authPage}>
                <div className={styles.bgDecoration}>
                    <div className={styles.bgCircle}></div>
                    <div className={styles.bgCircle}></div>
                    <div className={styles.bgCircle}></div>
                </div>
                <div className={styles.authContainer}>
                    <div className={styles.authCard}>
                        <div className={styles.brandSection}>
                            <img src={logoImage} alt="ORCHA Logo" className={styles.logoImage} />
                            <h1 className={styles.authTitle}>Đang tải...</h1>
                            <p className={styles.authSubtitle}>Vui lòng chờ trong giây lát</p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
                            <div className={styles.btnSpinner} style={{ borderColor: 'rgba(239, 120, 154, 0.3)', borderTopColor: 'var(--color-primary)', width: '40px', height: '40px', borderWidth: '3px' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Authenticated state
    if (isAuthenticated && user) {
        const initials = (user.name || user.email || 'U').charAt(0).toUpperCase();

        return (
            <div className={styles.authPage}>
                <div className={styles.bgDecoration}>
                    <div className={styles.bgCircle}></div>
                    <div className={styles.bgCircle}></div>
                    <div className={styles.bgCircle}></div>
                    <div className={styles.bgCircle}></div>
                </div>
                <div className={styles.authContainer}>
                    <div className={styles.authCard}>
                        <div className={styles.profileSection}>
                            <div className={styles.profileAvatar}>
                                {initials}
                            </div>
                            <h2 className={styles.profileName}>
                                Xin chào, {user.name || user.email}! 👋
                            </h2>
                            <p className={styles.profileEmail}>{user.email}</p>

                            <div className={styles.profileActions}>
                                <Link to="/" className={styles.profileBtnPrimary}>
                                    <FiHome size={18} />
                                    <span>Về trang chủ</span>
                                </Link>
                                <button onClick={logout} className={styles.profileBtnOutline}>
                                    <FiLogOut size={18} />
                                    <span>Đăng xuất</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ====== VERIFICATION CODE FORM ======
    if (mode === 'verify') {
        return (
            <div className={styles.authPage}>
                <div className={styles.bgDecoration}>
                    <div className={styles.bgCircle}></div>
                    <div className={styles.bgCircle}></div>
                    <div className={styles.bgCircle}></div>
                    <div className={styles.bgCircle}></div>
                </div>
                <div className={styles.authContainer}>
                    <div className={styles.authCard}>
                        <div className={styles.brandSection}>
                            <Link to="/" className={styles.logoLink}>
                                <img src={logoImage} alt="ORCHA Logo" className={styles.logoImage} />
                            </Link>
                            <h1 className={styles.authTitle}>Xác thực email</h1>
                            <p className={styles.authSubtitle}>
                                Mã xác thực đã được gửi đến <strong>{pendingEmail}</strong>
                            </p>
                        </div>

                        {error && (
                            <div className={styles.errorMessage}>
                                <FiAlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}
                        {success && (
                            <div className={styles.successMessage}>
                                <FiCheckCircle size={16} />
                                <span>{success}</span>
                            </div>
                        )}

                        <form className={styles.authForm} onSubmit={handleVerify}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel} htmlFor="verify-code">Mã xác thực</label>
                                <div className={styles.inputWrapper}>
                                    <FiLock className={styles.inputIcon} />
                                    <input
                                        id="verify-code"
                                        type="text"
                                        name="verificationCode"
                                        className={styles.formInput}
                                        placeholder="Nhập mã 6 chữ số"
                                        value={formData.verificationCode}
                                        onChange={handleInputChange}
                                        autoComplete="one-time-code"
                                        maxLength={6}
                                        style={{ letterSpacing: '0.3em', textAlign: 'center', fontWeight: 700, fontSize: '1.2rem' }}
                                    />
                                </div>
                            </div>

                            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                                <span className={styles.submitBtnContent}>
                                    {isSubmitting && <div className={styles.btnSpinner}></div>}
                                    <span>Xác thực</span>
                                </span>
                            </button>
                        </form>

                        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                            <button
                                onClick={handleResendCode}
                                className={styles.switchLink}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                            >
                                <FiRefreshCw size={14} />
                                Gửi lại mã xác thực
                            </button>
                        </div>

                        <p className={styles.switchText}>
                            <button className={styles.switchLink} onClick={() => switchMode('login')}>
                                ← Quay lại đăng nhập
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ====== FORGOT PASSWORD FORM ======
    if (mode === 'forgot-password') {
        return (
            <div className={styles.authPage}>
                <div className={styles.bgDecoration}>
                    <div className={styles.bgCircle}></div>
                    <div className={styles.bgCircle}></div>
                    <div className={styles.bgCircle}></div>
                </div>
                <div className={styles.authContainer}>
                    <div className={styles.authCard}>
                        <div className={styles.brandSection}>
                            <Link to="/" className={styles.logoLink}>
                                <img src={logoImage} alt="ORCHA Logo" className={styles.logoImage} />
                            </Link>
                            <h1 className={styles.authTitle}>Quên mật khẩu</h1>
                            <p className={styles.authSubtitle}>
                                Nhập email để nhận mã đặt lại mật khẩu
                            </p>
                        </div>

                        {error && (
                            <div className={styles.errorMessage}>
                                <FiAlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}
                        {success && (
                            <div className={styles.successMessage}>
                                <FiCheckCircle size={16} />
                                <span>{success}</span>
                            </div>
                        )}

                        <form className={styles.authForm} onSubmit={handleForgotPassword}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel} htmlFor="forgot-email">Email</label>
                                <div className={styles.inputWrapper}>
                                    <FiMail className={styles.inputIcon} />
                                    <input
                                        id="forgot-email"
                                        type="email"
                                        name="email"
                                        className={styles.formInput}
                                        placeholder="email@example.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                                <span className={styles.submitBtnContent}>
                                    {isSubmitting && <div className={styles.btnSpinner}></div>}
                                    <span>Gửi mã xác thực</span>
                                </span>
                            </button>
                        </form>

                        <p className={styles.switchText}>
                            <button className={styles.switchLink} onClick={() => switchMode('login')}>
                                ← Quay lại đăng nhập
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ====== RESET PASSWORD FORM ======
    if (mode === 'reset-password') {
        return (
            <div className={styles.authPage}>
                <div className={styles.bgDecoration}>
                    <div className={styles.bgCircle}></div>
                    <div className={styles.bgCircle}></div>
                    <div className={styles.bgCircle}></div>
                </div>
                <div className={styles.authContainer}>
                    <div className={styles.authCard}>
                        <div className={styles.brandSection}>
                            <Link to="/" className={styles.logoLink}>
                                <img src={logoImage} alt="ORCHA Logo" className={styles.logoImage} />
                            </Link>
                            <h1 className={styles.authTitle}>Đặt lại mật khẩu</h1>
                            <p className={styles.authSubtitle}>
                                Nhập mã xác thực và mật khẩu mới cho <strong>{pendingEmail}</strong>
                            </p>
                        </div>

                        {error && (
                            <div className={styles.errorMessage}>
                                <FiAlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}
                        {success && (
                            <div className={styles.successMessage}>
                                <FiCheckCircle size={16} />
                                <span>{success}</span>
                            </div>
                        )}

                        <form className={styles.authForm} onSubmit={handleResetPassword}>
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel} htmlFor="reset-code">Mã xác thực</label>
                                <div className={styles.inputWrapper}>
                                    <FiLock className={styles.inputIcon} />
                                    <input
                                        id="reset-code"
                                        type="text"
                                        name="verificationCode"
                                        className={styles.formInput}
                                        placeholder="Nhập mã 6 chữ số"
                                        value={formData.verificationCode}
                                        onChange={handleInputChange}
                                        autoComplete="one-time-code"
                                        maxLength={6}
                                        style={{ letterSpacing: '0.3em', textAlign: 'center', fontWeight: 700, fontSize: '1.2rem' }}
                                    />
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label className={styles.formLabel} htmlFor="new-password">Mật khẩu mới</label>
                                <div className={styles.inputWrapper}>
                                    <FiLock className={styles.inputIcon} />
                                    <input
                                        id="new-password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="newPassword"
                                        className={styles.formInput}
                                        placeholder="Tối thiểu 8 ký tự"
                                        value={formData.newPassword}
                                        onChange={handleInputChange}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className={styles.togglePassword}
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>

                                {formData.newPassword && (
                                    <div className={styles.passwordStrength}>
                                        <div className={styles.strengthBar}>
                                            <div className={`${styles.strengthFill} ${passwordStrength.level === 'weak' ? styles.strengthWeak :
                                                    passwordStrength.level === 'medium' ? styles.strengthMedium :
                                                        styles.strengthStrong
                                                }`}></div>
                                        </div>
                                        <span className={`${styles.strengthText} ${passwordStrength.level === 'weak' ? styles.strengthTextWeak :
                                                passwordStrength.level === 'medium' ? styles.strengthTextMedium :
                                                    styles.strengthTextStrong
                                            }`}>
                                            Độ mạnh: {passwordStrength.text}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                                <span className={styles.submitBtnContent}>
                                    {isSubmitting && <div className={styles.btnSpinner}></div>}
                                    <span>Đặt lại mật khẩu</span>
                                </span>
                            </button>
                        </form>

                        <p className={styles.switchText}>
                            <button className={styles.switchLink} onClick={() => switchMode('login')}>
                                ← Quay lại đăng nhập
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ====== LOGIN / REGISTER FORM ======
    return (
        <div className={styles.authPage}>
            <div className={styles.bgDecoration}>
                <div className={styles.bgCircle}></div>
                <div className={styles.bgCircle}></div>
                <div className={styles.bgCircle}></div>
                <div className={styles.bgCircle}></div>
            </div>

            <div className={styles.authContainer}>
                <div className={styles.authCard}>
                    {/* Brand Section */}
                    <div className={styles.brandSection}>
                        <Link to="/" className={styles.logoLink}>
                            <img src={logoImage} alt="ORCHA Logo" className={styles.logoImage} />
                        </Link>
                        <h1 className={styles.authTitle}>
                            {mode === 'login' ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
                        </h1>
                        <p className={styles.authSubtitle}>
                            {mode === 'login'
                                ? 'Đăng nhập để tiếp tục trải nghiệm ORCHA'
                                : 'Đăng ký để khám phá thế giới ORCHA'}
                        </p>
                    </div>

                    {/* Tab Switcher */}
                    <div className={styles.tabSwitcher}>
                        <button
                            className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
                            onClick={() => switchMode('login')}
                        >
                            Đăng nhập
                        </button>
                        <button
                            className={`${styles.tab} ${mode === 'register' ? styles.tabActive : ''}`}
                            onClick={() => switchMode('register')}
                        >
                            Đăng ký
                        </button>
                    </div>

                    {/* Error/Success Messages */}
                    {error && (
                        <div className={styles.errorMessage}>
                            <FiAlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className={styles.successMessage}>
                            <FiCheckCircle size={16} />
                            <span>{success}</span>
                        </div>
                    )}

                    {/* Social Login Buttons */}
                    <div className={styles.socialButtons}>
                        <button
                            className={styles.socialBtn}
                            onClick={loginWithGoogle}
                            type="button"
                        >
                            <GoogleIcon />
                            <span>{mode === 'login' ? 'Đăng nhập với Google' : 'Đăng ký với Google'}</span>
                        </button>
                    </div>

                    {/* Divider */}
                    <div className={styles.divider}>
                        <span className={styles.dividerText}>hoặc {mode === 'login' ? 'đăng nhập' : 'đăng ký'} bằng email</span>
                    </div>

                    {/* Auth Form */}
                    <form className={styles.authForm} onSubmit={mode === 'login' ? handleLogin : handleRegister}>
                        {/* Name field (register only) */}
                        {mode === 'register' && (
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel} htmlFor="auth-name">Họ và tên</label>
                                <div className={styles.inputWrapper}>
                                    <FiUser className={styles.inputIcon} />
                                    <input
                                        id="auth-name"
                                        type="text"
                                        name="name"
                                        className={styles.formInput}
                                        placeholder="Nhập họ và tên"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        autoComplete="name"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email field */}
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel} htmlFor="auth-email">Email</label>
                            <div className={styles.inputWrapper}>
                                <FiMail className={styles.inputIcon} />
                                <input
                                    id="auth-email"
                                    type="email"
                                    name="email"
                                    className={styles.formInput}
                                    placeholder="email@example.com"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel} htmlFor="auth-password">Mật khẩu</label>
                            <div className={styles.inputWrapper}>
                                <FiLock className={styles.inputIcon} />
                                <input
                                    id="auth-password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    className={styles.formInput}
                                    placeholder={mode === 'register' ? 'Tối thiểu 8 ký tự' : 'Nhập mật khẩu'}
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                />
                                <button
                                    type="button"
                                    className={styles.togglePassword}
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                >
                                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>

                            {/* Password Strength (register only) */}
                            {mode === 'register' && formData.password && (
                                <div className={styles.passwordStrength}>
                                    <div className={styles.strengthBar}>
                                        <div className={`${styles.strengthFill} ${passwordStrength.level === 'weak' ? styles.strengthWeak :
                                                passwordStrength.level === 'medium' ? styles.strengthMedium :
                                                    styles.strengthStrong
                                            }`}></div>
                                    </div>
                                    <span className={`${styles.strengthText} ${passwordStrength.level === 'weak' ? styles.strengthTextWeak :
                                            passwordStrength.level === 'medium' ? styles.strengthTextMedium :
                                                styles.strengthTextStrong
                                        }`}>
                                        Độ mạnh: {passwordStrength.text}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password (register only) */}
                        {mode === 'register' && (
                            <div className={styles.formGroup}>
                                <label className={styles.formLabel} htmlFor="auth-confirm-password">Xác nhận mật khẩu</label>
                                <div className={styles.inputWrapper}>
                                    <FiLock className={styles.inputIcon} />
                                    <input
                                        id="auth-confirm-password"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        className={styles.formInput}
                                        placeholder="Nhập lại mật khẩu"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className={styles.togglePassword}
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        tabIndex={-1}
                                    >
                                        {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Forgot password (login only) */}
                        {mode === 'login' && (
                            <div className={styles.formExtras}>
                                <label className={styles.rememberMe}>
                                    <input type="checkbox" />
                                    <span>Ghi nhớ đăng nhập</span>
                                </label>
                                <button
                                    type="button"
                                    className={styles.forgotLink}
                                    onClick={() => switchMode('forgot-password')}
                                >
                                    Quên mật khẩu?
                                </button>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                            <span className={styles.submitBtnContent}>
                                {isSubmitting && <div className={styles.btnSpinner}></div>}
                                <span>{mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}</span>
                            </span>
                        </button>

                        {/* Terms (register only) */}
                        {mode === 'register' && (
                            <p className={styles.termsText}>
                                Bằng việc đăng ký, bạn đồng ý với{' '}
                                <a href="#" className={styles.termsLink}>Điều khoản dịch vụ</a>
                                {' '}và{' '}
                                <a href="#" className={styles.termsLink}>Chính sách bảo mật</a>
                                {' '}của ORCHA.
                            </p>
                        )}
                    </form>

                    {/* Switch Mode Text */}
                    <p className={styles.switchText}>
                        {mode === 'login' ? (
                            <>
                                Chưa có tài khoản?{' '}
                                <button className={styles.switchLink} onClick={() => switchMode('register')}>
                                    Đăng ký ngay
                                </button>
                            </>
                        ) : (
                            <>
                                Đã có tài khoản?{' '}
                                <button className={styles.switchLink} onClick={() => switchMode('login')}>
                                    Đăng nhập
                                </button>
                            </>
                        )}
                    </p>

                    {/* Back to Home */}
                    <Link to="/" className={styles.backToHome}>
                        <FiArrowLeft size={16} />
                        <span>Quay về trang chủ</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};
