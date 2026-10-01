import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { CodingAnimation } from '../components/CodingAnimation';

interface LandingPageProps {
  onNavigate: (path: string) => void;
  onOpenNewProject: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenNewProject }) => {
  const { currentUser } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`flex flex-col min-h-screen transition-colors ${isDark ? 'bg-[#0c0d12] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* Hero Section */}
      <section className={`pt-12 pb-16 md:pt-20 md:pb-24 border-b ${isDark ? 'border-[#1e2330]' : 'border-slate-200 bg-white'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            {/* Header kicker */}
            <div className="text-xs font-mono text-[#38bdf8] mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#38bdf8]" />
              <span>Cloud Development Platform</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
              An online IDE with real persistence and zero friction.
            </h1>

            <p className={`mt-4 text-sm sm:text-base leading-relaxed max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Write, transpile, and execute TypeScript, Python, C++, Java, and Web projects directly
              in your browser. Built on real Firestore document persistence and isolated sandbox runtimes.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row items-center gap-3">
              {currentUser ? (
                <button
                  onClick={() => onNavigate('/dashboard')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-[#38bdf8] hover:bg-[#0284c7] text-[#0c0d12] font-semibold text-xs transition-all active:scale-95"
                >
                  <span>Open Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => onNavigate('/signup')}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-[#38bdf8] hover:bg-[#0284c7] text-[#0c0d12] font-semibold text-xs transition-all active:scale-95"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => onNavigate('/login')}
                    className={`w-full sm:w-auto px-5 py-2.5 rounded-md font-medium text-xs border transition-colors ${
                      isDark
                        ? 'bg-[#161a22] hover:bg-[#1f2533] text-slate-300 border-[#2d3444]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                    }`}
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>

            {/* Unboxed Metadata row */}
            <div className="mt-8 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 font-mono">
              <span>Firebase Auth</span>
              <span aria-hidden="true">·</span>
              <span>Firestore Persistence</span>
              <span aria-hidden="true">·</span>
              <span>8+ Languages</span>
              <span aria-hidden="true">·</span>
              <span>Debounced Autosave</span>
            </div>
          </div>

          {/* Interactive Live Coding Animation Component */}
          <div className="mt-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Live Interactive Sandbox Simulation</span>
              </span>
              <span className="text-[11px] font-mono text-slate-500">Click tabs to switch language</span>
            </div>
            <CodingAnimation />
          </div>
        </div>
      </section>

      {/* Feature Matrix */}
      <section className="py-14 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`border-t pt-4 ${isDark ? 'border-[#232733]' : 'border-slate-200'}`}>
            <h3 className={`text-sm font-semibold mb-1 font-mono ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              Firestore Persistence
            </h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Every workspace and file is stored in real Firestore collections with debounced auto-saving.
            </p>
          </div>

          <div className={`border-t pt-4 ${isDark ? 'border-[#232733]' : 'border-slate-200'}`}>
            <h3 className={`text-sm font-semibold mb-1 font-mono ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              Native Transpilation
            </h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              TypeScript code strips types cleanly without syntax errors on valid types, generics, or interfaces.
            </p>
          </div>

          <div className={`border-t pt-4 ${isDark ? 'border-[#232733]' : 'border-slate-200'}`}>
            <h3 className={`text-sm font-semibold mb-1 font-mono ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              Secure Sharing &amp; Forking
            </h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Generate shareable tokens with one-click cloning directly into your personal workspace.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
