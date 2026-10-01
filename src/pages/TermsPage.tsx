import React from 'react';
import { ArrowLeft, Shield, FileText } from 'lucide-react';

export const TermsPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <button
        onClick={() => onNavigate('/')}
        className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 mb-6 transition-colors font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to CodeForge</span>
      </button>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-xl">
        <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Terms of Service</h1>
            <p className="text-xs text-slate-400">Last updated: October 2026</p>
          </div>
        </div>

        <div className="mt-6 space-y-6 text-xs text-slate-300 leading-relaxed font-sans">
          <section>
            <h2 className="text-sm font-semibold text-slate-100 mb-2">1. Agreement to Terms</h2>
            <p>
              By accessing or using CodeForge, you agree to be bound by these Terms of Service. If you disagree
              with any part of the terms, you may not access our services.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-100 mb-2">2. User Accounts &amp; Authentication</h2>
            <p>
              When you create an account with us using Firebase Authentication, you must provide accurate and
              complete information. You are solely responsible for safeguarding the credentials you use to access
              the service and for any activities or actions under your password.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-100 mb-2">3. Acceptable Use of Sandboxes</h2>
            <p>
              CodeForge provides in-browser and cloud sandboxing capabilities. You agree not to abuse the execution
              infrastructure for cryptocurrency mining, denial-of-service attacks, distributing malicious code, or
              violating third-party intellectual property.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-100 mb-2">4. Intellectual Property</h2>
            <p>
              You retain all ownership rights to any source code, assets, and documentation you upload, edit, or
              create on CodeForge. By sharing projects publicly or via link, you grant viewers the right to view
              or fork your code in accordance with your specified permissions.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-100 mb-2">5. Account Termination &amp; Deletion</h2>
            <p>
              You may delete your account and associated project data at any time via Settings &gt; Account &gt; Delete
              Account. We reserve the right to suspend accounts that breach these Terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
