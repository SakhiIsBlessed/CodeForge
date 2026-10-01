import React, { useState } from 'react';
import {
  User,
  Shield,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Github,
  Linkedin,
  Globe,
  Mail,
  Sliders,
  Eye,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EditorPreferences } from '../types';

interface SettingsPageProps {
  initialTab?: string;
  onNavigate: (path: string) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ initialTab = 'profile', onNavigate }) => {
  const {
    currentUser,
    profile,
    updateProfileData,
    updateUserPassword,
    deleteUserAccount,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'account' | 'security' | 'editor' | 'privacy'>(
    (initialTab as any) || 'profile'
  );

  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [photoURL, setPhotoURL] = useState(profile?.photoURL || '');
  const [githubUrl, setGithubUrl] = useState(profile?.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedinUrl || '');
  const [websiteUrl, setWebsiteUrl] = useState(profile?.websiteUrl || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const clearStatus = () => setStatusMessage(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    clearStatus();
    setSaving(true);
    try {
      await updateProfileData({
        fullName: fullName.trim(),
        username: username.trim().toLowerCase(),
        bio: bio.trim(),
        photoURL: photoURL.trim(),
        githubUrl: githubUrl.trim(),
        linkedinUrl: linkedinUrl.trim(),
        websiteUrl: websiteUrl.trim(),
      });
      setStatusMessage({ type: 'success', text: 'Profile changes saved.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Unable to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearStatus();

    if (newPassword.length < 6) {
      setStatusMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setStatusMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setSaving(true);
    try {
      await updateUserPassword(currentPassword, newPassword);
      setStatusMessage({ type: 'success', text: 'Password successfully changed.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setSaving(false);
    }
  };

  const handleEditorPrefChange = async (updates: Partial<EditorPreferences>) => {
    if (!profile) return;
    const currentPrefs = profile.editorPreferences || {
      theme: 'vs-dark',
      fontSize: 14,
      fontFamily: 'JetBrains Mono',
      tabSize: 2,
      wordWrap: true,
      minimap: false,
      autoSave: true,
      autoSaveDelay: 1500,
    };
    try {
      await updateProfileData({ editorPreferences: { ...currentPrefs, ...updates } });
      setStatusMessage({ type: 'success', text: 'Editor settings saved.' });
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to save settings.' });
    }
  };

  const handleDeleteAccount = async () => {
    clearStatus();
    if (deleteConfirmText !== 'DELETE') {
      setStatusMessage({ type: 'error', text: 'Please type "DELETE" to confirm.' });
      return;
    }
    setSaving(true);
    try {
      await deleteUserAccount(deletePassword);
      onNavigate('/');
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to delete account.' });
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="pb-5 border-b border-[#232733]">
        <h1 className="text-xl font-bold tracking-tight text-white">Settings</h1>
        <p className="mt-1 text-xs text-slate-400">Account security and preferences</p>
      </div>

      {statusMessage && (
        <div
          className={`my-4 flex items-center gap-2 p-2.5 rounded text-xs border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
              : 'bg-rose-950/20 border-rose-800/40 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-1">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'account', label: 'Account', icon: Mail },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'editor', label: 'Editor', icon: Sliders },
            { id: 'privacy', label: 'Privacy', icon: Eye },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  clearStatus();
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded text-xs text-left transition-colors font-mono ${
                  active
                    ? 'bg-[#1b202c] text-[#38bdf8] font-medium border border-[#2d3444]'
                    : 'text-slate-400 hover:bg-[#12151c] hover:text-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="md:col-span-3 rounded-lg border border-[#232733] bg-[#12151c] p-5">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <h2 className="text-sm font-semibold text-slate-100 font-mono">Public Profile</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded border border-[#232733] bg-[#0c0d12] px-3 py-1.5 text-xs text-slate-100 focus:border-[#38bdf8] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Username (@)</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    className="w-full rounded border border-[#232733] bg-[#0c0d12] px-3 py-1.5 text-xs text-slate-100 focus:border-[#38bdf8] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Bio</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  maxLength={500}
                  className="w-full rounded border border-[#232733] bg-[#0c0d12] px-3 py-1.5 text-xs text-slate-100 focus:border-[#38bdf8] focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 border-t border-[#1e2330]">
                <h3 className="text-xs font-semibold text-slate-300 mb-2 font-mono">Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="rounded border border-[#232733] bg-[#0c0d12] px-2.5 py-1 text-xs text-slate-100 focus:border-[#38bdf8] focus:outline-none font-mono"
                  />
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="rounded border border-[#232733] bg-[#0c0d12] px-2.5 py-1 text-xs text-slate-100 focus:border-[#38bdf8] focus:outline-none font-mono"
                  />
                  <input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://portfolio.dev"
                    className="rounded border border-[#232733] bg-[#0c0d12] px-2.5 py-1 text-xs text-slate-100 focus:border-[#38bdf8] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded bg-[#38bdf8] hover:bg-[#0284c7] px-4 py-1.5 text-xs font-semibold text-[#0c0d12] transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'account' && (
            <div className="space-y-5">
              <h2 className="text-sm font-semibold text-slate-100 font-mono">Account Information</h2>
              <div className="rounded border border-[#232733] bg-[#0c0d12] p-3 text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="text-slate-200">{currentUser?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Created:</span>
                  <span className="text-slate-200">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="pt-5 border-t border-[#1e2330]">
                <h3 className="text-xs font-semibold text-rose-400 mb-1 font-mono">Delete Account</h3>
                <p className="text-xs text-slate-400 mb-3">
                  Type <span className="font-mono text-rose-400 font-bold">DELETE</span> to confirm permanent account deletion.
                </p>
                <div className="flex items-center gap-2 max-w-sm">
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="rounded border border-rose-900/50 bg-[#0c0d12] px-2.5 py-1 text-xs text-slate-100 font-mono focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={deleteConfirmText !== 'DELETE' || saving}
                    onClick={handleDeleteAccount}
                    className="rounded bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-40"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} className="space-y-3 max-w-sm">
              <h2 className="text-sm font-semibold text-slate-100 font-mono">Change Password</h2>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded border border-[#232733] bg-[#0c0d12] px-3 py-1.5 text-xs text-slate-100 focus:border-[#38bdf8] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded border border-[#232733] bg-[#0c0d12] px-3 py-1.5 text-xs text-slate-100 focus:border-[#38bdf8] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full rounded border border-[#232733] bg-[#0c0d12] px-3 py-1.5 text-xs text-slate-100 focus:border-[#38bdf8] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="rounded bg-[#38bdf8] hover:bg-[#0284c7] px-3.5 py-1.5 text-xs font-semibold text-[#0c0d12] transition-all disabled:opacity-50"
              >
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}

          {activeTab === 'editor' && (
            <div className="space-y-4 max-w-sm text-xs font-mono">
              <h2 className="text-sm font-semibold text-slate-100">Editor Settings</h2>
              <div>
                <label className="block text-slate-400 mb-1">Font Family</label>
                <select
                  value={profile?.editorPreferences?.fontFamily || 'JetBrains Mono'}
                  onChange={(e) => handleEditorPrefChange({ fontFamily: e.target.value })}
                  className="w-full rounded border border-[#232733] bg-[#0c0d12] px-2.5 py-1 text-slate-200 focus:outline-none"
                >
                  <option value="JetBrains Mono">JetBrains Mono</option>
                  <option value="Fira Code">Fira Code</option>
                  <option value="monospace">Standard Monospace</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Font Size (px)</label>
                  <input
                    type="number"
                    min={11}
                    max={20}
                    value={profile?.editorPreferences?.fontSize || 13}
                    onChange={(e) => handleEditorPrefChange({ fontSize: parseInt(e.target.value) || 13 })}
                    className="w-full rounded border border-[#232733] bg-[#0c0d12] px-2.5 py-1 text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Tab Size</label>
                  <select
                    value={profile?.editorPreferences?.tabSize || 2}
                    onChange={(e) => handleEditorPrefChange({ tabSize: parseInt(e.target.value) || 2 })}
                    className="w-full rounded border border-[#232733] bg-[#0c0d12] px-2.5 py-1 text-slate-200 focus:outline-none"
                  >
                    <option value={2}>2 Spaces</option>
                    <option value={4}>4 Spaces</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-100 font-mono">Privacy</h2>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={profile?.isPublic ?? true}
                  onChange={(e) => updateProfileData({ isPublic: e.target.checked })}
                  className="h-3.5 w-3.5 rounded border-[#232733] bg-[#0c0d12] text-[#38bdf8] focus:ring-0"
                />
                <span>Allow public discovery of profile (/@{profile?.username})</span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
