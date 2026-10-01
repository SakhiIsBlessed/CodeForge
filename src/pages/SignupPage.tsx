import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SignupPageProps {
  onNavigate: (path: string) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onNavigate }) => {
  const { signUpWithEmail, signInWithGoogle, isUsernameAvailable } = useAuth();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle');
  const [usernameFeedback, setUsernameFeedback] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!username.trim()) {
      setUsernameStatus('idle');
      setUsernameFeedback('');
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus('checking');
      const res = await isUsernameAvailable(username);
      if (res.available) {
        setUsernameStatus('available');
        setUsernameFeedback('Username available');
      } else {
        setUsernameStatus('unavailable');
        setUsernameFeedback(res.message || 'Username taken or invalid');
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [username]);

  const isNameValid = fullName.trim().length >= 2;
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = password.length >= 6;
  const isPasswordMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isNameValid) {
      setFormError('Please enter your full name (at least 2 characters).');
      return;
    }
    if (usernameStatus !== 'available') {
      setFormError('Please choose an available username.');
      return;
    }
    if (!isEmailValid) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!isPasswordValid) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    if (!isPasswordMatch) {
      setFormError('Passwords do not match.');
      return;
    }
    if (!agreedToTerms) {
      setFormError('You must accept the Terms of Service to register.');
      return;
    }

    setLoading(true);
    try {
      await signUpWithEmail(fullName, username, email, password);
      onNavigate('/verify-email');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setFormError('This email is already in use. Please sign in or use another email.');
      } else {
        setFormError(err.message || 'Unable to register account.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setFormError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      onNavigate('/dashboard');
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setFormError('Google sign-in could not be completed.');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3.25rem)] items-center justify-center p-4 py-8 bg-[#0c0d12]">
      <div className="w-full max-w-md rounded-lg border border-[#232733] bg-[#12151c] p-6 shadow-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#1b202c] border border-[#2d3444] text-[#38bdf8] mb-3">
            <Terminal className="h-4 w-4" />
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white">Create Developer Account</h1>
          <p className="mt-1 text-xs text-slate-400">Join CodeForge to build and run workspaces</p>
        </div>

        {formError && (
          <div className="mb-4 flex items-start gap-2 rounded border border-rose-900/50 bg-rose-950/20 p-2.5 text-xs text-rose-300">
            <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-400 mt-0.5" />
            <p className="leading-tight">{formError}</p>
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-2 rounded border border-[#2d3444] bg-[#161a22] hover:bg-[#1f2533] px-3 py-2 text-xs font-medium text-slate-200 transition-all disabled:opacity-60"
        >
          {googleLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
          ) : (
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#232733]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#12151c] px-2 text-[10px] text-slate-500 font-mono">OR</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ada Lovelace"
                className="w-full rounded border border-[#232733] bg-[#0c0d12] px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:border-[#38bdf8] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Username</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="adalovelace"
                  maxLength={30}
                  className="w-full rounded border border-[#232733] bg-[#0c0d12] px-3 pr-7 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:border-[#38bdf8] focus:outline-none font-mono"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-2">
                  {usernameStatus === 'checking' && <Loader2 className="h-3 w-3 animate-spin text-slate-400" />}
                  {usernameStatus === 'available' && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                  {usernameStatus === 'unavailable' && <XCircle className="h-3 w-3 text-rose-400" />}
                </div>
              </div>
              {usernameFeedback && (
                <p className={`mt-0.5 text-[10px] font-mono ${usernameStatus === 'available' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {usernameFeedback}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@example.com"
              className="w-full rounded border border-[#232733] bg-[#0c0d12] px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:border-[#38bdf8] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded border border-[#232733] bg-[#0c0d12] px-3 pr-7 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:border-[#38bdf8] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded border border-[#232733] bg-[#0c0d12] px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:border-[#38bdf8] focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 rounded border-[#232733] bg-[#0c0d12] text-[#38bdf8] focus:ring-0"
              />
              <span className="text-xs text-slate-400 leading-tight">
                I agree to the{' '}
                <button type="button" onClick={() => onNavigate('/terms')} className="text-[#38bdf8] hover:underline">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" onClick={() => onNavigate('/privacy')} className="text-[#38bdf8] hover:underline">
                  Privacy Policy
                </button>
                .
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full flex items-center justify-center gap-1.5 rounded bg-[#38bdf8] hover:bg-[#0284c7] px-3 py-2 text-xs font-semibold text-[#0c0d12] shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Registering Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-500">
          <span>Already registered? </span>
          <button
            type="button"
            onClick={() => onNavigate('/login')}
            className="text-[#38bdf8] hover:underline font-medium"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};
