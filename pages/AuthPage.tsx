import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { EyeIcon, EyeOffIcon, BookOpenIcon } from '../components/ui/Icons';

const AuthPage: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login, signup, continueAsGuest } = useAuth();
    const navigate = useNavigate();
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotSuccess, setForgotSuccess] = useState(false);
    const [forgotError, setForgotError] = useState('');

    // Real-time validation state
    const [emailTouched, setEmailTouched] = useState(false);
    const [passwordTouched, setPasswordTouched] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setEmailTouched(true);
        setPasswordTouched(true);
        setEmailError(validateEmail(email));
        setPasswordError(validatePassword(password));
        if (validateEmail(email) || validatePassword(password)) {
            setLoading(false);
            return;
        }

        try {
            let success = false;
            if (isLoginView) {
                success = await login(email, password);
                if (!success) setError('Invalid email or password.');
            } else {
                success = await signup(name, email, password, role);
                if (!success) setError('User with this email already exists.');
            }

            if (success) {
                navigate('/dashboard');
            }
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGuestAccess = () => {
        continueAsGuest();
        navigate('/');
    };
    
    const handleForgotSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setForgotError('');
        if (!forgotEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(forgotEmail)) {
            setForgotError('Please enter a valid email address.');
            return;
        }
        setForgotSuccess(true);
    };

    // Real-time validation handlers
    const validateEmail = (value: string) => {
        if (!value) return 'Email is required.';
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return 'Enter a valid email address.';
        return '';
    };
    const validatePassword = (value: string) => {
        if (!value) return 'Password is required.';
        if (value.length < 6) return 'Password must be at least 6 characters.';
        return '';
    };

    // Update error state on change
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
        if (emailTouched) setEmailError(validateEmail(e.target.value));
    };
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (passwordTouched) setPasswordError(validatePassword(e.target.value));
    };

    const DemoCredentials: React.FC = () => (
        <div className="mt-6 p-4 bg-secondary-100 border border-secondary-200 rounded-lg text-sm">
            <h4 className="font-semibold text-secondary-800 mb-2">Demo Accounts (password: "password")</h4>
            <ul className="space-y-1 text-secondary-600">
                <li><strong className="font-medium text-secondary-700">Student:</strong> john@student.edu</li>
                <li><strong className="font-medium text-secondary-700">Teacher:</strong> jane@teacher.edu</li>
                <li><strong className="font-medium text-secondary-700">Admin:</strong> admin@library.edu</li>
            </ul>
        </div>
    );

    // Demo autofill handler
    const handleDemoAutofill = (role: 'student' | 'teacher' | 'admin') => {
        setIsLoginView(true);
        if (role === 'student') setEmail('john@student.edu');
        else if (role === 'teacher') setEmail('jane@teacher.edu');
        else setEmail('admin@library.edu');
        setPassword('password');
        setEmailTouched(false);
        setPasswordTouched(false);
        setEmailError('');
        setPasswordError('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary-100 py-12 px-4 sm:px-6 lg:px-8">
            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" role="dialog" aria-modal="true" aria-labelledby="forgot-title">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative" role="document">
                        <button
                            aria-label="Close forgot password dialog"
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
                            onClick={() => { setShowForgotModal(false); setForgotSuccess(false); setForgotEmail(''); setForgotError(''); }}
                            tabIndex={0}
                        >
                            ×
                        </button>
                        <h3 id="forgot-title" className="text-lg font-semibold mb-4 text-secondary-900">Forgot Password</h3>
                        {forgotSuccess ? (
                            <div className="text-green-600 text-sm" role="status">If an account with that email exists, a reset link has been sent.</div>
                        ) : (
                            <form onSubmit={handleForgotSubmit} className="space-y-4" aria-label="Forgot password form">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    value={forgotEmail}
                                    onChange={e => setForgotEmail(e.target.value)}
                                    required
                                    className="w-full p-3 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
                                    aria-label="Email address for password reset"
                                    aria-required="true"
                                    autoFocus
                                />
                                {forgotError && <div className="text-red-600 text-xs" role="alert">{forgotError}</div>}
                                <button
                                    type="submit"
                                    className="w-full py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    aria-label="Send password reset link"
                                >
                                    Send Reset Link
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}
            {/* End Forgot Password Modal */}
            <div className="max-w-md w-full space-y-8">
                <div>
                    <BookOpenIcon className="mx-auto h-12 w-auto text-primary" aria-hidden="true" />
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-secondary-900" id="auth-title">
                        {isLoginView ? 'Sign in to your account' : 'Create a new account'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-secondary-600">
                        Or{' '}
                        <button onClick={() => setIsLoginView(!isLoginView)} className="font-medium text-primary hover:text-primary-dark" aria-label={isLoginView ? 'Switch to signup' : 'Switch to login'}>
                            {isLoginView ? 'start your journey with us' : 'login to your existing account'}
                        </button>
                    </p>
                </div>
                <div className="bg-white p-8 rounded-2xl shadow-xl">
                    <form className="space-y-6" onSubmit={handleSubmit} aria-labelledby="auth-title" role="form">
                        {!isLoginView && (
                            <input
                                type="text"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full p-3 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
                                aria-label="Full Name"
                                aria-required="true"
                            />
                        )}
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={handleEmailChange}
                            onBlur={() => { setEmailTouched(true); setEmailError(validateEmail(email)); }}
                            required
                            className="w-full p-3 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
                            aria-label="Email address"
                            aria-required="true"
                            aria-invalid={!!emailError}
                            aria-describedby="email-error"
                        />
                        {emailTouched && emailError && (
                            <div id="email-error" className="text-red-600 text-xs mt-1" role="alert">{emailError}</div>
                        )}
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={handlePasswordChange}
                                onBlur={() => { setPasswordTouched(true); setPasswordError(validatePassword(password)); }}
                                required
                                className="w-full p-3 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500"
                                aria-label="Password"
                                aria-required="true"
                                aria-invalid={!!passwordError}
                                aria-describedby="password-error"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                tabIndex={0}
                            >
                                {showPassword ? <EyeOffIcon className="h-5 w-5 text-gray-500" aria-hidden="true" /> : <EyeIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />}
                            </button>
                        </div>
                        {passwordTouched && passwordError && (
                            <div id="password-error" className="text-red-600 text-xs mt-1" role="alert">{passwordError}</div>
                        )}
                        {!isLoginView && (
                            <div className="flex items-center space-x-4" role="radiogroup" aria-label="Select your role">
                                <span className="text-sm font-medium text-secondary-700">I am a:</span>
                                <label className="flex items-center space-x-2">
                                    <input type="radio" name="role" value="student" checked={role === 'student'} onChange={() => setRole('student')} className="h-4 w-4 text-primary focus:ring-primary border-secondary-300" aria-checked={role === 'student'} aria-label="Student" />
                                    <span>Student</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input type="radio" name="role" value="teacher" checked={role === 'teacher'} onChange={() => setRole('teacher')} className="h-4 w-4 text-primary focus:ring-primary border-secondary-300" aria-checked={role === 'teacher'} aria-label="Teacher" />
                                    <span>Teacher</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                    <input type="radio" name="role" value="admin" checked={role === 'admin'} onChange={() => setRole('admin')} className="h-4 w-4 text-primary focus:ring-primary border-secondary-300" aria-checked={role === 'admin'} aria-label="Admin" />
                                    <span>Admin</span>
                                </label>
                            </div>
                        )}
                        {isLoginView && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    className="text-sm text-primary hover:underline focus:outline-none"
                                    onClick={() => setShowForgotModal(true)}
                                    aria-label="Forgot Password"
                                    tabIndex={0}
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        )}
                        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary/50"
                                aria-label={isLoginView ? 'Sign in' : 'Create account'}
                            >
                                {loading ? 'Processing...' : (isLoginView ? 'Sign in' : 'Create account')}
                            </button>
                        </div>
                    </form>
                    <DemoCredentials />
                    <div className="flex flex-col gap-2 mt-4" aria-label="Autofill demo credentials">
                        <button type="button" onClick={() => handleDemoAutofill('student')} className="w-full py-2 px-4 bg-secondary-200 text-secondary-800 rounded hover:bg-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500" aria-label="Autofill Student Demo Credentials">Autofill Student</button>
                        <button type="button" onClick={() => handleDemoAutofill('teacher')} className="w-full py-2 px-4 bg-secondary-200 text-secondary-800 rounded hover:bg-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500" aria-label="Autofill Teacher Demo Credentials">Autofill Teacher</button>
                        <button type="button" onClick={() => handleDemoAutofill('admin')} className="w-full py-2 px-4 bg-secondary-200 text-secondary-800 rounded hover:bg-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500" aria-label="Autofill Admin Demo Credentials">Autofill Admin</button>
                    </div>
                </div>
                 <div className="text-center">
                    <button onClick={handleGuestAccess} className="font-medium text-secondary-600 hover:text-primary transition-colors" aria-label="Continue as Guest" tabIndex={0}>
                        Continue as Guest
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;