import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, RefreshCw, LogOut, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface VerifyEmailPageProps {
  onNavigate: (path: string) => void;
}

export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({ onNavigate }) => {
  const { currentUser, profile, sendVerification, reloadCurrentUser, logout } = useAuth();
  const [cooldown, setCooldown] = useState<number>(0);
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setStatusMessage(null);
    try {
      await sendVerification();
      setCooldown(60); // 60 seconds cooldown
      setStatusMessage('Verification email dispatched. Please check your spam folder if delayed.');
    } catch (err: any) {
      console.error(err);
      setStatusMessage('Unable to resend verification email right now. Please wait a moment.');
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerified = async () => {
    setChecking(true);
    setStatusMessage(null);
    try {
      const updatedUser = await reloadCurrentUser();
      if (updatedUser?.emailVerified) {
        setStatusMessage('Email verified successfully! Redirecting to dashboard...');
        setTimeout(() => onNavigate('/dashboard'), 1000);
      } else {
        setStatusMessage('Email not yet marked as verified. Please click the link in your email.');
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage('Could not verify status. Please try again.');
    } finally {
      setChecking(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    onNavigate('/login');
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
          <Mail className="h-7 w-7" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Verify your email</h1>
        <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto mb-6">
          Please check your inbox and verify your email address to unlock all cloud execution &amp; sharing capabilities.
        </p>

        {currentUser?.email && (
          <div className="mb-6 rounded-xl bg-slate-950/80 border border-slate-800 p-3 text-xs text-slate-300 font-mono">
            {currentUser.email}
          </div>
        )}

        {statusMessage && (
          <div className="mb-5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-3 text-xs text-indigo-300 animate-in fade-in">
            {statusMessage}
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={handleCheckVerified}
            disabled={checking}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-60 active:scale-95"
          >
            {checking ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking Status...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>I've verified my email</span>
              </>
            )}
          </button>

          <button
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all disabled:opacity-50"
          >
            {resending ? (
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
            )}
            <span>
              {cooldown > 0 ? `Resend email in ${cooldown}s` : 'Resend verification email'}
            </span>
          </button>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => onNavigate('/dashboard')}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
