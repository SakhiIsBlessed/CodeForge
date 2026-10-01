import React, { useState, useEffect } from 'react';
import { X, Share2, Copy, Check, Trash2, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createShareLink, getProjectShares, revokeShareLink } from '../services/shareService';
import { Project, SharedProject } from '../types';

interface ShareModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ project, isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [permission, setPermission] = useState<'view' | 'fork'>('view');
  const [shares, setShares] = useState<SharedProject[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadShares();
    }
  }, [isOpen, project.projectId]);

  const loadShares = async () => {
    setLoading(true);
    try {
      const activeShares = await getProjectShares(project.projectId);
      setShares(activeShares);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!currentUser) return;
    setCreating(true);
    try {
      const newShare = await createShareLink(project.projectId, currentUser.uid, permission);
      setShares([newShare, ...shares]);
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (shareId: string) => {
    try {
      await revokeShareLink(shareId);
      setShares(shares.filter((s) => s.shareId !== shareId));
    } catch (e) {
      console.error(e);
    }
  };

  const getShareUrl = (shareId: string) => {
    return `${window.location.origin}/shared/${shareId}`;
  };

  const copyToClipboard = (shareId: string) => {
    navigator.clipboard.writeText(getShareUrl(shareId));
    setCopiedId(shareId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0c0d12]/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-lg border border-[#232733] bg-[#12151c] p-6 shadow-2xl font-sans">
        <div className="flex items-center justify-between border-b border-[#232733] pb-3 mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Share Workspace</h2>
            <p className="text-xs text-slate-400">Generate public preview or cloneable links</p>
          </div>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-slate-200">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 font-mono">
              Permission Level
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPermission('view')}
                className={`p-2.5 rounded border text-left transition-colors ${
                  permission === 'view'
                    ? 'border-[#38bdf8] bg-[#1b202c] text-white'
                    : 'border-[#232733] bg-[#0c0d12] text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold text-slate-200">View Only</div>
                <div className="text-[11px] text-slate-400">Visitors can browse &amp; run code</div>
              </button>
              <button
                type="button"
                onClick={() => setPermission('fork')}
                className={`p-2.5 rounded border text-left transition-colors ${
                  permission === 'fork'
                    ? 'border-[#38bdf8] bg-[#1b202c] text-white'
                    : 'border-[#232733] bg-[#0c0d12] text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold text-slate-200">Allow Fork</div>
                <div className="text-[11px] text-slate-400">Visitors can clone into account</div>
              </button>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={creating}
            className="w-full flex items-center justify-center gap-1.5 bg-[#38bdf8] hover:bg-[#0284c7] text-[#0c0d12] text-xs font-semibold py-2 rounded shadow-sm transition-all"
          >
            <LinkIcon className="h-3.5 w-3.5" />
            <span>{creating ? 'Generating Link...' : 'Create Share Link'}</span>
          </button>

          {/* Active Links */}
          <div className="pt-3 border-t border-[#232733]">
            <h3 className="text-xs font-semibold text-slate-300 mb-2 font-mono">
              Active Links ({shares.length})
            </h3>
            {shares.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-1">No active links created yet.</p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {shares.map((s) => (
                  <div
                    key={s.shareId}
                    className="flex items-center justify-between p-2 rounded bg-[#0c0d12] border border-[#232733] text-xs font-mono"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-[#38bdf8] text-[11px] truncate">
                        /shared/{s.shareId}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase">{s.permission}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => copyToClipboard(s.shareId)}
                        className="p-1 rounded bg-[#161a22] hover:bg-[#1f2533] text-slate-300"
                        title="Copy Link"
                      >
                        {copiedId === s.shareId ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleRevoke(s.shareId)}
                        className="p-1 rounded bg-[#161a22] hover:text-rose-400 text-slate-500"
                        title="Revoke"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
