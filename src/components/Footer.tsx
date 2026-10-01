import React from 'react';

export const Footer: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-[#1e2330] bg-[#0c0d12] text-slate-500 text-xs py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-400">
          <span className="font-semibold text-slate-300">CodeForge</span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span>Online Developer Environment</span>
        </div>

        <div className="flex items-center gap-5 text-slate-400">
          <button onClick={() => onNavigate('/terms')} className="hover:text-slate-200 transition-colors">
            Terms
          </button>
          <button onClick={() => onNavigate('/privacy')} className="hover:text-slate-200 transition-colors">
            Privacy
          </button>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className="text-slate-500 font-mono text-[11px]">© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
};
