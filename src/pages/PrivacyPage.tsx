import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';

export const PrivacyPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
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
          <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Privacy Policy</h1>
            <p className="text-xs text-slate-400">Last updated: October 2026</p>
          </div>
        </div>

        <div className="mt-6 space-y-6 text-xs text-slate-300 leading-relaxed font-sans">
          <section>
            <h2 className="text-sm font-semibold text-slate-100 mb-2">1. Information We Collect</h2>
            <p>
              We collect your email address, display name, username, and account profile details when you register
              via Firebase Authentication. Code snippets, workspaces, and execution logs are stored securely in
              Google Cloud Firestore.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-100 mb-2">2. How We Protect Your Data</h2>
            <p>
              Your private code repositories and files are strictly guarded by Firestore Security Rules. Only you
              and authorized members can access private documents. No third-party ad trackers or sales of personal
              information take place.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-100 mb-2">3. Data Retention &amp; Right to Erasure</h2>
            <p>
              You maintain total authority over your data. Deleting your account will immediately remove your user
              record, associated usernames, project documents, and code files from our live databases.
            </p>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-100 mb-2">4. Contacting Us</h2>
            <p>
              For security disclosures or privacy queries, reach out to the CodeForge developer engineering team.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
